import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Fiber } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import type { CommandExecution } from '@deepseek-ai/dsh-commands'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import StorageService from '@deepseek-ai/dsh-storage'
import * as storageDomain from '@deepseek-ai/dsh-storage-domain'
import * as storageJson from '@deepseek-ai/dsh-storage-json'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import SettingsProvider from '@deepseek-ai/dsh-settings'
import type { SettingsNamespace, SettingsRegisterOptions, SettingsScope } from '@deepseek-ai/dsh-settings'
import type z from '@deepseek-ai/schemastery'
import * as outputStyles from '../src/index.ts'

/**
 * Minimal in-memory settings provider for tests. It records the last
 * registered namespace scope so a test can drive the user-settings layer of
 * the plugin's own `output-style` namespace.
 */
export class FakeSettings extends SettingsProvider {
  readonly writable = true
  /** The most recent namespace scope registered. */
  lastScope?: SettingsScope<{ style: string }>
  /** Every namespace scope registered, keyed by the settings namespace. */
  readonly scopes = new Map<string, SettingsScope<unknown>>()
  private readonly doc: Record<string, unknown> = {}
  protected async load(): Promise<Record<string, unknown>> {
    return this.doc
  }
  protected async persist(ns: SettingsNamespace, section: Record<string, unknown>): Promise<void> {
    this.doc[ns] = section
  }
  override register<T>(ns: SettingsNamespace, schema: z<T>, options?: SettingsRegisterOptions<T>): SettingsScope<T> {
    const scope = super.register(ns, schema, options)
    this.lastScope = scope as unknown as SettingsScope<{ style: string }>
    this.scopes.set(String(ns), scope as unknown as SettingsScope<unknown>)
    return scope
  }
  /** The scope registered for one namespace (e.g. `output-style`). */
  scope(ns: string): SettingsScope<{ style: string }> | undefined {
    return this.scopes.get(ns) as SettingsScope<{ style: string }> | undefined
  }
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

/** One composed test application: host services from the published rc.6 packages plus this plugin. */
export interface StyleHarness {
  ctx: Context
  /** The plugin's own fiber; disposing it simulates a config hot-reload. */
  pluginFiber: Fiber
  storageRoot: string
  /** The composed settings provider, when `options.settings` was requested. */
  settings?: FakeSettings
  /** The composed invariant registry, when `options.invariants` was requested. */
  invariants?: FakeInvariants
  /** The composed fs fake, when `options.fs` was requested. */
  fs?: FakeFileSystem
  /** The composed approval fake, when `options.approval` was requested. */
  approval?: FakeApproval
  makeSession(id?: string): Session
  agentFor(session: Session): Agent
  /** Execute one `/style` line against a session through the real command registry. */
  runStyle(session: Session, line: string): Promise<CommandExecution | undefined>
  /** Execute one `/export` line against a session through the real command registry. */
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
 * @returns the live harness.
 */
export async function createStyleHarness(
  config: outputStyles.Config = {},
  stylesDir?: string,
  options: { settings?: boolean; invariants?: boolean; fs?: FakeFileSystem; approval?: FakeApproval } = {},
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
    await ctx.plugin(FakeSettings)
    settings = ctx.get('settings') as FakeSettings
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
  const pluginFiber = await ctx.plugin(outputStyles, { stylesDir: stylesDir ?? '', ...config })

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

/** Write a style library into a fresh temporary directory. */
export function makeStyleDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-output-styles-lib-'))
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(join(dir, file), content, 'utf8')
  }
  return dir
}
