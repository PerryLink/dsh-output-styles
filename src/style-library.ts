/**
 * Style-library loading: one style per `*.md` file (frontmatter + body),
 * with optional Claude Code `outputStyles` JSON compatibility.
 *
 * A style file that does not parse is skipped with a warning; the plugin
 * stays loadable. Structural ambiguity — a duplicate style name or a style
 * named `off` — fails the load because it would silently change which body
 * gets injected.
 * @module dsh-output-styles/style-library
 */

import { readdirSync, readFileSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { OFF } from './types.ts'

/** Legal style names: kebab-case, exactly what `/style <name>` accepts. */
export const STYLE_NAME_RE = /^[a-z][a-z0-9-]*$/

/** One loaded style: library metadata plus the raw injectable body. */
export interface OutputStyle {
  /** Kebab-case switch target accepted by `/style`. */
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
}

/** Report a style file the loader skipped or a tolerated oddity. */
type Warn = (message: string) => void

/**
 * Load every style in one directory. Deterministic order (file names sorted
 * by code unit); `.md` files are parsed as frontmatter styles, `.json` files
 * as Claude Code `outputStyles` entries when enabled.
 * @param stylesDir - absolute directory to read.
 * @param options.compatJson - whether `*.json` entries are loaded.
 * @param warn - warning sink (skipped files, unknown frontmatter keys).
 * @returns the library keyed by style name, in file order.
 * @throws when the directory is unreadable, a style is named `off`, or two
 *   files declare the same name.
 */
export function loadStyleLibrary(
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
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const file = entry.name
    let parsed: { style?: OutputStyle; problem?: string; oddity?: string }
    if (file.endsWith('.md')) {
      parsed = parseMarkdownStyle(file, readStyleFile(stylesDir, file, warn))
    } else if (options.compatJson && file.endsWith('.json')) {
      parsed = parseJsonStyle(file, readStyleFile(stylesDir, file, warn))
    } else {
      continue
    }
    if (parsed.oddity !== undefined) warn(parsed.oddity)
    if (parsed.problem !== undefined) {
      warn(`skipping ${file}: ${parsed.problem}`)
      continue
    }
    const style = parsed.style
    if (style === undefined) continue
    if (style.name === OFF) {
      throw new Error(`dsh-output-styles: style ${file} is named "${OFF}", which is reserved for switching output styles off`)
    }
    if (styles.has(style.name)) {
      throw new Error(`dsh-output-styles: duplicate style name "${style.name}" (${styles.get(style.name)?.file} and ${file})`)
    }
    styles.set(style.name, style)
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
  const fields = parsed.fields
  if (fields === undefined) return {}
  const style = {
    name: fields.name,
    description: fields.description,
    ...fields.whenToUse === undefined ? {} : { whenToUse: fields.whenToUse },
    body,
    file,
    format: 'md' as const,
  }
  return parsed.oddity === undefined ? { style } : { style, oddity: parsed.oddity }
}

/** Frontmatter fields shared by the two source formats. */
interface StyleFields {
  name: string
  description: string
  whenToUse?: string
}

/** Attach a present oddity without an explicit-undefined optional key. */
function withOddity<T extends object>(value: T, oddity: string | undefined): T | (T & { oddity: string }) {
  return oddity === undefined ? value : { ...value, oddity }
}

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
  const oddityKeys = Object.keys(record).filter(key => key !== 'name' && key !== 'description' && key !== 'whenToUse')
  const oddity = oddityKeys.length > 0 ? `${file}: ignoring unknown frontmatter field${oddityKeys.length > 1 ? 's' : ''} ${oddityKeys.join(', ')}` : undefined
  const { name, description, whenToUse } = record
  if (typeof name !== 'string' || !STYLE_NAME_RE.test(name)) {
    return withOddity({ problem: `frontmatter name must be a kebab-case string matching ${String(STYLE_NAME_RE)}` }, oddity)
  }
  if (typeof description !== 'string' || description.trim() === '') {
    return withOddity({ problem: 'frontmatter description must be a non-empty string' }, oddity)
  }
  if (whenToUse !== undefined && typeof whenToUse !== 'string') {
    return withOddity({ problem: 'frontmatter whenToUse must be a string when present' }, oddity)
  }
  return withOddity({
    fields: {
      name,
      description: description.trim(),
      ...whenToUse === undefined ? {} : { whenToUse: whenToUse.trim() },
    },
  }, oddity)
}

/** Parse a Claude Code `outputStyles` JSON entry. */
function parseJsonStyle(file: string, source: string | undefined): { style?: OutputStyle; problem?: string; oddity?: string } {
  if (source === undefined) return {}
  let raw: unknown
  try {
    raw = JSON.parse(source)
  } catch (cause) {
    return { problem: `invalid JSON (${cause instanceof Error ? cause.message : String(cause)})` }
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { problem: 'must be a JSON object' }
  }
  const record = raw as Record<string, unknown>
  const { name, description, prompt } = record
  if (typeof name !== 'string' || !STYLE_NAME_RE.test(name)) {
    return { problem: `name must be a kebab-case string matching ${String(STYLE_NAME_RE)}` }
  }
  if (typeof description !== 'string' || description.trim() === '') {
    return { problem: 'description must be a non-empty string' }
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return { problem: 'prompt must be a non-empty string' }
  }
  const oddityKeys = Object.keys(record).filter(key => key !== 'name' && key !== 'description' && key !== 'prompt' && key !== 'whenToUse')
  const oddity = oddityKeys.length > 0 ? `${file}: ignoring unknown JSON field${oddityKeys.length > 1 ? 's' : ''} ${oddityKeys.join(', ')}` : undefined
  const whenToUse = record['whenToUse']
  if (whenToUse !== undefined && typeof whenToUse !== 'string') {
    return withOddity({ problem: 'whenToUse must be a string when present' }, oddity)
  }
  return withOddity({
    style: {
      name,
      description: description.trim(),
      ...whenToUse === undefined ? {} : { whenToUse: whenToUse.trim() },
      body: prompt.trim(),
      file,
      format: 'json',
    },
  }, oddity)
}

/**
 * Apply the style-body budget: bodies at most `maxChars` characters pass
 * through; longer bodies are cut at the budget and closed with `marker` (the
 * marker itself is not counted against the budget).
 * @param body - the raw style body.
 * @param maxChars - budget in characters; at least 1.
 * @param marker - text appended at the truncation point.
 * @returns the body as it will be injected.
 */
export function truncateStyle(body: string, maxChars: number, marker: string): string {
  if (body.length <= maxChars) return body
  return body.slice(0, maxChars) + marker
}
