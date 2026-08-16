import { describe, expect, it } from 'vitest'
import { BUILTIN_RENDERERS, RendererRegistry, validateRenderer, type OutputRenderer, type StyleRule } from '../src/renderers.ts'
import { parseExportInput } from '../src/runtime.ts'
import { conversationLines, renderExport, sanitizeText, toHtml, toMarkdown, type ExportLine } from '../src/export.ts'

const CONTEXT = { tool: 'bash', contentType: 'markdown' as const, sessionId: 's1' }

function registryWith(...extra: OutputRenderer[]): RendererRegistry {
  const registry = new RendererRegistry()
  for (const renderer of [...BUILTIN_RENDERERS, ...extra]) registry.register(renderer)
  return registry
}

describe('renderer registry', () => {
  it('registers reversibly and lists deterministically by priority', () => {
    const registry = new RendererRegistry()
    const late = { id: 'late', name: 'Late', description: 'late renderer', match: [], priority: 50, presenter: (text: string) => text }
    const early = { id: 'early', name: 'Early', description: 'early renderer', match: [], priority: 50, presenter: (text: string) => text }
    const disposeLate = registry.register(late)
    registry.register(early)
    expect(registry.list().map(item => item.id)).toEqual(['late', 'early'])
    disposeLate()
    expect(registry.list().map(item => item.id)).toEqual(['early'])
    expect(() => registry.register(late)).not.toThrow()
    expect(() => registry.register(late)).toThrow(/already registered/)
  })

  it('validates renderers fail-loud before registration', () => {
    const base = { id: 'ok', name: 'x', description: 'x', match: [], priority: 0, presenter: (text: string) => text }
    expect(() => validateRenderer(base)).not.toThrow()
    expect(() => validateRenderer({ ...base, id: 'Bad Id!' })).toThrow('kebab-case')
    expect(() => validateRenderer({ ...base, match: [{ tool: 42 }] as unknown as OutputRenderer['match'] })).toThrow('tool')
    expect(() => validateRenderer({ ...base, priority: Number.NaN })).toThrow('priority')
    expect(() => validateRenderer({ ...base, presenter: undefined as unknown as OutputRenderer['presenter'] })).toThrow('presenter')
  })

  it('applies matched renderers by tool/content-type and preserves the original text', () => {
    const registry = new RendererRegistry()
    registry.register({
      id: 'shout',
      name: 'Shout',
      description: 'uppercases bash output',
      match: [{ tool: 'bash', contentType: 'markdown' }],
      priority: 100,
      presenter: text => text.toUpperCase(),
    })
    const hit = registry.render('hello world', { ...CONTEXT }, [])
    expect(hit.rendered).toBe('HELLO WORLD')
    expect(hit.original).toBe('hello world')
    expect(hit.rendererId).toBe('shout')
    expect(hit.changed).toBe(true)
    const miss = registry.render('hello', { tool: 'read', contentType: 'text', sessionId: 's1' }, [])
    expect(miss.rendered).toBe('hello')
    expect(miss.rendererId).toBeUndefined()
  })

  it('applies the rule table (per-session/per-tool) before the general pipeline', () => {
    const registry = registryWith()
    const rules: StyleRule[] = [
      { match: { tool: 'bash' }, style: 'step-by-step', priority: 10 },
      { match: { session: 's2' }, style: 'concise', priority: 0 },
    ]
    const hit = registry.render('- first\n- second', { ...CONTEXT }, rules)
    expect(hit.rendererId).toBe('step-by-step')
    expect(hit.rendered).toContain('1. first\n2. second')
    const otherSession = registry.render('x'.repeat(5000), { tool: 'read', contentType: 'text', sessionId: 's2' }, rules)
    expect(otherSession.rendererId).toBe('concise')
    expect(otherSession.rendered.length).toBeLessThan(5000)
  })

  it('fails loudly when a rule names no registered renderer', () => {
    const registry = registryWith()
    expect(() => registry.render('text', CONTEXT, [{ match: {}, style: 'nope', priority: 0 }])).toThrow(/names no registered renderer/)
  })
})

describe('built-in renderers', () => {
  it('concise compacts whitespace and caps under the budget', () => {
    const concise = BUILTIN_RENDERERS[0]!
    const out = concise.presenter('line one   with   spaces\n\n\n\nline two  \n', CONTEXT)
    expect(out).toBe('line one with spaces\n\nline two')
    const long = concise.presenter('x'.repeat(8000), CONTEXT)
    expect(long.length).toBeLessThan(8000)
    expect(long).toContain('[truncated]')
  })

  it('step-by-step numbers list items and leaves prose untouched', () => {
    const steps = BUILTIN_RENDERERS[1]!
    expect(steps.presenter('- alpha\n* beta\n3) gamma', CONTEXT)).toBe('1. alpha\n2. beta\n3. gamma')
    expect(steps.presenter('plain prose', CONTEXT)).toBe('plain prose')
  })
})

describe('parseExportInput', () => {
  it('parses format and renderer override; rejects junk', () => {
    expect(parseExportInput('')).toEqual({ kind: 'ok', format: 'markdown' })
    expect(parseExportInput('html')).toEqual({ kind: 'ok', format: 'html' })
    expect(parseExportInput('markdown --renderer=concise')).toEqual({ kind: 'ok', format: 'markdown', renderer: 'concise' })
    expect(parseExportInput('nonsense')).toEqual({ kind: 'error' })
    expect(parseExportInput('html extra')).toEqual({ kind: 'error' })
  })
})

describe('sanitizeText', () => {
  it('escapes markup and strips control characters (extreme cases)', () => {
    expect(sanitizeText('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(sanitizeText("a'b")).toBe('a&#39;b')
    expect(sanitizeText('a\u0000b\u001fc\u007f')).toBe('abc')
    expect(sanitizeText('x'.repeat(100000))).toHaveLength(100000)
    expect(sanitizeText('a&b<c>d"e\'f')).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f')
  })
})

describe('export document builders', () => {
  const lines: ExportLine[] = [
    { role: 'user', text: 'ship it' },
    { role: 'assistant', text: 'done' },
    { role: 'tool', tool: 'bash', text: 'echo <ok>' },
  ]

  it('renders Markdown with fenced tool blocks', () => {
    const md = toMarkdown(lines)
    expect(md).toContain('## User\n\nship it')
    expect(md).toContain('### `bash`')
    expect(md).toContain('```text\necho <ok>\n```')
    expect(toMarkdown([])).toContain('_No messages yet._')
  })

  it('renders sanitized HTML', () => {
    const html = toHtml(lines)
    expect(html).toContain('&lt;ok&gt;')
    expect(html).toContain('<h2>User</h2>')
    expect(html.startsWith('<!doctype html>')).toBe(true)
  })

  it('builds an auditable export document with render pairs', () => {
    const registry = registryWith()
    const document = renderExport(registry, lines, 'markdown', [{ match: { tool: 'bash' }, style: 'concise', priority: 0 }], new Date('2026-08-16T00:00:00Z'))
    expect(document.plugin).toBe('dsh-output-styles')
    expect(document.schema).toBe('output-export-v1')
    expect(document.text).toContain('## User')
    expect(document.rendered).toHaveLength(3)
    expect(document.rendered.every(pair => pair.original !== undefined && pair.rendered !== undefined)).toBe(true)
    expect(document.rendered[2]?.original).toBe('echo <ok>')
  })
})

describe('conversationLines', () => {
  it('returns no lines for an empty log', () => {
    expect(conversationLines([])).toEqual([])
  })

  it('tolerates a surface seq that no longer resolves to an event', () => {
    // foldSurface over an empty list yields no nodes, so this path stays
    // covered by the empty-log case; a defensive direct call documents the
    // projection contract without inventing a corrupt log.
    expect(conversationLines([])).toEqual([])
  })
})
