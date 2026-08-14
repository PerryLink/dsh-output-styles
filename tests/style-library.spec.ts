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
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
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
    const styles = loadStyleLibrary([dir], { compatJson: false }, () => {})
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
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect(styles.get('explain')).toMatchObject({
      name: 'explain',
      description: 'Explain like a teacher.',
      body: 'Teach in small steps.',
      file: 'explain.json',
      format: 'json',
    })
  })

  it('warns and ignores JSON entries when compatJson is off', () => {
    const dir = makeStyleDir({ 'explain.json': JSON.stringify({ name: 'explain', description: 'x.', prompt: 'b' }) })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: false }, message => { warnings.push(message) })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/ignoring explain\.json.*compatJson: false/)
    expect(styles.size).toBe(0)
  })

  it('skips bad Markdown files with one warning each', () => {
    const dir = makeStyleDir({
      'no-frontmatter.md': 'plain prose, no frontmatter',
      'bad-name.md': '---\nname: Not_Kebab\ndescription: x.\n---\nbody',
      'missing-description.md': '---\nname: ok\ndescription: ""\n---\nbody',
      'bad-yaml.md': '---\nname: [broken\ndescription: x\n---\nbody',
      'empty-body.md': '---\nname: empty\ndescription: x.\n---\n',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings).toHaveLength(5)
    expect(warnings.join('\n')).toMatch(/no-frontmatter\.md.*missing `---` frontmatter/)
    expect(warnings.join('\n')).toMatch(/bad-name\.md.*letters, digits, spaces, or hyphens/)
    expect(warnings.join('\n')).toMatch(/missing-description\.md.*description must be a non-empty string/)
    expect(warnings.join('\n')).toMatch(/bad-yaml\.md.*not valid YAML/)
    expect(warnings.join('\n')).toMatch(/empty-body\.md.*body must be non-empty/)
  })

  it('skips incompatible JSON entries with one warning each', () => {
    const dir = makeStyleDir({
      'no-prompt.json': JSON.stringify({ name: 'x', description: 'd.' }),
      'bad-json.json': '{ not json',
      'array.json': JSON.stringify([{ name: 'x' }]),
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings).toHaveLength(3)
    expect(warnings.join('\n')).toMatch(/no-prompt\.json.*prompt must be a non-empty string/)
    expect(warnings.join('\n')).toMatch(/bad-json\.json.*invalid JSON/)
    expect(warnings.join('\n')).toMatch(/array\.json#1.*description must be a non-empty string/)
  })

  it('loads a Claude Code outputStyles JSON array collection', () => {
    const dir = makeStyleDir({
      'collection.json': JSON.stringify([
        { name: 'teacher', description: 'Explain like a teacher.', prompt: 'Teach in small steps.' },
        { name: 'reviewer', description: 'Review like a reviewer.', prompt: 'Review rigorously.', whenToUse: 'PR review' },
      ]),
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect([...styles.keys()]).toEqual(['teacher', 'reviewer'])
    expect(styles.get('reviewer')).toMatchObject({
      name: 'reviewer',
      description: 'Review like a reviewer.',
      whenToUse: 'PR review',
      body: 'Review rigorously.',
      file: 'collection.json#2',
      format: 'json',
    })
  })

  it('skips one bad entry of an array collection but keeps the rest', () => {
    const dir = makeStyleDir({
      'collection.json': JSON.stringify([
        { name: 'good', description: 'Good.', prompt: 'Be good.' },
        { name: 'bad name!', description: 'Bad.', prompt: 'Be bad.' },
      ]),
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect([...styles.keys()]).toEqual(['good'])
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/collection\.json#2.*letters, digits, spaces, or hyphens/)
  })

  it('warns about unknown frontmatter keys but keeps the style', () => {
    const dir = makeStyleDir({
      'extra.md': '---\nname: extra\ndescription: x.\nallowed-tools: ["bash"]\n---\nbody',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: true }, message => { warnings.push(message) })
    expect(styles.has('extra')).toBe(true)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/unknown frontmatter field allowed-tools/)
  })

  it('defaults the name to the file name when frontmatter omits it', () => {
    const dir = makeStyleDir({ 'diagrams-first.md': '---\ndescription: Diagrams.\n---\nLead with a diagram.' })
    const styles = loadStyleLibrary([dir], { compatJson: false }, () => {})
    expect([...styles.keys()]).toEqual(['diagrams-first'])
  })

  it('loads multi-word names and keeps their spelling verbatim', () => {
    const dir = makeStyleDir({ 'diagrams.md': '---\nname: Diagrams first\ndescription: x.\n---\nBody.' })
    const styles = loadStyleLibrary([dir], { compatJson: false }, () => {})
    expect(styles.get('Diagrams first')?.name).toBe('Diagrams first')
  })

  it('defaults keep-coding-instructions and force to false', () => {
    const dir = makeStyleDir({ 'plain.md': '---\nname: plain\ndescription: x.\n---\nBody.' })
    const styles = loadStyleLibrary([dir], { compatJson: false }, () => {})
    expect(styles.get('plain')).toMatchObject({ keepCodingInstructions: false, force: false })
  })

  it('reads keep-coding-instructions and force when present', () => {
    const dir = makeStyleDir({
      'keeps.md': '---\nname: keeps\ndescription: x.\nkeep-coding-instructions: true\n---\nBody.',
      'forced.md': '---\nname: forced\ndescription: x.\nforce: true\n---\nBody.',
    })
    const styles = loadStyleLibrary([dir], { compatJson: false }, () => {})
    expect(styles.get('keeps')?.keepCodingInstructions).toBe(true)
    expect(styles.get('forced')?.force).toBe(true)
  })

  it('reads Claude Code force-for-plugin in frontmatter and outputStyles JSON', () => {
    const mdDir = makeStyleDir({
      'plugin.md': '---\nname: plugin-md\ndescription: x.\nforce-for-plugin: true\n---\nBody.',
    })
    const jsonDir = makeStyleDir({
      'plugin.json': JSON.stringify({ name: 'plugin-json', description: 'x.', prompt: 'b', 'force-for-plugin': true }),
    })
    const warnings: string[] = []
    const mdStyles = loadStyleLibrary([mdDir], { compatJson: false }, message => { warnings.push(message) })
    const jsonStyles = loadStyleLibrary([jsonDir], { compatJson: true }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect(mdStyles.get('plugin-md')?.force).toBe(true)
    expect(jsonStyles.get('plugin-json')?.force).toBe(true)
  })

  it('accepts force and force-for-plugin together when they agree', () => {
    const dir = makeStyleDir({
      'both.md': '---\nname: both\ndescription: x.\nforce: true\nforce-for-plugin: true\n---\nBody.',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: false }, message => { warnings.push(message) })
    expect(warnings).toEqual([])
    expect(styles.get('both')?.force).toBe(true)
  })

  it('skips a style whose force and force-for-plugin disagree', () => {
    const dir = makeStyleDir({
      'split.md': '---\nname: split\ndescription: x.\nforce: true\nforce-for-plugin: false\n---\nBody.',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: false }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatch(/split\.md.*force and force-for-plugin disagree/)
  })

  it('rejects non-boolean keep-coding-instructions, force, and force-for-plugin', () => {
    const dir = makeStyleDir({
      'bad-keep.md': '---\nname: bad-keep\ndescription: x.\nkeep-coding-instructions: yes\n---\nBody.',
      'bad-force.md': '---\nname: bad-force\ndescription: x.\nforce: 1\n---\nBody.',
      'bad-force-plugin.md': '---\nname: bad-force-plugin\ndescription: x.\nforce-for-plugin: 1\n---\nBody.',
    })
    const warnings: string[] = []
    const styles = loadStyleLibrary([dir], { compatJson: false }, message => { warnings.push(message) })
    expect(styles.size).toBe(0)
    expect(warnings.join('\n')).toMatch(/bad-keep\.md.*keep-coding-instructions must be a boolean/)
    expect(warnings.join('\n')).toMatch(/bad-force\.md.*force must be a boolean/)
    expect(warnings.join('\n')).toMatch(/bad-force-plugin\.md.*force-for-plugin must be a boolean/)
  })

  it('throws when two styles declare force', () => {
    const dir = makeStyleDir({
      'one.md': '---\nname: one\ndescription: a.\nforce: true\n---\na',
      'two.md': '---\nname: two\ndescription: b.\nforce: true\n---\nb',
    })
    expect(() => loadStyleLibrary([dir], { compatJson: false }, () => {})).toThrow(/both declare force/)
  })

  it('throws when two styles declare force-for-plugin', () => {
    const dir = makeStyleDir({
      'one.md': '---\nname: one\ndescription: a.\nforce-for-plugin: true\n---\na',
      'two.md': '---\nname: two\ndescription: b.\nforce-for-plugin: true\n---\nb',
    })
    expect(() => loadStyleLibrary([dir], { compatJson: false }, () => {})).toThrow(/both declare force/)
  })

  it('throws on duplicate style names across files', () => {
    const dir = makeStyleDir({
      'one.md': '---\nname: same\ndescription: a.\n---\na',
      'two.json': JSON.stringify({ name: 'same', description: 'b.', prompt: 'b' }),
    })
    expect(() => loadStyleLibrary([dir], { compatJson: true }, () => {})).toThrow(/duplicate style name "same"/)
  })

  it('merges directories in order, later directories overriding earlier ones', () => {
    const first = makeStyleDir({ 'style.md': '---\nname: shared\ndescription: first.\n---\nfirst body' })
    const second = makeStyleDir({
      'style.md': '---\nname: shared\ndescription: second.\n---\nsecond body',
      'extra.md': '---\nname: extra\ndescription: extra.\n---\nExtra.',
    })
    const styles = loadStyleLibrary([first, second], { compatJson: false }, () => {})
    expect([...styles.keys()]).toEqual(['shared', 'extra'])
    expect(styles.get('shared')?.body).toBe('second body')
  })

  it('throws when a force style appears in two merged directories', () => {
    const first = makeStyleDir({ 'one.md': '---\nname: one\ndescription: a.\nforce: true\n---\na' })
    const second = makeStyleDir({ 'two.md': '---\nname: two\ndescription: b.\nforce: true\n---\nb' })
    expect(() => loadStyleLibrary([first, second], { compatJson: false }, () => {})).toThrow(/both declare force/)
  })

  it('throws when a style is named off (reserved switch target)', () => {
    const dir = makeStyleDir({ 'off.md': '---\nname: off\ndescription: x.\n---\nbody' })
    expect(() => loadStyleLibrary([dir], { compatJson: true }, () => {})).toThrow(/named "off".*reserved/)
  })

  it('throws when the style directory is unreadable', () => {
    const missing = join(mkdtempSync(join(tmpdir(), 'dsh-output-styles-missing-')), 'nope')
    expect(() => loadStyleLibrary([missing], { compatJson: true }, () => {})).toThrow(/style directory .* unreadable/)
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

  it('cuts at code points, never splitting a surrogate pair', () => {
    expect(truncateStyle('a😀b😀c', 3, '…')).toBe('a😀b…')
  })
})
