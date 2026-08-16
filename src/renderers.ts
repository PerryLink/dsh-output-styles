/**
 * The `output.render.*` protocol: a presenter registry that turns raw
 * model-visible text into display text. A renderer is a pure function —
 * `presenter(text, meta)` maps args to presentation data and never touches
 * the DOM — matched by tool name and content type, ordered by priority.
 * Every rendered result carries its original text alongside, so any consumer
 * (this plugin's `/export`, third-party panels) can log both and keep the
 * "model-visible ⟺ reconstructable" invariant.
 *
 * This module is dependency-free (no DOM, no node: imports, no DSH imports)
 * so the protocol vocabulary itself is portable and unit-testable anywhere.
 * @module dsh-output-styles/renderers
 */

/** Content-type vocabulary a renderer can match on. */
export type ContentType = 'text' | 'markdown' | 'html'

/** Match rule deciding whether a renderer applies to one render request. */
export interface RendererMatch {
  /** Tool names the renderer applies to ('*' = every tool); omitted = match all. */
  readonly tool?: string | readonly string[]
  /** Content types the renderer applies to; omitted = match all. */
  readonly contentType?: ContentType | readonly ContentType[]
}

/** Facts a render request carries (structural; the DOM never reaches this layer). */
export interface RenderContext {
  /** The tool that produced the text, or '' for assistant/user prose. */
  readonly tool: string
  /** The declared content type of the text ('text' when unknown). */
  readonly contentType: ContentType
  /** The session the text belongs to (per-session rules match on it). */
  readonly sessionId?: string
  /** Session-scoped extras a presenter may read (workspace title etc.). */
  readonly meta?: Readonly<Record<string, string>>
}

/** The renderer contract a third-party plugin registers. */
export interface OutputRenderer {
  /** Unique renderer id (kebab-case); the rule field and `/export --renderer` name it. */
  readonly id: string
  /** Human-readable name. */
  readonly name: string
  /** One sentence on what the presenter does. */
  readonly description: string
  /** Applicability rules; an empty array matches everything. */
  readonly match: readonly RendererMatch[]
  /** Higher priority wins; ties break by registration order (earlier first). */
  readonly priority: number
  /** Pure presentation function: args in, display data out. */
  readonly presenter: (text: string, context: RenderContext) => string
}

/** The auditable render result: original and rendered travel together. */
export interface RenderedText {
  /** The original model-visible text (never mutated). */
  readonly original: string
  /** The presented text (equal to the original when nothing matched). */
  readonly rendered: string
  /** The renderer that applied, or undefined when no renderer matched. */
  readonly rendererId?: string
  /** Whether the presentation changed the text. */
  readonly changed: boolean
}

/** One per-session/per-tool style rule from the configuration. */
export interface StyleRule {
  /** Match facts; an empty object matches everything. */
  readonly match: {
    /** Tool name or '*' (omitted = any tool). */
    readonly tool?: string
    /** Content type (omitted = any). */
    readonly contentType?: ContentType
    /** Exact session id (omitted = any session) — the per-session axis. */
    readonly session?: string
  }
  /** Renderer id to apply (built-ins mirror the style names: concise, step-by-step). */
  readonly style: string
  /** Higher priority wins; ties break by rule order (earlier first). */
  readonly priority: number
}

/** Registry handle returned by register(). */
export type RendererDisposer = () => void

/**
 * Validates a renderer before registration: id grammar, name, description,
 * match shape, priority, presenter function. Throws on the first violation
 * (fail-loud — a bad renderer never sits in the registry).
 * @param renderer - candidate renderer.
 */
export function validateRenderer(renderer: OutputRenderer): void {
  if (typeof renderer !== 'object' || renderer === null) throw new Error('renderer must be an object')
  if (typeof renderer.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(renderer.id)) {
    throw new Error(`invalid renderer id ${JSON.stringify(renderer.id)}: use kebab-case`)
  }
  if (typeof renderer.name !== 'string' || renderer.name === '') throw new Error('renderer name must be a non-empty string')
  if (typeof renderer.description !== 'string' || renderer.description === '') throw new Error('renderer description must be a non-empty string')
  if (!Array.isArray(renderer.match)) throw new Error('renderer match must be an array')
  for (const match of renderer.match) {
    if (match.tool !== undefined) {
      const tools = Array.isArray(match.tool) ? match.tool : [match.tool]
      if (!tools.every((item: unknown) => typeof item === 'string')) {
        throw new Error('renderer match.tool must be a string or string array')
      }
    }
    if (match.contentType !== undefined) {
      const types = Array.isArray(match.contentType) ? match.contentType : [match.contentType]
      if (!types.every((item: unknown) => typeof item === 'string')) {
        throw new Error('renderer match.contentType must be a string or string array')
      }
    }
  }
  if (typeof renderer.priority !== 'number' || !Number.isFinite(renderer.priority)) {
    throw new Error('renderer priority must be a finite number')
  }
  if (typeof renderer.presenter !== 'function') throw new Error('renderer presenter must be a function')
}

/** Match one rule fact (a string, a string list, or undefined=any) against a value. */
function factMatches(fact: string | readonly string[] | undefined, value: string): boolean {
  if (fact === undefined) return true
  if (typeof fact === 'string') return fact === '*' || fact === value
  return fact.includes('*') || fact.includes(value)
}

/** Whether a renderer matches a render request. */
function rendererMatches(renderer: OutputRenderer, context: RenderContext): boolean {
  if (renderer.match.length === 0) return true
  return renderer.match.some(match =>
    factMatches(match.tool, context.tool)
    && factMatches(match.contentType, context.contentType))
}

/** Whether a configured rule matches a render request. */
function ruleMatches(rule: StyleRule, context: RenderContext): boolean {
  if (rule.match.tool !== undefined && rule.match.tool !== '*' && rule.match.tool !== context.tool) return false
  if (rule.match.contentType !== undefined && rule.match.contentType !== context.contentType) return false
  if (rule.match.session !== undefined && rule.match.session !== context.sessionId) return false
  return true
}

/**
 * The renderer registry: reversible registration, ordered resolution, and
 * rule-driven rendering. Registration is a caller-owned effect (the runtime
 * hands register()'s disposer to ctx.effect); the registry itself is pure
 * state with no timers, listeners, or I/O.
 */
export class RendererRegistry {
  private readonly renderers = new Map<string, { renderer: OutputRenderer; order: number }>()
  private order = 0

  /** Register a renderer; the disposer removes exactly this registration. */
  register(renderer: OutputRenderer): RendererDisposer {
    validateRenderer(renderer)
    if (this.renderers.has(renderer.id)) {
      throw new Error(`renderer ${JSON.stringify(renderer.id)} is already registered`)
    }
    const order = this.order++
    this.renderers.set(renderer.id, { renderer, order })
    return () => {
      if (this.renderers.get(renderer.id)?.order === order) this.renderers.delete(renderer.id)
    }
  }

  /** Every registered renderer, deterministic order (priority desc, registration asc). */
  list(): OutputRenderer[] {
    return [...this.renderers.values()]
      .sort((a, b) => b.renderer.priority - a.renderer.priority || a.order - b.order)
      .map(entry => entry.renderer)
  }

  /** Resolve the renderers that match a request, highest priority first. */
  resolve(context: RenderContext): OutputRenderer[] {
    return this.list().filter(renderer => rendererMatches(renderer, context))
  }

  /**
   * Render text through the rule table, then the matching renderer pipeline:
   * the first matching rule names a renderer (applied alone, it is explicit),
   * otherwise every matching renderer applies in priority order (each sees the
   * previous renderer's output — composition, not competition).
   * @param text - the raw model-visible text.
   * @param context - tool / content-type / session facts.
   * @param rules - configured style rules, highest priority first.
   * @returns the auditable result (original always preserved).
   */
  render(text: string, context: RenderContext, rules: readonly StyleRule[] = []): RenderedText {
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)
    const hit = sortedRules.find(rule => ruleMatches(rule, context))
    if (hit !== undefined) {
      const renderer = this.renderers.get(hit.style)
      if (renderer === undefined) {
        throw new Error(`rule style ${JSON.stringify(hit.style)} names no registered renderer (available: ${this.list().map(item => item.id).join(', ') || 'none'})`)
      }
      const rendered = renderer.renderer.presenter(text, context)
      return { original: text, rendered, rendererId: renderer.renderer.id, changed: rendered !== text }
    }
    let rendered = text
    let rendererId: string | undefined
    for (const renderer of this.resolve(context)) {
      rendered = renderer.presenter(rendered, context)
      rendererId = renderer.id
    }
    return { original: text, rendered, ...rendererId === undefined ? {} : { rendererId }, changed: rendered !== text }
  }
}

/** Collapse whitespace runs and blank-line stacks; trim the ends. */
function compact(text: string, maxLines: number, maxChars: number, marker: string): string {
  const collapsed = text
    .split(/\r?\n/)
    .map(line => line.replace(/[ \t]+/g, ' ').trimEnd())
    .reduce((lines: string[], line) => {
      if (line === '' && lines[lines.length - 1] === '') return lines
      lines.push(line)
      return lines
    }, [])
    .join('\n')
    .trim()
  let out = maxLines > 0 && collapsed.split('\n').length > maxLines
    ? collapsed.split('\n').slice(0, maxLines).join('\n') + marker
    : collapsed
  if (maxChars > 0 && out.length > maxChars) out = out.slice(0, maxChars) + marker
  return out
}

/** Turn a list-shaped text into consistently numbered steps. */
function enumerate(text: string): string {
  const lines = text.split(/\r?\n/)
  const items = lines.filter(line => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line))
  if (items.length === 0) return text
  let counter = 0
  return lines.map((line) => {
    if (!/^\s*(?:[-*•]|\d+[.)])\s+/.test(line)) return line
    counter += 1
    return line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, `${counter}. `)
  }).join('\n')
}

/**
 * The built-in style renderers, mirroring the two headline styles: `concise`
 * compacts whitespace under a line/char budget, `step-by-step` numbers list
 * items consistently. Their ids double as `/style`-compatible names in the
 * rule table.
 */
export const BUILTIN_RENDERERS: readonly OutputRenderer[] = [
  {
    id: 'concise',
    name: 'Concise',
    description: 'Compacts whitespace runs and blank lines, and caps the presented text at a budget with a truncation marker.',
    match: [],
    priority: 10,
    presenter: text => compact(text, 40, 4000, '\n\n[truncated]'),
  },
  {
    id: 'step-by-step',
    name: 'Step-by-step',
    description: 'Numbers list items (dashes, bullets, or digits) consistently from 1 so the presentation reads as ordered steps.',
    match: [],
    priority: 10,
    presenter: text => enumerate(text),
  },
]
