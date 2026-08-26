/**
 * Coexistence with a core `outputStyles` capability.
 *
 * If DeepSeek Harness ever ships a first-party `outputStyles` feature, this
 * plugin's system-prompt injection would duplicate it. The coexistence policy
 * detects the core capability through its reserved service seam and, when it
 * is present, degrades to the incremental surface this plugin uniquely adds —
 * runtime hot-switch, per-session/per-tool rules, and `/export` — while
 * leaving prompt injection entirely to the core.
 *
 * Detection is a service probe, not a name guess: a core implementation
 * publishes the `outputStyles` service; when that seam is absent the plugin
 * runs standalone (injecting the style section itself).
 * @module dsh-output-styles/coexist
 */

import type { Context } from '@deepseek-ai/cordis'

/** The reserved service name a core `outputStyles` capability publishes. */
export const CORE_OUTPUT_STYLES_SERVICE = 'outputStyles'

/**
 * Probe whether a core `outputStyles` capability is composed.
 * @param ctx - the plugin-scoped context.
 * @returns true when the core `outputStyles` service seam is present.
 */
export function detectCoreOutputStyles(ctx: Context): boolean {
  return ctx.get(CORE_OUTPUT_STYLES_SERVICE) !== undefined
}

/** The coexistence mode: standalone owns injection; degraded leaves it to core. */
export type CoexistenceMode = 'standalone' | 'degraded'

/** A runnable coexistence check: what this plugin contributes under the current composition. */
export interface CoexistenceReport {
  /** Whether a core `outputStyles` capability was detected. */
  readonly coreActive: boolean
  /** The effective coexistence mode. */
  readonly mode: CoexistenceMode
  /** Whether this plugin injects the style system-prompt section. */
  readonly promptInjection: 'enabled' | 'disabled'
  /** The incremental surfaces this plugin always retains. */
  readonly retained: readonly string[]
  /** What this plugin disabled to avoid duplicating the core. */
  readonly disabled: readonly string[]
}

/** The incremental surfaces that survive coexistence in either mode. */
const RETAINED = ['hot-switch', 'rules', 'export'] as const

/**
 * Compute the coexistence report for one composition. Respecting the core is
 * the default (`respectCore` true); a deployment can force standalone mode by
 * setting `respectCoreOutputStyles: false`.
 * @param ctx - the plugin-scoped context.
 * @param respectCore - whether to honor a detected core capability (default true).
 * @returns the coexistence report.
 */
export function coexistenceReport(ctx: Context, respectCore = true): CoexistenceReport {
  const coreActive = respectCore && detectCoreOutputStyles(ctx)
  return {
    coreActive,
    mode: coreActive ? 'degraded' : 'standalone',
    promptInjection: coreActive ? 'disabled' : 'enabled',
    retained: [...RETAINED],
    disabled: coreActive ? ['system-prompt injection'] : [],
  }
}
