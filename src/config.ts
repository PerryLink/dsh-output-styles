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
import { createVolatile, type Volatile } from '@deepseek-ai/cosmokit'
import { resolve } from 'node:path'

/** One per-session/per-tool style rule: match facts + the renderer to apply. */
export interface StyleRuleConfig {
  /** Match facts; an empty object matches every render request. */
  match: {
    /** Tool name or '*' (omitted = any tool). */
    tool?: string
    /** Content type (omitted = any). */
    contentType?: 'text' | 'markdown' | 'html'
    /** Exact session id (omitted = any session) — the per-session axis. */
    session?: string
  }
  /** Renderer id to apply; built-in ids mirror the style names (concise, step-by-step). */
  style: string
  /** Higher priority wins; ties break by rule order (earlier first). */
  priority?: number
}

/**
 * Plugin configuration supplied by the profile composition.
 *
 * {@link Config.defaultStyle} and {@link Config.rules} are declared
 * `volatile()`, so on a host that composes the settings forms seam they are
 * live references: edit them from the Web **Plugins** page and the running
 * plugin picks the new value up through `loader/volatile-update` without a
 * remount. Read them with `.get()`; the value is an immutable snapshot and is
 * only replaced by the owning runtime.
 *
 * This is the schema's *input* shape — what a composition (or a form write)
 * supplies. {@link ResolvedConfig} is what the runtime consumes, after
 * defaults and `volatile()` wrapping.
 */
export interface Config {
  /**
   * Directories holding the style library (`*.md`, and with {@link Config.compatJson}
   * also `*.json`). Each entry resolves against the process working directory.
   * Later directories override earlier ones on a same-named style; the bundled
   * `styles/` directory participates as the lowest-priority entry unless
   * {@link Config.includeBuiltins} is false. An empty list means the bundled
   * library only (or none, with `includeBuiltins: false`). A bare string is
   * accepted as a single-directory list.
   */
  stylesDir?: string | string[]
  /** Style-body budget in characters; longer bodies are truncated at the budget with a marker. */
  maxStyleChars?: number
  /**
   * Style injected into sessions that never selected one. The empty string
   * (default) means new sessions get no style — the session's own selection,
   * made through `/style`, is always what wins for a session that has one.
   *
   * Optional, and acceptably supplied as a plain string: a composition (or a
   * direct caller) may omit it or pass a literal, and
   * {@link normalizeConfig} turns it into a stable reference on the way in.
   * A value the schema produced is already a reference.
   */
  defaultStyle?: Volatile<string> | string | null
  /** Load Claude Code `outputStyles` JSON entries (`{ name, description, prompt }`) beside Markdown styles. */
  compatJson?: boolean
  /** Order of the injected system-prompt section (90: after the persona, before tool guidance at 100–199). */
  sectionOrder?: number
  /** Marker appended at the truncation point when a style body exceeds {@link Config.maxStyleChars}. */
  truncationMarker?: string
  /** Include the package's bundled `styles/` directory in the library. */
  includeBuiltins?: boolean
  /** Reload the library when a style file changes on disk (default true). */
  watchStyles?: boolean
  /**
   * Per-session/per-tool render rules (renderer registry); applied by
   * `/transcript` and the render service. Optional, and acceptably supplied as
   * a plain array; {@link normalizeConfig} turns it into a stable reference.
   */
  rules?: Volatile<StyleRuleConfig[]> | StyleRuleConfig[] | null
  /** Register the `/transcript` command (Markdown/HTML session-export, renderer-aware). */
  enableExport?: boolean
  /**
   * Honor a detected core `outputStyles` capability: when true (default) and
   * the core service is composed, this plugin skips its own system-prompt
   * injection (hot-switch / rules / export stay active). Set false to always
   * inject regardless.
   */
  respectCoreOutputStyles?: boolean
}

/** Configuration after defaults have been resolved. */
export interface ResolvedConfig {
  /** Absolute style-library directories, lowest priority first (bundled styles first when included). */
  stylesDirs: string[]
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
  /** Whether the bundled `styles/` directory participates. */
  includeBuiltins: boolean
  /** Whether the library reloads on style-file changes. */
  watchStyles: boolean
  /** Per-session/per-tool render rules with resolved priorities. */
  rules: Array<{ match: { tool?: string; contentType?: 'text' | 'markdown' | 'html'; session?: string }; style: string; priority: number }>
  /** Whether the `/transcript` command registers. */
  enableExport: boolean
  /** Whether a detected core `outputStyles` capability disables prompt injection. */
  respectCoreOutputStyles: boolean
}

/**
 * Loader-visible configuration schema and defaults.
 *
 * The two user-editable fields carry `volatile()`: they become stable
 * references on a host that composes the settings forms seam, so a form write
 * commits through `loader/volatile-update` without a remount. `volatile()` is
 * only legal on a fixed object path, never inside an array or a union — which
 * is why the whole `rules` array is marked, and rule *elements* are not.
 */
export const Config = z.object({
  stylesDir: z.union([z.string(), z.array(z.string())]).default([]),
  maxStyleChars: z.number().min(1).default(4000),
  defaultStyle: z.string().default('').volatile(),
  compatJson: z.boolean().default(true),
  sectionOrder: z.number().default(90),
  truncationMarker: z.string().default('\n\n[style truncated]'),
  includeBuiltins: z.boolean().default(true),
  watchStyles: z.boolean().default(true),
  rules: z.array(z.object({
    match: z.object({
      tool: z.string().required(false),
      contentType: z.union([z.const('text'), z.const('markdown'), z.const('html')]).required(false),
      session: z.string().required(false),
    }).required(false),
    style: z.string().min(1),
    priority: z.number().required(false),
  })).default([]).volatile(),
  enableExport: z.boolean().default(true),
  respectCoreOutputStyles: z.boolean().default(true),
})

/**
 * Loud cross-field and out-of-range check over a resolved configuration.
 *
 * This is the check direct callers get from {@link resolveConfig}, and the one
 * the plugin boundary runs so a bad rule fails the load rather than surfacing
 * later at render time.
 *
 * The removed 0.1.6-era `settings.register(..., { validate })` callback ran
 * the rule half of this check at settings-write time. The settings seam that
 * replaces it has no `check()` hook — the cookbook's `Schema.check()` does not
 * exist in any published `@deepseek-ai/schemastery` (verified against 3.18.2
 * and 3.18.3) — and a `transform` cannot express it either, because the
 * transform callback receives the schema's *input* (plain values) while the
 * Config type is its *output* (`Volatile` references). So the check lives here
 * and runs at load, at each volatile commit, and for every direct caller.
 *
 * `defaultStyle` is deliberately checked against the live style library in the
 * caller rather than here, because only the caller has loaded that library.
 * @param config - configuration after {@link resolveConfig} has applied defaults.
 * @throws Error when a budget or section order is not finite, or a rule names an
 * invalid renderer id, tool, or priority.
 */
export function validateRules(config: ResolvedConfig): void {
  if (!Number.isFinite(config.maxStyleChars) || config.maxStyleChars < 1) {
    throw new Error(`dsh-output-styles: maxStyleChars must be a finite number ≥ 1, got ${String(config.maxStyleChars)}`)
  }
  if (!Number.isFinite(config.sectionOrder)) {
    throw new Error(`dsh-output-styles: sectionOrder must be a finite number, got ${String(config.sectionOrder)}`)
  }
  for (const rule of config.rules) {
    const tool = rule.match.tool
    if (tool !== undefined && tool !== '*' && /[^a-zA-Z0-9_-]/.test(tool)) {
      throw new Error(`dsh-output-styles: rule tool ${JSON.stringify(tool)} must be a tool name or '*'`)
    }
    if (rule.style === '' || /[^a-z0-9-]/.test(rule.style)) {
      throw new Error(`dsh-output-styles: rule style ${JSON.stringify(rule.style)} must be a kebab-case renderer id`)
    }
    if (!Number.isFinite(rule.priority)) {
      throw new Error(`dsh-output-styles: rule priority must be a finite number, got ${String(rule.priority)}`)
    }
  }
}

/**
 * Read a possibly-volatile Config field. Every field is read through this so
 * direct (non-Loader) callers passing plain values keep working, while a
 * schema-validated Config — whose volatile fields are live references — reads
 * its current snapshot.
 * @param field - a `Volatile` reference or a plain value.
 * @returns the current plain value.
 */
function unvolatile<T>(field: Volatile<T> | T | null | undefined): T {
  const reference = field as Volatile<T> | undefined
  if (typeof reference?.get === 'function') return reference.get() as T
  return field as T
}

/** A Config whose two user-editable fields are guaranteed to be stable references. */
export type NormalizedConfig = Omit<Config, 'defaultStyle' | 'rules'> & {
  defaultStyle: Volatile<string>
  rules: Volatile<StyleRuleConfig[]>
}

/**
 * Guarantee the two `volatile()` Config fields are stable references.
 *
 * The Loader already produced references by validating the raw config against
 * this schema. A direct caller — a test composing the plugin, or a host that
 * mounts it without the Loader — hands over plain values instead, and the
 * runtime needs the same reference shape either way. An existing reference is
 * passed through untouched, so its live-update behaviour is preserved; a plain
 * value is wrapped once into an immutable reference.
 * @param config - configuration from the Loader or a direct caller.
 * @returns the same configuration with both editable fields as references.
 */
export function normalizeConfig(config: Config): NormalizedConfig {
  return {
    ...config,
    defaultStyle: asVolatile(config.defaultStyle ?? ''),
    rules: asVolatile(config.rules ?? []),
  }
}

/** Wrap a plain value into a reference, passing an existing reference through. */
function asVolatile<T>(field: Volatile<T> | T | null | undefined): Volatile<T> {
  if (typeof (field as Volatile<T> | undefined)?.get === 'function') return field as Volatile<T>
  return createVolatile(field as T)
}

/**
 * Resolve the defaults a direct (non-Loader) caller needs, reading every
 * volatile field through {@link unvolatile} so both a schema-validated Config
 * and a plain hand-written one resolve identically.
 *
 * Field constraints are enforced by the schema; cross-field ones by
 * {@link validateRules} at the plugin boundary.
 * @param config - configuration supplied by the composition (volatile fields included).
 * @param defaultStylesDir - Absolute bundled directory used when built-ins are included.
 * @returns Configuration with every default applied.
 */
export function resolveConfig(config: Config, defaultStylesDir: string): ResolvedConfig {
  const maxStyleChars = config.maxStyleChars ?? 4000
  const sectionOrder = config.sectionOrder ?? 90
  const includeBuiltins = config.includeBuiltins ?? true
  const rawDirs = Array.isArray(config.stylesDir) ? config.stylesDir : config.stylesDir === undefined || config.stylesDir === '' ? [] : [config.stylesDir]
  const customDirs = rawDirs.map(dir => resolve(dir))
  const stylesDirs = includeBuiltins ? [defaultStylesDir, ...customDirs] : customDirs
  const resolved: ResolvedConfig = {
    stylesDirs,
    maxStyleChars,
    defaultStyle: unvolatile(config.defaultStyle) ?? '',
    compatJson: config.compatJson ?? true,
    sectionOrder,
    truncationMarker: config.truncationMarker ?? '\n\n[style truncated]',
    includeBuiltins,
    watchStyles: config.watchStyles ?? true,
    rules: unvolatile(config.rules ?? []).map(rule => ({ ...rule, priority: rule.priority ?? 0 })),
    enableExport: config.enableExport ?? true,
    respectCoreOutputStyles: config.respectCoreOutputStyles ?? true,
  }
  // Fail loud here, so a direct caller that bypasses the Loader gets the same
  // rejection the plugin boundary applies.
  validateRules(resolved)
  return resolved
}
