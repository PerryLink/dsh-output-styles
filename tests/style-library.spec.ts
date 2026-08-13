import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadStyleLibrary, truncateStyle } from '../src/style-library.ts'
import { makeStyleDir } from './harness.ts'

const CONCISE = [
  '---',
  'name: concise',
  'description: Terse, direct answers.',
  'whenToUse: Daily coding work.',
  '---',
  '',
  'Lead with the direct answer.',
  '',
].join('\n')

describe('loadStyleLibrary', () => {
  it('loads Markdown styles from frontmatter name, description, whenToUse, and body', () => {
    const dir = makeStyleDir({ 'concise.md': CONCISE })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: true }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect([...styles.keys()]).toEqual(['concise'])
    expect(styles.get('concise')).toMatchObject({
      name: 'concise',
      description: 'Terse, direct answers.',
      whenToUse: 'Daily coding work.',
      body: 'Lead with the direct answer.',
      file: 'concise.md',
      format: 'md',
    })
  })

  it('orders styles by file name (code-unit sort), independent of load order', () => {
    const dir = makeStyleDir({
      'z-last.md': '---\nname: z-last\ndescription: z.\n---\nbody z',
      'a-first.md': '---\nname: a-first\ndescription: a.\n---\nbody a',
    })
    const styles = loadStyleLibrary(dir, { compatJson: false }, () => {})
    expect([...styles.keys()]).toEqual(['a-first', 'z-last'])
  })

  it('loads Claude Code outputStyles JSON entries when compatJson is on', () => {
    const dir = makeStyleDir({
      'explain.json': JSON.stringify({
        name: 'explain',
        description: 'Explain like a teacher.',
        prompt: 'Teach in small steps.',
      }),
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: true }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect(styles.get('explain')).toMatchObject({
      name: 'explain',
      description: 'Explain like a teacher.',
      body: 'Teach in small steps.',
      file: 'explain.json',
      format: 'json',
    })
  })

  it('ignores JSON entries entirely when compatJson is off', () => {
    const dir = makeStyleDir({ 'explain.json': '{ invalid' })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: false }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect(styles.size).toBe(0)
  })

  it('skips bad Markdown files with one warning each', () => {
    const dir = makeStyleDir({
      'no-frontmatter.md': 'plain prose, no frontmatter',
      'bad-name.md': '---\nname: Not-Kebab\ndescription: x.\n---\nbody',
      'missing-description.md': '---\nname: ok\ndescription: ""\n---\nbody',
      'bad-yaml.md': '---\nname: [broken\ndescription: x\n---\nbody',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: true }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings).toHaveLength(4)
    expect(warnings.join('\n')).toMatch(/no-frontmatter\.md.*missing `---` frontmatter/)
    expect(warnings.join('\n')).toMatch(/bad-name\.md.*kebab-case/)
    expect(warnings.join('\n')).toMatch(/missing-description\.md.*description must be a non-empty string/)
    expect(warnings.join('\n')).toMatch(/bad-yaml\.md.*not valid YAML/)
  })

  it('skips incompatible JSON entries with one warning each', () => {
    const dir = makeStyleDir({
      'no-prompt.json': JSON.stringify({ name: 'x', description: 'd.' }),
      'bad-json.json': '{ not json',
      'array.json': JSON.stringify([{ name: 'x' }]),
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: true }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings).toHaveLength(3)
    expect(warnings.join('\n')).toMatch(/no-prompt\.json.*prompt must be a non-empty string/)
    expect(warnings.join('\n')).toMatch(/bad-json\.json.*invalid JSON/)
    expect(warnings.join('\n')).toMatch(/array\.json.*must be a JSON object/)
  })

  it('warns about unknown frontmatter keys but keeps the style', () => {
    const dir = makeStyleDir({
      'extra.md': '---\nname: extra\ndescription: x.\nallowed-tools: ["bash"]\n---\nbody',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary(dir, { compatJson: true }, message => { warnings.push(message) })
    expect(styles.has('extra')).toBe(true)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/unknown frontmatter field allowed-tools/)
  })

  it('throws on duplicate style names across files', () => {
    const dir = makeStyleDir({
      'one.md': '---\nname: same\ndescription: a.\n---\na',
      'two.json': JSON.stringify({ name: 'same', description: 'b.', prompt: 'b' }),
    })
    expect(() => loadStyleLibrary(dir, { compatJson: true }, () => {})).toThrow(/duplicate style name "same"/)
  })

  it('throws when a style is named off (reserved switch target)', () => {
    const dir = makeStyleDir({ 'off.md': '---\nname: off\ndescription: x.\n---\nbody' })
    expect(() => loadStyleLibrary(dir, { compatJson: true }, () => {})).toThrow(/named "off".*reserved/)
  })

  it('throws when the style directory is unreadable', () => {
    const missing = join(mkdtempSync(join(tmpdir(), 'dsh-output-styles-missing-')), 'nope')
    expect(() => loadStyleLibrary(missing, { compatJson: true }, () => {})).toThrow(/style directory .* unreadable/)
  })
})

describe('truncateStyle', () => {
  it('passes bodies within the budget through unchanged', () => {
    expect(truncateStyle('short body', 100, '\n\n[style truncated]')).toBe('short body')
  })

  it('cuts bodies at the budget and appends the marker', () => {
    expect(truncateStyle('abcdefgh', 4, '… [truncated]')).toBe('abcd… [truncated]')
  })

  it('does not count the marker against the budget', () => {
    const result = truncateStyle('abcdefgh', 8, '… [truncated]')
    expect(result).toBe('abcdefgh')
  })
})
