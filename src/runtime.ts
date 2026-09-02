/**
 * Runtime boundary and Cordis activation: style resolution over the durable
 * selection domain, the model-visible system-prompt section, the `/style`
 * command, the `style` session projection, and the invariant registration.
 *
 * Every registration is an effect — Cordis undoes all of them on unload, so
 * configuration hot-reload replaces the whole plugin without residue.
 * @module dsh-output-styles/runtime
 */

import { fileURLToPath } from 'node:url'
import { watch, type FSWatcher } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-session-projection'
import type { AssembleContext, PromptAssembly } from '@deepseek-ai/dsh-system-prompt'
import type { Domain, DomainFacility, KvTable } from '@deepseek-ai/dsh-storage-domain'
import z from '@deepseek-ai/schemastery'
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { resolveConfig, type Config } from './config.ts'
import { detectCoreOutputStyles } from './coexist.ts'
import { installInvariant, PACKAGE_NAME, type InvariantFacts, type InvariantRegistry } from './invariant.ts'
import { loadStyleLibrary, truncateStyle, type OutputStyle } from './style-library.ts'
import { applyStyleEvent, EMPTY_STYLE_STATE, parseStyleInput, STYLE_COMMAND, type StyleFoldState } from './style-command.ts'
import { OUTPUT_STYLE_DOMAIN, STYLE_SOURCE, styleFoldStateSchema, styleSelectionViewSchema, type StyleSelection, type StyleSelectionView } from './types.ts'
import { BUILTIN_RENDERERS, RendererRegistry, type OutputRenderer, type RenderContext, type RenderedText, type StyleRule } from './renderers.ts'
import { conversationLines, renderExport, sanitizeText } from './export.ts'

/**
 * Session events with an old-host fallback: 0.1.2-alpha.5 renamed the
 * `Session.events` getter to `snapshotEvents()` while the peer floor
 * (>=0.1.0-rc.8) still exposes `.events`.
 */
function readSessionEvents(session: Session): readonly SessionEvent[] {
  if (typeof session.snapshotEvents === 'function') return session.snapshotEvents()
  return (session as unknown as { events: readonly SessionEvent[] }).events
}

/** Bundled style-library directory (package `styles/`), the lowest-priority `stylesDir` entry. */
export const DEFAULT_STYLES_DIR = fileURLToPath(new URL('../styles/', import.meta.url))

/** Prompt-section name; a fixed registry key a scoped composition could shadow. */
export const STYLE_SECTION_NAME = 'output-style:selection'

/** Settings namespace owning the project-level default (`outputStyle`). */
const SETTINGS_NS = 'output-style' as SettingsNamespace

/** Coalescing delay for style-file change events; an internal implementation constant, not a deployment knob. */
const WATCH_DEBOUNCE_MS = 250

/**
 * Resolved style behavior for one session. A forced style (frontmatter
 * `force: true`) wins over everything; otherwise the session's own durable
 * selection wins, sessions that never selected one fall back to the project
 * default (settings `outputStyle`, then the configured default style), and
 * `''` means no style at all.
 */
export class OutputStyleRuntime {
  private library: ReadonlyMap<string, OutputStyle>
  private forcedStyle: OutputStyle | undefined

  private readonly selection: KvTable<SessionId, StyleSelection>
  private readonly defaultStyle: string
  private readonly maxStyleChars: number
  private readonly truncationMarker: string
  private projectDefault: () => string

  /** Style library in deterministic directory/file order. */
  get styles(): ReadonlyMap<string, OutputStyle> {
    return this.library
  }

  /**
   * @param domain - the opened `output_style` domain; the caller owns `close()`.
   * @param styles - the loaded style library (at most one `force` style).
   * @param options - resolved style budget and default.
   */
  constructor(
    private readonly domain: Domain<typeof OUTPUT_STYLE_DOMAIN>,
    styles: ReadonlyMap<string, OutputStyle>,
    options: {
      readonly defaultStyle: string
      readonly maxStyleChars: number
      readonly truncationMarker: string
    },
  ) {
    this.library = styles
    this.selection = domain.table('selection')
    this.defaultStyle = options.defaultStyle
    this.maxStyleChars = options.maxStyleChars
    this.truncationMarker = options.truncationMarker
    this.forcedStyle = [...styles.values()].find(style => style.force)
    this.projectDefault = () => this.defaultStyle
  }

  /** Every switchable style name, in library order. */
  get names(): readonly string[] {
    return [...this.library.keys()]
  }

  /** The forced style's name, or undefined when the library declares none. */
  get forcedName(): string | undefined {
    return this.forcedStyle?.name
  }

  /**
   * Atomically swap the style library (style-file hot reload). The forced
   * style is recomputed; the caller already validated the new library.
   * @param styles - the replacement library.
   */
  reload(styles: ReadonlyMap<string, OutputStyle>): void {
    this.library = styles
    this.forcedStyle = [...styles.values()].find(style => style.force)
  }

  /**
   * Point the project-default resolution at a live source (the settings
   * scope while one is attached, the composition entry otherwise).
   * @param get - thunk returning the project default style name (`''` = none).
   */
  setProjectDefault(get: () => string): void {
    this.projectDefault = get
  }

  /**
   * Resolve one style by name.
   * @param name - style name.
   * @returns the style, or undefined when the library has none.
   */
  get(name: string): OutputStyle | undefined {
    return this.library.get(name)
  }

  /**
   * The session's durable selection record.
   * @param sessionId - the session the selection belongs to.
   * @returns the record, or undefined when the session never selected one.
   */
  selectionFor(sessionId: SessionId): StyleSelection | undefined {
    return this.selection.get(sessionId)
  }

  /**
   * The style in force for a session: a forced library style, else the
   * session's own selection, else the project default, else none. A stale
   * selection or project default (its style left the library) also degrades
   * to none.
   * @param sessionId - the session the style is resolved for.
   * @returns the effective style, or undefined when no style applies.
   */
  effectiveStyle(sessionId: SessionId): OutputStyle | undefined {
    if (this.forcedStyle !== undefined) return this.forcedStyle
    const record = this.selectionFor(sessionId)
    const name = record !== undefined ? record.style : this.projectDefault()
    return name === '' ? undefined : this.library.get(name)
  }

  /**
   * The effective style name, or `''` when no style applies.
   * @param sessionId - the session the style is resolved for.
   * @returns the style name, or `''`.
   */
  currentName(sessionId: SessionId): string {
    return this.effectiveStyle(sessionId)?.name ?? ''
  }

  /**
   * The model-visible style directive for a session: a header naming the
   * style plus its body under the configured budget. The exact text is what
   * the harness logs in `request/header` before dispatch.
   * @param sessionId - the session the directive is built for.
   * @returns the directive, or `''` when no style applies.
   */
  promptText(sessionId: SessionId): string {
    const style = this.effectiveStyle(sessionId)
    if (style === undefined) return ''
    const body = truncateStyle(style.body, this.maxStyleChars, this.truncationMarker)
    return `# Output style: ${style.name}\n\nUse the following output style for every response in this conversation:\n\n${body}`
  }

  /**
   * The `/style` no-argument listing: the current selection followed by one
   * line per style (`name — description`, with `whenToUse` appended when set).
   * @param sessionId - the session the listing describes.
   * @returns the multi-line command result text.
   */
  listLine(sessionId: SessionId): string {
    const current = this.currentName(sessionId)
    const lines = [current === '' ? 'output style off' : `current output style: ${current}`]
    for (const style of this.styles.values()) {
      const whenToUse = style.whenToUse === undefined ? '' : ` (${style.whenToUse})`
      lines.push(`${style.name} — ${style.description}${whenToUse}`)
    }
    return lines.join('\n')
  }

  /**
   * The unknown-name error line, shared by the command handler and the direct
   * {@link OutputStyleRuntime.select} write path.
   * @param name - the rejected switch target.
   * @returns the error text listing every switchable name.
   */
  unknownStyleLine(name: string): string {
    return `unknown output style "${name}" (available: ${this.names.join(', ') || 'none'})`
  }

  /**
   * Durably select a style for a session. The write resolves only after the
   * backend acknowledged it, so a settled command implies a stored record.
   * @param session - the session the selection belongs to.
   * @param name - library style name; unknown names throw.
   * @returns resolution after durability.
   */
  async select(session: Session, name: string): Promise<void> {
    if (this.styles.get(name) === undefined) {
      throw new Error(`dsh-output-styles: ${this.unknownStyleLine(name)}`)
    }
    await this.selection.put(session.id, { style: name, source: STYLE_SOURCE })
  }

  /**
   * Remove a session's selection, restoring the configured default.
   * @param session - the session whose selection is removed.
   * @returns resolution after durability.
   */
  async turnOff(session: Session): Promise<void> {
    await this.selection.delete(session.id)
  }

  /**
   * Close the opened domain (the plugin fiber's async disposer).
   * @returns resolution after the backend unit is released.
   */
  async close(): Promise<void> {
    await this.domain.close()
  }
}

/** Build the `style` projection's wire value for one folded state. */
function viewStyleSelection(runtime: OutputStyleRuntime, state: StyleFoldState): StyleSelectionView {
  // The library-membership guard covers a settled selection whose style later
  // left the library: the view degrades to "no selection" until the session
  // switches again.
  const currentValue = state.current !== null && runtime.styles.has(state.current) ? state.current : null
  return {
    options: [...runtime.styles.entries()].map(([value, style]) => ({
      value,
      name: style.name,
      description: style.description,
      ...style.whenToUse === undefined ? {} : { whenToUse: style.whenToUse },
    })),
    currentValue,
  }
}

/**
 * Apply the plugin to its Cordis context.
 *
 * Declares `storageDomain` via `inject` (ready before `apply`; a composition
 * without a routed kv backend keeps the plugin pending). Bad style files are
 * skipped with warnings; a duplicate or reserved style name, an unreadable
 * style directory, or a `defaultStyle` naming no style fails the load.
 * @param ctx - scoped plugin context; registrations must be owned by its effects.
 * @param config - configuration resolved by Cordis from the exported schema.
 */
export async function apply(ctx: Context, config: Config): Promise<void> {
  // Defense for direct (non-Loader) callers: the declared inject makes this
  // present in any composition, so the guard only reports programmer error.
  const storageDomain = ctx.get('storageDomain') as DomainFacility | undefined
  if (storageDomain === undefined) {
    throw new Error(
      'dsh-output-styles: the "storageDomain" service declared by inject is unavailable — '
      + 'mount the storage facility (see README) or declare the inject',
    )
  }
  const resolved = resolveConfig(config, DEFAULT_STYLES_DIR)
  // Coexistence with a core outputStyles capability: when it is composed (and
  // respectCoreOutputStyles is true), prompt injection belongs to the core —
  // this plugin keeps hot-switch / rules / export and skips the two injections
  // below to avoid double-injecting a style directive.
  const coreActive = resolved.respectCoreOutputStyles && detectCoreOutputStyles(ctx)
  if (coreActive) {
    ctx.logger.info('dsh-output-styles: core outputStyles detected — degrading to hot-switch + rules + export (no prompt injection)')
  }
  const styles = loadStyleLibrary(
    resolved.stylesDirs,
    { compatJson: resolved.compatJson },
    message => { ctx.logger.warn(`dsh-output-styles: ${message}`) },
  )
  if (resolved.defaultStyle !== '' && !styles.has(resolved.defaultStyle)) {
    throw new Error(
      `dsh-output-styles: defaultStyle "${resolved.defaultStyle}" names no style in ${resolved.stylesDirs.join(', ')} `
      + `(available: ${[...styles.keys()].join(', ') || 'none'})`,
    )
  }
  const domain = await storageDomain.open(OUTPUT_STYLE_DOMAIN)
  ctx.effect(() => () => domain.close())
  const runtime = new OutputStyleRuntime(domain, styles, resolved)

  // Style-file hot reload: watch every library directory and atomically swap
  // the runtime library after a coalescing delay. A reload that would break
  // the configured default or otherwise fail keeps the previous library.
  if (resolved.watchStyles) {
    let timer: NodeJS.Timeout | undefined
    const reload = (): void => {
      try {
        const next = loadStyleLibrary(
          resolved.stylesDirs,
          { compatJson: resolved.compatJson },
          message => { ctx.logger.warn(`dsh-output-styles: ${message}`) },
        )
        if (resolved.defaultStyle !== '' && !next.has(resolved.defaultStyle)) {
          ctx.logger.warn(`dsh-output-styles: style file change removed defaultStyle "${resolved.defaultStyle}"; keeping the previous library`)
          return
        }
        runtime.reload(next)
      } catch (error) {
        ctx.logger.warn(`dsh-output-styles: style file change not applied: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    const schedule = (): void => {
      if (timer !== undefined) return
      timer = setTimeout(() => {
        timer = undefined
        reload()
      }, WATCH_DEBOUNCE_MS)
    }
    ctx.effect(() => {
      const watchers: FSWatcher[] = []
      for (const dir of resolved.stylesDirs) {
        try {
          watchers.push(watch(dir, { persistent: false }, () => { schedule() }))
        } catch (error) {
          ctx.logger.warn(`dsh-output-styles: cannot watch style directory ${dir}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      return () => {
        if (timer !== undefined) clearTimeout(timer)
        for (const watcher of watchers) watcher.close()
      }
    })
  }

  // Project-level default over the settings seam: sessions that never
  // selected a style fall back to `output-style.style` (user settings layer,
  // then the composition defaultStyle). Stays inactive until a settings
  // provider is composed; the settings namespace validates names against the
  // live library at write time. The 0.1.2-alpha.2 settings seam registers a
  // namespace schema and returns an owner scope (`get`/`watch`); the removed
  // `installSettingsSection` helper no longer exists.
  ctx.inject(['settings'], (settingsCtx) => {
    const scope = settingsCtx.settings.register(
      SETTINGS_NS,
      z.object({ style: z.string().default('') }),
      {
        base: { style: resolved.defaultStyle },
        validate: (value: { style: string }): void => {
          if (value.style !== '' && !runtime.styles.has(value.style)) {
            throw new Error(
              `dsh-output-styles: settings outputStyle "${value.style}" names no style `
              + `(available: ${[...runtime.styles.keys()].join(', ') || 'none'})`,
            )
          }
        },
      },
    )
    runtime.setProjectDefault(() => scope.get().style)
  })

  if (!coreActive) {
    ctx.systemPrompt.section({
      name: STYLE_SECTION_NAME,
      order: resolved.sectionOrder,
      text: (context: AssembleContext) => {
        const agent = context.agent
        if (agent === undefined) return ''
        const style = runtime.effectiveStyle(agent.session.id)
        // A keep-coding-instructions: false style owns the whole prompt: the
        // assembly waterfall below rebuilds the section list, so this section
        // stays silent instead of double-injecting.
        if (style === undefined || !style.keepCodingInstructions) return ''
        return runtime.promptText(agent.session.id)
      },
    })

    // Claude Code keep-coding-instructions: false — the active style replaces
    // the whole system prompt. The waterfall runs after downstream
    // contributions resolve (tools, contexts, and variables still assemble),
    // then swaps in a single style section.
    ctx.on('system-prompt/assemble', async (_assembly: PromptAssembly, context: AssembleContext, next) => {
      const out = await next()
      const agent = context.agent
      if (agent === undefined) return out
      const style = runtime.effectiveStyle(agent.session.id)
      if (style === undefined || style.keepCodingInstructions) return out
      return {
        ...out,
        sections: [{ name: STYLE_SECTION_NAME, text: runtime.promptText(agent.session.id) }],
      }
    })
  }

  // The /style command: the one write path a web client uses. The child
  // activates only when a command registry is composed (headless assemblies
  // without it stay unaffected). The registry logs `command/run` with the
  // verbatim input, so every switch is reconstructable from the session log.
  ctx.inject(['commands'], (commandCtx) => {
    commandCtx.commands.register({
      name: STYLE_COMMAND,
      description: 'Switch the model output style for this session',
      input: { hint: '<style | off>' },
      handler: async ({ agent, rawInput }) => {
        const input = parseStyleInput(rawInput)
        if (input.kind === 'none') {
          return { kind: 'success', text: runtime.listLine(agent.session.id) }
        }
        if (input.kind === 'off') {
          await runtime.turnOff(agent.session)
          const forced = runtime.forcedName
          return {
            kind: 'success',
            text: forced === undefined
              ? 'output style off'
              : `output style off (style "${forced}" remains in force)`,
          }
        }
        if (runtime.get(input.name) === undefined) {
          return { kind: 'error', text: runtime.unknownStyleLine(input.name) }
        }
        await runtime.select(agent.session, input.name)
        return { kind: 'success', text: `switched to ${input.name}` }
      },
    })
  })

  // The `style` session projection: folds accepted `/style` switches off the
  // session log so the Web UI can show the current style without reading the
  // domain. Activates only when a projection registry is composed.
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register<'style', StyleFoldState>({
      key: 'style',
      stateSchema: styleFoldStateSchema,
      init: () => EMPTY_STYLE_STATE,
      apply: applyStyleEvent,
      wire: {
        viewSchema: styleSelectionViewSchema,
        view: state => viewStyleSelection(runtime, state),
      },
      stateVersion: 2,
    })
  })

  // The invariant companion, registered from the main plugin so its checks
  // see the live library and domain. Activates only when an invariant
  // registry is composed. The registry binds its internal effect to the
  // service context and throws on a duplicate package name, so the returned
  // disposer is the only unregistration path: hold it on this inject scope's
  // fiber.
  ctx.inject(['invariants'], (invariantCtx) => {
    const registry = invariantCtx.get('invariants') as InvariantRegistry | undefined
    if (registry === undefined) return
    const facts: InvariantFacts = {
      knownStyles: () => new Set(runtime.names),
      selectionFor: sessionId => runtime.selectionFor(sessionId),
    }
    invariantCtx.effect(() => registry.register(PACKAGE_NAME, installInvariant(facts)), 'dsh-output-styles: invariant companion')
  })

  // ── output.render.* protocol: the renderer registry service ───────────────
  // Third-party plugins register presenters (id / match rules / pure
  // presenter / priority) through `ctx.outputRenderers`; registration is a
  // caller-owned effect (register() returns the disposer). The built-in
  // concise/step-by-step renderers mirror the two headline styles. Rendering
  // runs the `output.render/before` waterfall first — listeners transform the
  // request and MUST call next() — then applies the rule table and matching
  // renderers; every result keeps the original text beside the rendered one.
  const renderers = new RendererRegistry()
  for (const renderer of BUILTIN_RENDERERS) {
    ctx.effect(() => renderers.register(renderer), `dsh-output-styles: renderer ${renderer.id}`)
  }
  let effectiveRules: readonly StyleRule[] = resolved.rules
  const renderText = (text: string, context: RenderContext): Promise<RenderedText> =>
    ctx.waterfall('output.render/before', { text, context }, async (request: { text: string; context: RenderContext }) =>
      renderers.render(request.text, request.context, effectiveRules))
  const renderService = {
    register: (renderer: OutputRenderer) => renderers.register(renderer),
    list: () => renderers.list(),
    resolve: (context: RenderContext) => renderers.resolve(context),
    renderText,
  }
  ctx.provide('outputRenderers', renderService)

  // Per-session/per-tool rules over the settings seam: the `output-style-rules`
  // namespace carries the rule table (composition `base` + user overrides);
  // rules referencing an unknown renderer fail at write time, and rendering
  // fails loudly at call time if a renderer left the registry.
  ctx.inject(['settings'], (settingsCtx) => {
    const rulesScope = settingsCtx.settings.register(
      'output-style-rules' as SettingsNamespace,
      z.object({
        rules: z.array(z.object({
          match: z.object({
            tool: z.string().required(false),
            contentType: z.union([z.const('text'), z.const('markdown'), z.const('html')]).required(false),
            session: z.string().required(false),
          }).required(false),
          style: z.string().min(1),
          priority: z.number().required(false),
        })).default([]),
      }),
      {
        base: { rules: resolved.rules } as never,
        validate: (value: { rules: ReadonlyArray<{ style: string }> }): void => {
          for (const rule of value.rules) {
            if (rule.style === '' || /[^a-z0-9-]/.test(rule.style)) {
              throw new Error(`dsh-output-styles: rule style ${JSON.stringify(rule.style)} must be a kebab-case renderer id`)
            }
          }
        },
      },
    )
    const adoptRules = (next: { rules: readonly StyleRule[] }): void => {
      effectiveRules = next.rules
    }
    adoptRules(rulesScope.get() as unknown as { rules: readonly StyleRule[] })
    rulesScope.watch(next => { adoptRules(next as unknown as { rules: readonly StyleRule[] }) })
  })

  // The /export command: renders the current session's message surface to
  // Markdown or sanitized HTML through the renderer pipeline. The document
  // itself is the visible artifact; the original lines are the session log
  // the export was projected from — rendered and original stay reconstructable.
  // `--save <path>` additionally writes the sanitized document to that
  // workspace path, gated by the approval service and the fs service (both
  // optional; a missing approval service denies the write, a missing fs
  // service fails loudly).
  if (resolved.enableExport) {
    ctx.inject(['commands'], (commandCtx) => {
      commandCtx.commands.register({
        name: 'export',
        description: 'Export this session as Markdown or HTML (renderer-aware)',
        input: { hint: '[markdown|html] [--renderer=<id>] [--save <path>]' },
        handler: async ({ agent, rawInput, signal }) => {
          const input = parseExportInput(rawInput)
          if (input.kind === 'error') {
            return { kind: 'error', text: 'usage: /export [markdown|html] [--renderer=<id>] [--save <path>]' }
          }
          const lines = conversationLines(readSessionEvents(agent.session))
          const rules: StyleRule[] = input.renderer === undefined
            ? [...effectiveRules]
            : [{ match: {}, style: input.renderer, priority: 0 }]
          const document = renderExport(renderers, lines, input.format, rules)
          if (input.save === undefined) {
            return { kind: 'success', text: document.text }
          }
          // The disk path sanitizes the rendered document before writing and
          // writes only after the approval service grants it.
          const saved = await saveExportFile(
            ctx.get('fs') as ExportFileSystem | undefined,
            ctx.get('approval') as ExportApproval | undefined,
            agent,
            input.save,
            sanitizeText(document.text),
            signal,
          )
          if (saved.kind === 'error') return { kind: 'error', text: saved.text }
          return { kind: 'success', text: `saved ${input.format} export to ${saved.path}` }
        },
      })
    })
  }
}

/** Parsed `/export` invocation. */
type ExportInput = {
  kind: 'ok'
  format: 'markdown' | 'html'
  renderer?: string
  save?: string
} | { kind: 'error' }

/** Parse `/export [markdown|html] [--renderer=<id>] [--save <path>]` from the raw command input. */
export function parseExportInput(rawInput: unknown): ExportInput {
  const raw = String(rawInput ?? '').trim()
  const parts = raw === '' ? [] : raw.split(/\s+/)
  let format: 'markdown' | 'html' = 'markdown'
  let renderer: string | undefined
  let save: string | undefined
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]
    if (part === undefined) continue
    if (part === 'markdown' || part === 'md') {
      format = 'markdown'
      continue
    }
    if (part === 'html') {
      format = 'html'
      continue
    }
    const rendererMatch = /^--renderer=([a-z0-9][a-z0-9-]*)$/.exec(part)
    if (rendererMatch !== null) {
      renderer = rendererMatch[1]
      continue
    }
    const saveInline = /^--save=(.+)$/.exec(part)
    if (saveInline !== null) {
      save = saveInline[1]
      continue
    }
    if (part === '--save') {
      const next = parts[index + 1]
      if (next === undefined || next === '') return { kind: 'error' }
      save = next
      index += 1
      continue
    }
    return { kind: 'error' }
  }
  return {
    kind: 'ok',
    format,
    ...renderer === undefined ? {} : { renderer },
    ...save === undefined ? {} : { save },
  }
}

/** Approval outcome vocabulary, structural (mirrors the approval seam without importing it). */
type ApprovalOutcome = 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'

/** Structural slice of the DSH filesystem service the save path uses. */
export interface ExportFileSystem {
  resolve(path: string, opts?: { cwd?: string; signal?: AbortSignal }): Promise<unknown>
  writeText(target: unknown, content: string): Promise<unknown>
}

/** Structural slice of the DSH approval service the save path uses. */
export interface ExportApproval {
  request(request: { agent: unknown; toolName: string; reason: string; signal?: AbortSignal }): Promise<ApprovalOutcome>
}

/** Error codes of the `/export --save` path; each is a stable machine-readable label. */
export type ExportSaveErrorCode = 'fs-unavailable' | 'approval-unavailable' | 'approval-denied' | 'approval-cancelled'

/** Result of a `/export --save` attempt: the written path or a structured failure. */
export type ExportSaveResult =
  | { readonly kind: 'written'; readonly path: string }
  | { readonly kind: 'error'; readonly code: ExportSaveErrorCode; readonly text: string }

/**
 * Write one rendered export document to a workspace path after user approval.
 * Fail-closed: a missing approval service, a rejected/cancelled/unavailable
 * decision, or a throwing approval channel all deny the write; a missing fs
 * service fails loudly with a structured error. The caller already sanitized
 * `content` before this write.
 * @param fs - the fs service (`ctx.get('fs')`), or undefined when none is composed.
 * @param approval - the approval service (`ctx.get('approval')`), or undefined when none is composed.
 * @param agent - the agent whose session the export belongs to (routes the approval).
 * @param path - the workspace path to write.
 * @param content - the sanitized document text.
 * @param signal - the command's abort signal, forwarded to approval and resolve.
 * @returns the written path, or a structured failure.
 */
export async function saveExportFile(
  fs: ExportFileSystem | undefined,
  approval: ExportApproval | undefined,
  agent: unknown,
  path: string,
  content: string,
  signal?: AbortSignal,
): Promise<ExportSaveResult> {
  if (approval === undefined) {
    return {
      kind: 'error',
      code: 'approval-unavailable',
      text: 'dsh-output-styles: /export --save requires an approval service (compose @deepseek-ai/dsh-user-approval); nothing was written',
    }
  }
  let outcome: ApprovalOutcome
  try {
    outcome = await approval.request({
      agent,
      toolName: 'export',
      reason: `write the exported document to ${path}`,
      ...signal === undefined ? {} : { signal },
    })
  } catch {
    // An approval channel that cannot answer is an unanswerable ask: fail closed.
    outcome = 'unavailable'
  }
  switch (outcome) {
    case 'allowed-once': break
    case 'rejected':
      return {
        kind: 'error',
        code: 'approval-denied',
        text: 'dsh-output-styles: /export --save was rejected; nothing was written',
      }
    case 'cancelled':
      return {
        kind: 'error',
        code: 'approval-cancelled',
        text: 'dsh-output-styles: /export --save was cancelled; nothing was written',
      }
    default:
      // 'unavailable' plus any out-of-vocabulary answer fail closed (never write).
      return {
        kind: 'error',
        code: 'approval-unavailable',
        text: 'dsh-output-styles: /export --save approval is unavailable; nothing was written',
      }
  }
  if (fs === undefined) {
    return {
      kind: 'error',
      code: 'fs-unavailable',
      text: 'dsh-output-styles: /export --save requires an fs service (compose @deepseek-ai/dsh-fs); nothing was written',
    }
  }
  const target = await fs.resolve(path, signal === undefined ? undefined : { signal })
  await fs.writeText(target, content)
  return { kind: 'written', path }
}
