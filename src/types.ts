/**
 * Durable domain vocabulary and type-table merges owned by this package.
 *
 * The selection domain is the single source of the per-session style choice;
 * its record schema doubles as the durable validation boundary. The `style`
 * projection key is declared here (its one home) and re-exported from the
 * package root so consumers receive the `SessionProjectionMap` merge.
 * @module dsh-output-styles/types
 */

import type { SessionId } from '@deepseek-ai/dsh-session'
import { z as zod } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type { OutputRenderer, RenderContext, RenderedText } from './renderers.ts'
import type { StyleFoldState } from './style-command.ts'

/** The reserved switch target that removes a session's selection. */
export const OFF = 'off'

/**
 * Provenance marker stored with every selection record. It states who wrote
 * the record, so a session's style choice can be attributed to this plugin
 * when the log is rebuilt or audited.
 */
export const STYLE_SOURCE = { kind: 'plugin', plugin: 'dsh-output-styles' } as const

/** One durable per-session selection record. */
export const styleSelectionSchema = zod.object({
  /** Selected style name; a name present in the style library at write time. */
  style: zod.string().min(1),
  /** Producer marker; always this plugin's own {@link STYLE_SOURCE}. */
  source: zod.object({
    kind: zod.literal('plugin'),
    plugin: zod.string().min(1),
  }),
})

/** Durable per-session selection record value. */
export interface StyleSelection extends zod.infer<typeof styleSelectionSchema> {}

/**
 * The plugin's storage domain: one `selection` record per session, keyed by
 * the session id. Versioned independently from the session log format.
 */
export const OUTPUT_STYLE_DOMAIN = defineDomain({
  name: 'output_style',
  version: 1,
  tables: {
    selection: domainTable<SessionId, StyleSelection>(styleSelectionSchema),
  },
})

/** One option a client renders for the `style` projection. */
export interface StyleOption {
  /** Switch target accepted by `/style`. */
  value: string
  /** Human-readable style name; the style's own name when no label exists. */
  name: string
  /** One user-facing sentence on what the style does. */
  description: string
  /** Optional guidance on when the style is useful; shown in pickers and listings. */
  whenToUse?: string | undefined
}

/** Whole wire value of the `style` session projection. */
export interface StyleSelectionView {
  /** Every switchable style, in library order. */
  options: StyleOption[]
  /** Current selection, or null when the session has none. */
  currentValue: string | null
}

/** Validates the `style` projection's wire payload before it leaves the host. */
export const styleSelectionViewSchema = zod.object({
  options: zod.array(zod.object({
    value: zod.string().min(1),
    name: zod.string().min(1),
    description: zod.string().min(1),
    whenToUse: zod.string().min(1).optional(),
  })),
  currentValue: zod.string().min(1).nullable(),
})

/**
 * Validates the `style` projection's persisted fold state before it seeds a
 * fold (the `stateSchema` of the registered unit). The state is plain JSON:
 * the settled selection (`current`, null when off) plus the in-flight switch
 * parked by `command/run` and resolved by its paired `command/done`.
 */
export const styleFoldStateSchema = zod.object({
  current: zod.string().min(1).nullable(),
  pending: zod.object({
    commandId: zod.string().min(1),
    target: zod.union([
      zod.object({ name: zod.string().min(1) }),
      zod.object({ off: zod.literal(true) }),
    ]),
  }).nullable(),
})

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    style: StyleSelectionView
  }
  interface SessionProjectionStateMap {
    style: StyleFoldState
  }
}

/** The `ctx.outputRenderers` service: the output.render.* renderer registry. */
export interface OutputRenderersService {
  /** Register a renderer (returns the disposer; caller owns it via ctx.effect). */
  register(renderer: OutputRenderer): () => void
  /** Every registered renderer, deterministic order (priority desc, registration asc). */
  list(): OutputRenderer[]
  /** Renderers matching a request, highest priority first. */
  resolve(context: RenderContext): OutputRenderer[]
  /** Render text through the `output.render/before` waterfall, then rules + matched renderers. */
  renderText(text: string, context: RenderContext): Promise<RenderedText>
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** The output.render.* renderer registry provided by dsh-output-styles. */
    outputRenderers: OutputRenderersService
  }
  interface Events {
    /**
     * Pre-render waterfall: listeners receive `{ text, context }` and MUST
     * call `next()` with their transformed request (or the unchanged one);
     * returning without `next()` short-circuits the render pipeline.
     */
    'output.render/before'(request: { text: string; context: RenderContext }, next: (request: { text: string; context: RenderContext }) => Promise<RenderedText>): Promise<RenderedText>
  }
}
