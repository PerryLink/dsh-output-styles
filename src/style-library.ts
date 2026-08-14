/**
 * Style-library loading: one style per `*.md` file (frontmatter + body),
 * with optional Claude Code `outputStyles` JSON compatibility (single entry
 * or an array of entries per file).
 *
 * A style file that does not parse is skipped with a warning; the plugin
 * stays loadable. Structural ambiguity — a duplicate style name, a style
 * named `off`, or two styles declaring `force` — fails the load because it
 * would silently change which body gets injected.
 * @module dsh-output-styles/style-library
 */

import { readdirSync, readFileSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { OFF } from './types.ts'

/** Character set for style names: letters, digits, spaces, and hyphens only. */
export const STYLE_NAME_RE = /^[\p{L}\p{N} -]+$/u

/**
 * Whether a name is a legal style name and switch target: at least one
 * letter or digit, only letters/digits/spaces/hyphens, and no leading or
 * trailing space. Spaces are the only whitespace allowed, so a name is
 * always a single switchable line the model can echo back. `off` passes this
 * check but is a reserved target rejected by the library.
 * @param name - candidate style name.
 * @returns whether the name is legal.
 */
export function isValidStyleName(name: string): boolean {
  if (name === '' || name !== name.trim()) return false
  if (!STYLE_NAME_RE.test(name)) return false
  return /[\p{L}\p{N}]/u.test(name)
}

/** One loaded style: library metadata plus the raw injectable body. */
export interface OutputStyle {
  /** Switch target accepted by `/style`; letters, digits, spaces, and hyphens. */
  readonly name: string
  /** One user-facing sentence on what the style does. */
  readonly description: string
  /** Optional guidance on when the style is useful; shown in listings. */
  readonly whenToUse?: string
  /** The raw directive injected into the system prompt, before truncation. */
  readonly body: string
  /** Library file this style came from, relative to the style directory. */
  readonly file: string
  /** Source format (`md` frontmatter or `json` compatibility entry). */
  readonly format: 'md' | 'json'
  /**
   * Keep the harness prompt (identity, persona, tool guidance) when this
   * style is active (Claude Code `keep-coding-instructions`). When false,
   * the style replaces the whole system prompt; default false, matching
   * Claude Code.
   */
  readonly keepCodingInstructions: boolean
  /**
   * Apply this style unconditionally, overriding any session selection.
   * Declared through Claude Code's `force-for-plugin` field (`force` is
   * accepted as an alias).
   */
  readonly force: boolean
}

/** Report a style file the loader skipped or a tolerated oddity. */
type Warn = (message: string) => void

/**
 * Load the style library from one or more directories. Later directories
 * override earlier ones on a same-named style (the Claude Code
 * "closest-to-the-working-directory wins" rule); duplicates within one
 * directory still fail the load. Deterministic order: directories in the
 * given order, files within a directory sorted by code unit.
 * @param stylesDirs - absolute directories, lowest priority first.
 * @param options.compatJson - whether `*.json` entries are loaded.
 * @param warn - warning sink (skipped files, unknown frontmatter keys).
 * @returns the library keyed by style name, in directory/file order.
 * @throws when a directory is unreadable, a style is named `off`, two files
 *   in one directory declare the same name, or two styles declare `force`.
 */
export function loadStyleLibrary(
  stylesDirs: readonly string[],
  options: { readonly compatJson: boolean },
  warn: Warn,
): ReadonlyMap<string, OutputStyle> {
  const styles = new Map<string, OutputStyle>()
  for (const dir of stylesDirs) {
    for (const [name, style] of loadStyleDir(dir, options, warn)) {
      styles.set(name, style) // a later directory overrides an earlier one
    }
  }
  const forced = [...styles.values()].filter(style => style.force)
  if (forced.length > 1) {
    throw new Error(
      `dsh-output-styles: styles ${forced.map(style => style.file).join(' and ')} both declare force; at most one style may be forced`,
    )
  }
  return styles
}

/** Load every style in one directory (duplicates within it fail the load). */
function loadStyleDir(
  stylesDir: string,
  options: { readonly compatJson: boolean },
  warn: Warn,
): ReadonlyMap<string, OutputStyle> {
  let entries: Dirent[]
  try {
    entries = readdirSync(stylesDir, { withFileTypes: true })
  } catch (cause) {
    throw new Error(`dsh-output-styles: style directory ${stylesDir} is unreadable`, { cause })
  }
  entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  const styles = new Map<string, OutputStyle>()
  const addStyle = (style: OutputStyle): void => {
    if (style.name === OFF) {
      throw new Error(`dsh-output-styles: style ${style.file} is named "${OFF}", which is reserved for switching output styles off`)
    }
    if (styles.has(style.name)) {
      throw new Error(`dsh-output-styles: duplicate style name "${style.name}" (${styles.get(style.name)?.file} and ${style.file})`)
    }
    styles.set(style.name, style)
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const file = entry.name
    if (file.endsWith('.md')) {
      const parsed = parseMarkdownStyle(file, readStyleFile(stylesDir, file, warn))
      if (parsed.oddity !== undefined) warn(parsed.oddity)
      if (parsed.problem !== undefined) {
        warn(`skipping ${file}: ${parsed.problem}`)
        continue
      }
      if (parsed.style !== undefined) addStyle(parsed.style)
    } else if (file.endsWith('.json')) {
      if (!options.compatJson) {
        warn(`ignoring ${file}: JSON style loading is disabled (compatJson: false)`)
        continue
      }
      for (const style of parseJsonFile(file, readStyleFile(stylesDir, file, warn), warn)) {
        addStyle(style)
      }
    }
  }
  return styles
}

/** Read one library file; an unreadable file is a skipped-file warning. */
function readStyleFile(stylesDir: string, file: string, warn: Warn): string | undefined {
  try {
    return readFileSync(join(stylesDir, file), 'utf8')
  } catch (cause) {
    warn(`skipping ${file}: unreadable (${cause instanceof Error ? cause.message : String(cause)})`)
    return undefined
  }
}

/** Parse a `---`-fenced frontmatter style file. */
function parseMarkdownStyle(file: string, source: string | undefined): { style?: OutputStyle; problem?: string; oddity?: string } {
  if (source === undefined) return {}
  const open = /^---[ \t]*\r?\n/.exec(source)
  if (open === null) {
    return { problem: 'missing `---` frontmatter block' }
  }
  const close = /\r?\n---[ \t]*(?:\r?\n|$)/.exec(source.slice(open[0].length))
  if (close === null) {
    return { problem: 'unterminated `---` frontmatter block' }
  }
  const frontmatter = source.slice(open[0].length, open[0].length + close.index)
  const bodyStart = open[0].length + close.index + close[0].length
  const body = source.slice(bodyStart).trim()
  const parsed = parseFrontmatter(file, frontmatter)
  if (parsed.problem !== undefined) return { problem: parsed.problem }
  if (body === '') {
    return { problem: 'style body must be non-empty' }
  }
  const fields = parsed.fields
  if (fields === undefined) return {}
  const style = {
    name: fields.name,
    description: fields.description,
    ...fields.whenToUse === undefined ? {} : { whenToUse: fields.whenToUse },
    body,
    file,
    format: 'md' as const,
    keepCodingInstructions: fields.keepCodingInstructions,
    force: fields.force,
  }
  return parsed.oddity === undefined ? { style } : { style, oddity: parsed.oddity }
}

/** Frontmatter fields shared by the two source formats. */
interface StyleFields {
  name: string
  description: string
  whenToUse?: string
  keepCodingInstructions: boolean
  force: boolean
}

/** Attach a present oddity without an explicit-undefined optional key. */
function withOddity<T extends object>(value: T, oddity: string | undefined): T | (T & { oddity: string }) {
  return oddity === undefined ? value : { ...value, oddity }
}

/** The file name a `name`-less style inherits: the file name without its extension. */
function defaultStyleName(file: string): string {
  return file.slice(0, file.length - '.md'.length)
}

/** Keys both frontmatter formats accept, plus the booleans they share. */
const FRONTMATTER_KEYS = new Set([
  'name',
  'description',
  'whenToUse',
  'keep-coding-instructions',
  'force',
  'force-for-plugin',
])

/** Validate one frontmatter block into {@link StyleFields}. */
function parseFrontmatter(file: string, frontmatter: string): { fields?: StyleFields; problem?: string; oddity?: string } {
  let raw: unknown
  try {
    raw = parseYaml(frontmatter)
  } catch (cause) {
    return { problem: `frontmatter is not valid YAML (${cause instanceof Error ? cause.message : String(cause)})` }
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { problem: 'frontmatter must be a mapping of scalar fields' }
  }
  const record = raw as Record<string, unknown>
  const oddityKeys = Object.keys(record).filter(key => !FRONTMATTER_KEYS.has(key))
  const oddity = oddityKeys.length > 0 ? `${file}: ignoring unknown frontmatter field${oddityKeys.length > 1 ? 's' : ''} ${oddityKeys.join(', ')}` : undefined
  const { name, description, whenToUse } = record
  const effectiveName = name === undefined ? defaultStyleName(file) : name
  if (typeof effectiveName !== 'string' || !isValidStyleName(effectiveName)) {
    return withOddity({ problem: 'frontmatter name must be letters, digits, spaces, or hyphens, with at least one letter or digit and no leading/trailing space' }, oddity)
  }
  if (typeof description !== 'string' || description.trim() === '') {
    return withOddity({ problem: 'frontmatter description must be a non-empty string' }, oddity)
  }
  if (whenToUse !== undefined && typeof whenToUse !== 'string') {
    return withOddity({ problem: 'frontmatter whenToUse must be a string when present' }, oddity)
  }
  const booleans = booleanFields(record, 'frontmatter')
  if (booleans.problem !== undefined) return withOddity({ problem: booleans.problem }, oddity)
  return withOddity({
    fields: {
      name: effectiveName,
      description: description.trim(),
      ...whenToUse === undefined ? {} : { whenToUse: whenToUse.trim() },
      keepCodingInstructions: booleans.keepCodingInstructions,
      force: booleans.force,
    },
  }, oddity)
}

/**
 * Read the shared boolean flags, defaulting each to false. `force-for-plugin`
 * is the Claude Code field name (both in frontmatter and in `outputStyles`
 * JSON); `force` is this package's alias for it, kept so styles written
 * against the original plugin keep loading. When both appear they must
 * agree — a disagreement is ambiguous, so the file is skipped.
 */
function booleanFields(record: Record<string, unknown>, source: string): { keepCodingInstructions: boolean; force: boolean; problem?: string } {
  const keep = record['keep-coding-instructions']
  if (keep !== undefined && typeof keep !== 'boolean') {
    return { keepCodingInstructions: false, force: false, problem: `${source} keep-coding-instructions must be a boolean when present` }
  }
  const forceAlias = record['force']
  if (forceAlias !== undefined && typeof forceAlias !== 'boolean') {
    return { keepCodingInstructions: false, force: false, problem: `${source} force must be a boolean when present` }
  }
  const forceForPlugin = record['force-for-plugin']
  if (forceForPlugin !== undefined && typeof forceForPlugin !== 'boolean') {
    return { keepCodingInstructions: false, force: false, problem: `${source} force-for-plugin must be a boolean when present` }
  }
  if (forceAlias !== undefined && forceForPlugin !== undefined && forceAlias !== forceForPlugin) {
    return { keepCodingInstructions: false, force: false, problem: `${source} force and force-for-plugin disagree; drop one of them` }
  }
  return { keepCodingInstructions: keep ?? false, force: forceForPlugin ?? forceAlias ?? false }
}

/**
 * Parse a Claude Code `outputStyles` JSON file: one entry or an array of
 * entries (the legacy `settings.json` collection form). Bad entries are
 * skipped with one warning each; a bad file skips the whole file.
 */
function parseJsonFile(file: string, source: string | undefined, warn: Warn): OutputStyle[] {
  if (source === undefined) return []
  let raw: unknown
  try {
    raw = JSON.parse(source)
  } catch (cause) {
    warn(`skipping ${file}: invalid JSON (${cause instanceof Error ? cause.message : String(cause)})`)
    return []
  }
  const records = Array.isArray(raw) ? raw : [raw]
  const styles: OutputStyle[] = []
  for (const [index, record] of records.entries()) {
    const label = Array.isArray(raw) ? `${file}#${index + 1}` : file
    const entry = parseJsonEntry(label, record)
    if (entry.oddity !== undefined) warn(entry.oddity)
    if (entry.problem !== undefined) {
      warn(`skipping ${label}: ${entry.problem}`)
      continue
    }
    if (entry.style !== undefined) styles.push(entry.style)
  }
  return styles
}

/** Parse one Claude Code `outputStyles` JSON entry. */
function parseJsonEntry(label: string, record: unknown): { style?: OutputStyle; problem?: string; oddity?: string } {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    return { problem: 'must be a JSON object' }
  }
  const raw = record as Record<string, unknown>
  const { name, description, prompt, whenToUse } = raw
  if (typeof name !== 'string' || !isValidStyleName(name)) {
    return { problem: 'name must be letters, digits, spaces, or hyphens, with at least one letter or digit and no leading/trailing space' }
  }
  if (typeof description !== 'string' || description.trim() === '') {
    return { problem: 'description must be a non-empty string' }
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return { problem: 'prompt must be a non-empty string' }
  }
  const oddityKeys = Object.keys(raw).filter(key => !FRONTMATTER_KEYS.has(key) && key !== 'prompt')
  const oddity = oddityKeys.length > 0 ? `${label}: ignoring unknown JSON field${oddityKeys.length > 1 ? 's' : ''} ${oddityKeys.join(', ')}` : undefined
  if (whenToUse !== undefined && typeof whenToUse !== 'string') {
    return withOddity({ problem: 'whenToUse must be a string when present' }, oddity)
  }
  const booleans = booleanFields(raw, 'JSON')
  if (booleans.problem !== undefined) return withOddity({ problem: booleans.problem }, oddity)
  return withOddity({
    style: {
      name,
      description: description.trim(),
      ...whenToUse === undefined ? {} : { whenToUse: whenToUse.trim() },
      body: prompt.trim(),
      file: label,
      format: 'json',
      keepCodingInstructions: booleans.keepCodingInstructions,
      force: booleans.force,
    },
  }, oddity)
}

/**
 * Apply the style-body budget: bodies at most `maxChars` code points pass
 * through; longer bodies are cut at the budget and closed with `marker` (the
 * marker itself is not counted against the budget). The cut is code-point
 * safe, so a multi-unit emoji is never split in half.
 * @param body - the raw style body.
 * @param maxChars - budget in code points; at least 1.
 * @param marker - text appended at the truncation point.
 * @returns the body as it will be injected.
 */
export function truncateStyle(body: string, maxChars: number, marker: string): string {
  const chars = Array.from(body)
  if (chars.length <= maxChars) return body
  return chars.slice(0, maxChars).join('') + marker
}
