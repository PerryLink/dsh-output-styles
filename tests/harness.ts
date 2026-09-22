import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Fiber, Volatile } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import type { CommandExecution } from '@deepseek-ai/dsh-commands'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import StorageService from '@deepseek-ai/dsh-storage'
import * as storageDomain from '@deepseek-ai/dsh-storage-domain'
import * as storageJson from '@deepseek-ai/dsh-storage-json'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
// Type-only: the `settings` service and the Loader's `loader/volatile-update`
// augmentation this harness drives by hand.
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import * as outputStyles from '../src/index.ts'
import type { NormalizedConfig } from '../src/index.ts'

/**
 * Minimal stand-in for the settings forms service (`SettingsForms`), which
 * replaced the removed `SettingsProvider`. It records the page-policy
 * registrations a plugin makes so a test can prove the plugin opts out of the
 * auto-generated card, and it lets a test commit a volatile Config value and
 * dispatch `loader/volatile-update` exactly as the Loader does.
 *
 * The value side is real: volatile fields are genuine `Volatile` references
 * from the plugin's own schema, so "a committed value reaches the running
 * plugin without a remount" is exercised for real rather than stubbed.
 */
export class FakeSettings {
  /** Every page policy passed to `configure`, in registration order. */
  readonly configured: Array<{ auto?: boolean; owner: unknown }> = []

  /** The plugin context whose volatile references this fake commits into. */
  private owner?: Context
  /** The plugin's normalized Config, carrying its live `Volatile` references. */
  private config?: NormalizedConfig

  /**
   * Register the calling plugin instance's page policy.
   * @param presentation - the page policy (`auto: false` opts out of the generated card).
   * @param owner - the plugin fiber the policy belongs to.
   * @returns the disposer, as the real service returns one.
   */
  configure(presentation: { auto?: boolean }, owner: unknown): () => void {
    this.configured.push({ ...presentation, owner })
    return () => {
      const index = this.configured.findIndex(entry => entry.owner === owner)
      if (index >= 0) this.configured.splice(index, 1)
    }
  }

  /**
   * Bind the running plugin instance so {@link update} can commit into it.
   * @param owner - the plugin's own context (its fiber's context).
   * @param config - the plugin's normalized Config carrying the volatile references.
   */
  bind(owner: Context, config: NormalizedConfig): void {
    this.owner = owner
    this.config = config
  }

  /** Whether the plugin has registered a page policy yet. */
  get isConfigured(): boolean {
    return this.configured.length > 0
  }

  /**
   * Commit a new value into one volatile field and dispatch
   * `loader/volatile-update` the way the Loader does — value first, then the
   * event, so a listener always observes the already-committed value. The
   * dispatch is filtered to the plugin's own fiber, exactly as the Loader's
   * is (`fiber.ctx.emit(self, 'loader/volatile-update', paths)`), so the
   * plugin's `ctx.on` listener is the one that runs.
   * @param field - which volatile Config field to commit into.
   * @param value - the next value for that field.
   */
  update(field: 'defaultStyle' | 'rules', value: string | unknown[]): void {
    const owner = this.owner
    const config = this.config
    if (owner === undefined || config === undefined || owner.fiber.uid === null) {
      throw new Error('FakeSettings: no plugin instance is bound yet')
    }
    updateVolatile(config[field] as Volatile<unknown>, createVolatile(value))
    void owner.fiber.ctx.parallel('loader/volatile-update', [[field]])
  }
}

/**
 * Replace one volatile reference's value, mirroring cosmokit's internal
 * `updateVolatile`. The write symbol is the shared cross-copy protocol key, so
 * this reaches a reference created by another copy of the library.
 * @param target - the live reference to commit into.
 * @param source - a reference holding the new value.
 */
function updateVolatile(target: Volatile<unknown>, source: Volatile<unknown>): void {
  const write = (target as unknown as Record<symbol, ((value: unknown) => void) | undefined>)[Symbol.for('cosmokit.volatile.write')]
  if (write === undefined) throw new Error('FakeSettings: the bound value is not a volatile reference')
  write(source.get())
}

/**
 * Build a real `Volatile` reference around one value, without importing
 * cosmokit directly (the write symbol is the documented cross-copy protocol).
 * @param value - the value the reference should hold.
 * @returns a frozen reference whose `get()` returns `value`.
 */
function createVolatile<T>(value: T): Volatile<T> {
  let current: T = value
  return Object.freeze({
    get: () => current,
    [Symbol.for('cosmokit.volatile.write')]: (next: unknown) => { current = next as T },
  }) as Volatile<T>
}

/**
 * Duplicate-strict stand-in for the host invariant registry: like the real
 * service, it throws on a duplicate package name and its returned disposer is
 * the only unregistration path.
 */
export class FakeInvariants {
  /** Currently registered package names. */
  readonly registrations = new Set<string>()
  register(packageName: string, _installer: unknown): () => void {
    if (this.registrations.has(packageName)) throw new Error(`package "${packageName}" is already registered`)
    this.registrations.add(packageName)
    return () => { this.registrations.delete(packageName) }
  }
}

/** A structural `fs` service fake: resolves paths under a temp root and records every write. */
export class FakeFileSystem {
  /** Absolute temp root every written file lands under. */
  readonly root: string
  /** Written contents keyed by the resolved path string. */
  readonly written = new Map<string, string>()

  constructor() {
    this.root = mkdtempSync(join(tmpdir(), 'dsh-output-styles-fs-'))
  }

  /** Resolve a path to a stable target token (the raw path string). */
  async resolve(path: string): Promise<{ path: string }> {
    return { path }
  }

  /** Write one file under the temp root and record the content. */
  async writeText(target: unknown, content: string): Promise<unknown> {
    const path = (target as { path: string }).path
    const filePath = join(this.root, path)
    writeFileSync(filePath, content, 'utf8')
    this.written.set(path, content)
    return {}
  }

  /** Read a written file back (test assertion helper). */
  read(path: string): string {
    return readFileSync(join(this.root, path), 'utf8')
  }

  /** Remove the temp root. */
  dispose(): void {
    rmSync(this.root, { recursive: true, force: true, maxRetries: 3 })
  }
}

/** A structural `approval` service fake: resolves to one fixed outcome and records every ask. */
export class FakeApproval {
  /** Every reason string seen, in ask order. */
  readonly reasons: string[] = []

  /** @param outcome - the outcome every ask resolves to. */
  constructor(readonly outcome: 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable' = 'allowed-once') {}

  /** Record the ask and resolve to the fixed outcome. */
  async request(req: { reason: string }): Promise<'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'> {
    this.reasons.push(req.reason)
    return this.outcome
  }
}

/**
 * A structural `sessionQuery` service fake: records every `readSurface` call
 * and returns one fixed surface-event list, so a test can prove the
 * `/transcript` read path really goes through the service instead of reading
 * the session log directly.
 */
export class FakeSessionQuery {
  /** Every session id passed to `readSurface`, in call order. */
  readonly reads: unknown[] = []

  /** @param events - the surface events every read returns. */
  constructor(private readonly events: readonly SessionEvent[]) {}

  /** Record the read and return the fixed surface. */
  async readSurface(sessionId: unknown): Promise<{ readonly events: readonly SessionEvent[] }> {
    this.reads.push(sessionId)
    return { events: this.events }
  }
}

/** One composed test application: host services from the published alpha packages plus this plugin. */export interface StyleHarness {
  ctx: Context
  /** The plugin's own fiber; disposing it simulates a config hot-reload. */
  pluginFiber: Fiber
  storageRoot: string
  /** The composed settings forms stand-in, when `options.settings` was requested. */
  settings?: FakeSettings
  /** The composed invariant registry, when `options.invariants` was requested. */
  invariants?: FakeInvariants
  /** The composed fs fake, when `options.fs` was requested. */
  fs?: FakeFileSystem
  /** The composed approval fake, when `options.approval` was requested. */
  approval?: FakeApproval
  /** The composed session-query fake, when `options.sessionQuery` was requested. */
  sessionQuery?: FakeSessionQuery
  makeSession(id?: string): Session
  agentFor(session: Session): Agent
  /** Execute one `/style` line against a session through the real command registry. */
  runStyle(session: Session, line: string): Promise<CommandExecution | undefined>
  /** Execute one `/transcript` line against a session through the real command registry. */
  runExport(session: Session, line: string): Promise<CommandExecution | undefined>
  /** Assemble the system prompt for a session and return this plugin's section text. */
  sectionText(session: Session): Promise<string>
  /** Assemble the system prompt for a session and return the assembled section list. */
  sections(session: Session): Promise<{ name: string; text: string }[]>
  /** Dispose the plugin fiber and clean the storage root. */
  dispose(): Promise<void>
}

/**
 * Compose the host capability seam plus this plugin over a fresh context and
 * a temporary json storage root.
 * @param config - plugin configuration (defaults for omitted fields).
 * @param stylesDir - style library directory; the package default when omitted.
 * @param options.settings - also compose the in-memory settings provider.
 * @param options.invariants - also compose the duplicate-strict invariant registry.
 * @param options.fs - also provide the fs fake.
 * @param options.approval - also provide the approval fake.
 * @param options.coreOutputStyles - also provide a fake core `outputStyles` service (coexistence tests).
 * @returns the live harness.
 */
export async function createStyleHarness(
  config: outputStyles.Config = {},
  stylesDir?: string,
  options: { settings?: boolean; invariants?: boolean; fs?: FakeFileSystem; approval?: FakeApproval; coreOutputStyles?: boolean; sessionQuery?: FakeSessionQuery } = {},
): Promise<StyleHarness> {
  const ctx = new Context()
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-output-styles-'))
  await ctx.plugin(SessionStore)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(CommandRuntime)
  await ctx.plugin(StorageService)
  await ctx.plugin(storageJson, { root: storageRoot })
  await ctx.plugin(storageDomain, { backend: 'json' })
  await ctx.plugin(SessionProjectionRegistry)
  let settings: FakeSettings | undefined
  if (options.settings === true) {
    settings = new FakeSettings()
    ctx.provide('settings', settings as never)
  }
  let invariants: FakeInvariants | undefined
  if (options.invariants === true) {
    invariants = new FakeInvariants()
    ctx.provide('invariants', invariants as never)
  }
  const fs = options.fs
  if (fs !== undefined) ctx.provide('fs', fs as never)
  const approval = options.approval
  if (approval !== undefined) ctx.provide('approval', approval as never)
  if (options.coreOutputStyles === true) ctx.provide('outputStyles', {} as never)
  const sessionQuery = options.sessionQuery
  if (sessionQuery !== undefined) ctx.provide('sessionQuery', sessionQuery as never)
  // The plugin receives plain config here — exactly like a direct caller or a
  // test — and normalizes the two editable fields into real `Volatile`
  // references itself. Binding those lets a test commit a value the same way
  // the Loader does.
  const pluginFiber = await ctx.plugin(outputStyles, { stylesDir: stylesDir ?? '', ...config } as never)
  if (settings !== undefined) settings.bind(pluginFiber.ctx, outputStyles.normalizeConfig(pluginFiber.config))

  const makeSession = (id?: string): Session => ctx.sessions.create(
    id === undefined ? undefined : SessionId(id),
  )
  const agentFor = (session: Session): Agent => ({ session } as unknown as Agent)
  const runStyle = (session: Session, line: string): Promise<CommandExecution | undefined> =>
    ctx.commands.execute(agentFor(session), line, [], new AbortController().signal)
  const runExport = (session: Session, line: string): Promise<CommandExecution | undefined> =>
    ctx.commands.execute(agentFor(session), line, [], new AbortController().signal)
  const sectionText = async (session: Session): Promise<string> => {
    const assembly = await ctx.systemPrompt.assemble({ agent: agentFor(session) })
    return assembly.sections.find(section => section.name === outputStyles.STYLE_SECTION_NAME)?.text ?? ''
  }
  const sections = async (session: Session): Promise<{ name: string; text: string }[]> => {
    const assembly = await ctx.systemPrompt.assemble({ agent: agentFor(session) })
    return assembly.sections.map(({ name, text }) => ({ name, text }))
  }

  return {
    ctx,
    pluginFiber,
    storageRoot,
    ...settings === undefined ? {} : { settings },
    ...invariants === undefined ? {} : { invariants },
    ...fs === undefined ? {} : { fs },
    ...approval === undefined ? {} : { approval },
    ...sessionQuery === undefined ? {} : { sessionQuery },
    makeSession,
    agentFor,
    runStyle,
    runExport,
    sectionText,
    sections,
    async dispose(): Promise<void> {
      try {
        await pluginFiber.dispose()
      } finally {
        rmSync(storageRoot, { recursive: true, force: true, maxRetries: 3 })
        fs?.dispose()
      }
    },
  }
}

/**
 * Wait out an asynchronous injection scope's activation, so a test can assert
 * on what that scope registered without racing it.
 * @param expectation - predicate that becomes true once activation happened.
 */
export async function untilSettled(expectation: () => boolean): Promise<void> {
  for (let i = 0; i < 50 && !expectation(); i++) {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/** Write a style library into a fresh temporary directory. */
export function makeStyleDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-output-styles-lib-'))
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(join(dir, file), content, 'utf8')
  }
  return dir
}
