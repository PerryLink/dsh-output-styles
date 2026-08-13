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
import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-session-projection'
import type { AssembleContext } from '@deepseek-ai/dsh-system-prompt'
import type { Domain, DomainFacility, KvTable } from '@deepseek-ai/dsh-storage-domain'
import { resolveConfig, type Config } from './config.ts'
import { installInvariant, PACKAGE_NAME, type InvariantFacts, type InvariantRegistry } from './invariant.ts'
import { loadStyleLibrary, truncateStyle, type OutputStyle } from './style-library.ts'
import { applyStyleEvent, EMPTY_STYLE_STATE, parseStyleInput, STYLE_COMMAND, type StyleFoldState } from './style-command.ts'
import { OUTPUT_STYLE_DOMAIN, STYLE_SOURCE, styleSelectionViewSchema, type StyleSelection, type StyleSelectionView } from './types.ts'

/** Bundled style-library directory (package `styles/`), the `stylesDir` default. */
export const DEFAULT_STYLES_DIR = fileURLToPath(new URL('../styles/', import.meta.url))

/** Prompt-section name; a fixed registry key a scoped composition could shadow. */
export const STYLE_SECTION_NAME = 'output-style:selection'

/**
 * Resolved style behavior for one session. The session's own durable
 * selection wins; sessions that never selected one fall back to the
 * configured default style, and `''` (the default) means no style at all.
 */
export class OutputStyleRuntime {
  /** Style library in deterministic file order. */
  readonly styles: ReadonlyMap<string, OutputStyle>

  private readonly selection: KvTable<SessionId, StyleSelection>
  private readonly defaultStyle: string
  private readonly maxStyleChars: number
  private readonly truncationMarker: string

  /**
   * @param domain - the opened `output_style` domain; the caller owns `close()`.
   * @param styles - the loaded style library.
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
    this.styles = styles
    this.selection = domain.table('selection')
    this.defaultStyle = options.defaultStyle
    this.maxStyleChars = options.maxStyleChars
    this.truncationMarker = options.truncationMarker
  }

  /** Every switchable style name, in library order. */
  get names(): readonly string[] {
    return [...this.styles.keys()]
  }

  /**
   * Resolve one style by name.
   * @param name - kebab-case style name.
   * @returns the style, or undefined when the library has none.
   */
  get(name: string): OutputStyle | undefined {
    return this.styles.get(name)
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
   * The style in force for a session: its own selection, else the configured
   * default, else none. A stale selection (its style left the library) also
   * degrades to the default.
   * @param sessionId - the session the style is resolved for.
   * @returns the effective style, or undefined when no style applies.
   */
  effectiveStyle(sessionId: SessionId): OutputStyle | undefined {
    const record = this.selectionFor(sessionId)
    const name = record !== undefined ? record.style : this.defaultStyle
    return name === '' ? undefined : this.styles.get(name)
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
   * The `/style` no-argument listing: the current selection plus every
   * switchable name.
   * @param sessionId - the session the listing describes.
   * @returns one line for the command result text.
   */
  listLine(sessionId: SessionId): string {
    const available = this.names.join(', ')
    const current = this.currentName(sessionId)
    return current === ''
      ? `output style off (available: ${available})`
      : `current output style: ${current} (available: ${available})`
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
      throw new Error(`dsh-output-styles: unknown output style "${name}" (available: ${this.names.join(', ')})`)
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
  const currentValue = state.current !== null && runtime.styles.has(state.current) ? state.current : null
  return {
    options: [...runtime.styles.entries()].map(([value, style]) => ({
      value,
      name: style.name,
      description: style.description,
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
  const styles = loadStyleLibrary(
    resolved.stylesDir,
    { compatJson: resolved.compatJson },
    message => { ctx.logger.warn(`dsh-output-styles: ${message}`) },
  )
  if (resolved.defaultStyle !== '' && !styles.has(resolved.defaultStyle)) {
    throw new Error(
      `dsh-output-styles: defaultStyle "${resolved.defaultStyle}" names no style in ${resolved.stylesDir} `
      + `(available: ${[...styles.keys()].join(', ') || 'none'})`,
    )
  }
  const domain = await storageDomain.open(OUTPUT_STYLE_DOMAIN)
  ctx.effect(() => () => domain.close())
  const runtime = new OutputStyleRuntime(domain, styles, resolved)

  ctx.systemPrompt.section({
    name: STYLE_SECTION_NAME,
    order: resolved.sectionOrder,
    text: (context: AssembleContext) => {
      const agent = context.agent
      if (agent === undefined) return ''
      return runtime.promptText(agent.session.id)
    },
  })

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
          if (rawInput.trim() === '') {
            return { kind: 'success', text: runtime.listLine(agent.session.id) }
          }
          return {
            kind: 'error',
            text: `unknown output style "${rawInput.trim()}" (style names are single tokens; available: ${runtime.names.join(', ')})`,
          }
        }
        if (input.kind === 'off') {
          await runtime.turnOff(agent.session)
          return { kind: 'success', text: 'output style off' }
        }
        if (runtime.get(input.name) === undefined) {
          return { kind: 'error', text: `unknown output style "${input.name}" (available: ${runtime.names.join(', ')})` }
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
      schema: styleSelectionViewSchema,
      init: () => EMPTY_STYLE_STATE,
      apply: applyStyleEvent,
      view: state => viewStyleSelection(runtime, state),
      stateVersion: 1,
    })
  })

  // The invariant companion, registered from the main plugin so its checks
  // see the live library and domain. Activates only when an invariant
  // registry is composed.
  ctx.inject(['invariants'], (invariantCtx) => {
    const registry = invariantCtx.get('invariants') as InvariantRegistry | undefined
    if (registry === undefined) return
    const facts: InvariantFacts = {
      knownStyles: () => new Set(runtime.names),
      selectionFor: sessionId => runtime.selectionFor(sessionId),
    }
    registry.register(PACKAGE_NAME, installInvariant(facts))
  })
}
