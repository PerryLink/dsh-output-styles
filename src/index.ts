/**
 * `dsh-output-styles`: Claude Code `outputStyles`-equivalent runtime output
 * styles for DeepSeek Harness. The plugin registers a model-visible system
 * prompt section that injects the current session's style body, a `/style`
 * slash command that switches it, per-session persistence over the
 * `output_style` storage domain, and the `style` session projection.
 * @module dsh-output-styles
 */

/** Cordis plugin name; keep this stable after publishing. */
export const name = 'dsh-output-styles'

/**
 * Services that must exist before the plugin applies: the prompt-assembly
 * registry for the injected section, and the storage domain facility for
 * per-session persistence. A composition without a routed kv backend keeps
 * the plugin pending until the storage rows appear (Cordis dependency
 * semantics), instead of racing a parallel mount.
 */
export const inject = ['systemPrompt', 'storageDomain']

export { Config, resolveConfig } from './config.ts'
export type { ResolvedConfig } from './config.ts'
export { apply, DEFAULT_STYLES_DIR, OutputStyleRuntime, STYLE_SECTION_NAME } from './runtime.ts'
export {
  applyStyleEvent,
  EMPTY_STYLE_STATE,
  parseStyleInput,
  STYLE_COMMAND,
} from './style-command.ts'
export type { StyleFoldState, StyleInput } from './style-command.ts'
export {
  loadStyleLibrary,
  STYLE_NAME_RE,
  truncateStyle,
} from './style-library.ts'
export type { OutputStyle } from './style-library.ts'
export {
  OFF,
  OUTPUT_STYLE_DOMAIN,
  STYLE_SOURCE,
  styleSelectionSchema,
  styleSelectionViewSchema,
} from './types.ts'
export type { StyleOption, StyleSelection, StyleSelectionView } from './types.ts'
export { installInvariant, PACKAGE_NAME } from './invariant.ts'
export type { InvariantFacts, InvariantInstaller, InvariantRegistry } from './invariant.ts'
// Type-only re-export: keeps the `style` SessionProjectionMap merge edge in
// the emitted index.d.ts, so consumers receive the projection key's type.
export type * from './types.ts'
