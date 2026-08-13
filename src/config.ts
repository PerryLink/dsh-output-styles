/**
 * Serializable configuration, schema, and direct-call defaults.
 *
 * Every tunable lives here: a deployment changes behavior through
 * `cordis.yml`, never by editing source. The schema is validated by the
 * harness Loader while the plugin loads; invalid configuration fails the
 * load with an actionable error.
 * @module dsh-output-styles/config
 */

import z from '@deepseek-ai/schemastery'
import { resolve } from 'node:path'

/** Plugin configuration supplied by the profile composition. */
export interface Config {
  /**
   * Directory holding the style library (`*.md`, and with {@link Config.compatJson}
   * also `*.json`). The empty string selects the package's bundled `styles/`
   * directory; any other value resolves against the process working directory.
   */
  stylesDir?: string
  /** Style-body budget in characters; longer bodies are truncated at the budget with a marker. */
  maxStyleChars?: number
  /**
   * Style injected into sessions that never selected one. The empty string
   * (default) means new sessions get no style — the session's own selection,
   * made through `/style`, is always what wins for a session that has one.
   */
  defaultStyle?: string
  /** Load Claude Code `outputStyles` JSON entries (`{ name, description, prompt }`) beside Markdown styles. */
  compatJson?: boolean
  /** Order of the injected system-prompt section (90: after the persona, before tool guidance at 100–199). */
  sectionOrder?: number
  /** Marker appended at the truncation point when a style body exceeds {@link Config.maxStyleChars}. */
  truncationMarker?: string
}

/** Configuration after defaults have been resolved. */
export interface ResolvedConfig {
  /** Absolute directory holding the style library. */
  stylesDir: string
  /** Style-body budget in characters; at least 1. */
  maxStyleChars: number
  /** Style injected into sessions that never selected one; `''` means none. */
  defaultStyle: string
  /** Whether Claude Code `outputStyles` JSON entries are loaded. */
  compatJson: boolean
  /** Order of the injected system-prompt section; a finite number. */
  sectionOrder: number
  /** Marker appended at the truncation point. */
  truncationMarker: string
}

/** Loader-visible configuration schema and defaults. */
export const Config: z<Config> = z.object({
  stylesDir: z.string().default(''),
  maxStyleChars: z.number().min(1).default(4000),
  defaultStyle: z.string().default(''),
  compatJson: z.boolean().default(true),
  sectionOrder: z.number().default(90),
  truncationMarker: z.string().default('\n\n[style truncated]'),
})

/**
 * Resolve the same defaults for direct callers that bypass the Cordis Loader,
 * and fail loud on values the schema cannot express (a non-finite section
 * order).
 * @param config - Partial serialized configuration.
 * @param defaultStylesDir - Absolute directory used when `stylesDir` is empty.
 * @returns Configuration with every default applied.
 */
export function resolveConfig(config: Config, defaultStylesDir: string): ResolvedConfig {
  const maxStyleChars = config.maxStyleChars ?? 4000
  if (!Number.isFinite(maxStyleChars) || maxStyleChars < 1) {
    throw new Error(`dsh-output-styles: maxStyleChars must be a finite number ≥ 1, got ${String(config.maxStyleChars)}`)
  }
  const sectionOrder = config.sectionOrder ?? 90
  if (!Number.isFinite(sectionOrder)) {
    throw new Error(`dsh-output-styles: sectionOrder must be a finite number, got ${String(config.sectionOrder)}`)
  }
  const stylesDir = config.stylesDir === undefined || config.stylesDir === ''
    ? defaultStylesDir
    : resolve(config.stylesDir)
  return {
    stylesDir,
    maxStyleChars,
    defaultStyle: config.defaultStyle ?? '',
    compatJson: config.compatJson ?? true,
    sectionOrder,
    truncationMarker: config.truncationMarker ?? '\n\n[style truncated]',
  }
}
