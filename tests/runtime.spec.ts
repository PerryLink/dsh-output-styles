import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import StorageService from '@deepseek-ai/dsh-storage'
import * as storageDomain from '@deepseek-ai/dsh-storage-domain'
import * as storageJson from '@deepseek-ai/dsh-storage-json'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import * as outputStyles from '../src/index.ts'
import { createStyleHarness, makeStyleDir } from './harness.ts'

const LONG_BODY = 'x'.repeat(100)

const LONG_STYLE = [
  '---',
  'name: verbose',
  'description: A deliberately long style.',
  '---',
  LONG_BODY,
].join('\n')

describe('style resolution and the injected prompt section', () => {
  it('injects nothing into a fresh session by default', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toBe('')
    await harness.dispose()
  })

  it('injects the configured defaultStyle into fresh sessions', async () => {
    const harness = await createStyleHarness({ defaultStyle: 'concise' })
    const session = harness.makeSession()
    const text = await harness.sectionText(session)
    expect(text).toContain('# Output style: concise')
    expect(text).toContain('保持简洁')
    await harness.dispose()
  })

  it('fails the load when defaultStyle names no library style', async () => {
    await expect(createStyleHarness({ defaultStyle: 'nope' })).rejects.toThrow(/defaultStyle "nope"/)
  })

  it('stays pending without the storage domain facility and activates once it appears', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    const fiber = ctx.plugin(outputStyles)
    expect(fiber.state).toBe(0 /* FiberState.PENDING */)

    const root = mkdtempSync(join(tmpdir(), 'dsh-output-styles-late-'))
    await ctx.plugin(StorageService)
    await ctx.plugin(storageJson, { root })
    await ctx.plugin(storageDomain, { backend: 'json' })
    await fiber
    expect(fiber.state).toBe(2 /* FiberState.ACTIVE */)
    await fiber.dispose()
  })

  it('injects the style body under the budget with a truncation marker', async () => {
    const dir = makeStyleDir({ 'verbose.md': LONG_STYLE })
    const harness = await createStyleHarness({ maxStyleChars: 10, truncationMarker: '… [cut]', defaultStyle: 'verbose' }, dir)
    const session = harness.makeSession()
    const text = await harness.sectionText(session)
    expect(text).toContain('x'.repeat(10) + '… [cut]')
    expect(text.length).toBeLessThan(LONG_BODY.length + 64)
    await harness.dispose()
  })
})

describe('/style command dispatch', () => {
  it('lists the current selection and every style with its description', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const execution = await harness.runStyle(session, '/style')
    expect(execution?.result.kind).toBe('success')
    const text = execution?.result.kind === 'success' ? execution.result.text : ''
    expect(text).toContain('output style off')
    expect(text).toContain('concise — Terse, direct answers — minimal prose, no preamble.')
    expect(text).toContain('(Daily coding work, tool-heavy sessions, or when prompt length matters.)')
    expect(text).toContain('step-by-step — Numbered reasoning steps with explicit intermediate results.')
    await harness.dispose()
  })

  it('switches a style and injects its body from the next assembly on', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toBe('')
    const execution = await harness.runStyle(session, '/style concise')
    expect(execution?.result).toEqual({ kind: 'success', text: 'switched to concise' })
    const text = await harness.sectionText(session)
    expect(text).toContain('# Output style: concise')
    expect(text).toContain('保持简洁')
    await harness.dispose()
  })

  it('restores the default with /style off', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    await harness.runStyle(session, '/style concise')
    expect(await harness.sectionText(session)).not.toBe('')
    const execution = await harness.runStyle(session, '/style off')
    expect(execution?.result).toEqual({ kind: 'success', text: 'output style off' })
    expect(await harness.sectionText(session)).toBe('')
    await harness.dispose()
  })

  it('rejects unknown style names with an error listing available styles', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const unknown = await harness.runStyle(session, '/style nope')
    expect(unknown?.result).toEqual({
      kind: 'error',
      text: 'unknown output style "nope" (available: concise, explanatory, formal, step-by-step)',
    })
    const multi = await harness.runStyle(session, '/style concise extra')
    expect(multi?.result).toEqual({
      kind: 'error',
      text: 'unknown output style "concise extra" (available: concise, explanatory, formal, step-by-step)',
    })
    expect(await harness.sectionText(session)).toBe('')
    await harness.dispose()
  })

  it('switches a style whose name contains spaces (whole remainder is the name)', async () => {
    const dir = makeStyleDir({
      'diagrams.md': [
        '---',
        'name: Diagrams first',
        'description: Lead with a diagram.',
        '---',
        'Start every explanation with a diagram.',
      ].join('\n'),
    })
    const harness = await createStyleHarness({}, dir)
    const session = harness.makeSession()
    const execution = await harness.runStyle(session, '/style Diagrams first')
    expect(execution?.result).toEqual({ kind: 'success', text: 'switched to Diagrams first' })
    const text = await harness.sectionText(session)
    expect(text).toContain('# Output style: Diagrams first')
    expect(text).toContain('Start every explanation with a diagram.')
    await harness.dispose()
  })

  it('keeps two sessions independent', async () => {
    const harness = await createStyleHarness()
    const first = harness.makeSession('first')
    const second = harness.makeSession('second')
    await harness.runStyle(first, '/style concise')
    await harness.runStyle(second, '/style step-by-step')
    expect(await harness.sectionText(first)).toContain('# Output style: concise')
    expect(await harness.sectionText(second)).toContain('# Output style: step-by-step')
    await harness.runStyle(first, '/style off')
    expect(await harness.sectionText(first)).toBe('')
    expect(await harness.sectionText(second)).toContain('# Output style: step-by-step')
    await harness.dispose()
  })
})

describe('keep-coding-instructions: false replaces the whole system prompt', () => {
  const REPLACE = [
    '---',
    'name: replace',
    'description: A style that owns the whole prompt.',
    'keep-coding-instructions: false',
    '---',
    'Answer as a writing assistant.',
  ].join('\n')

  it('leaves the harness sections in place for keep-coding-instructions: true styles', async () => {
    const harness = await createStyleHarness({ defaultStyle: 'concise' })
    const session = harness.makeSession()
    const assembled = await harness.sections(session)
    expect(assembled.length).toBeGreaterThan(1)
    expect(assembled.some(section => section.name === outputStyles.STYLE_SECTION_NAME)).toBe(true)
    expect(assembled.some(section => section.name !== outputStyles.STYLE_SECTION_NAME)).toBe(true)
    await harness.dispose()
  })

  it('replaces the section list with the single style section when keep-coding-instructions is false', async () => {
    const dir = makeStyleDir({ 'replace.md': REPLACE })
    const harness = await createStyleHarness({ defaultStyle: 'replace' }, dir)
    const session = harness.makeSession()
    const assembled = await harness.sections(session)
    expect(assembled).toHaveLength(1)
    expect(assembled[0]?.name).toBe(outputStyles.STYLE_SECTION_NAME)
    expect(assembled[0]?.text).toContain('# Output style: replace')
    expect(assembled[0]?.text).toContain('Answer as a writing assistant.')
    await harness.dispose()
  })

  it('restores the harness sections once the session switches off', async () => {
    const dir = makeStyleDir({ 'replace.md': REPLACE })
    const harness = await createStyleHarness({}, dir)
    const session = harness.makeSession()
    await harness.runStyle(session, '/style replace')
    expect(await harness.sections(session)).toHaveLength(1)
    await harness.runStyle(session, '/style off')
    const assembled = await harness.sections(session)
    expect(assembled.length).toBeGreaterThan(1)
    await harness.dispose()
  })
})

describe('force styles override every selection', () => {
  const FORCED = [
    '---',
    'name: forced',
    'description: Always applied.',
    'force: true',
    '---',
    'Forced directive.',
  ].join('\n')
  const OTHER = '---\nname: other\ndescription: Optional.\n---\nOptional directive.'

  it('applies the forced style to fresh sessions and after /style off', async () => {
    const dir = makeStyleDir({ 'forced.md': FORCED, 'other.md': OTHER })
    const harness = await createStyleHarness({}, dir)
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toContain('# Output style: forced')
    const switched = await harness.runStyle(session, '/style other')
    expect(switched?.result).toEqual({ kind: 'success', text: 'switched to other' })
    expect(await harness.sectionText(session)).toContain('Forced directive.')
    const off = await harness.runStyle(session, '/style off')
    expect(off?.result).toEqual({ kind: 'success', text: 'output style off (style "forced" remains in force)' })
    expect(await harness.sectionText(session)).toContain('Forced directive.')
    await harness.dispose()
  })
})

describe('style directory layering', () => {
  it('later style directories override bundled styles of the same name', async () => {
    const dir = makeStyleDir({
      'concise.md': '---\nname: concise\ndescription: Custom concise.\n---\nCustom body.',
    })
    const harness = await createStyleHarness({ defaultStyle: 'concise' }, dir)
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toContain('Custom body.')
    expect(await harness.sectionText(session)).not.toContain('Terse, direct answers')
    await harness.dispose()
  })

  it('excludes bundled styles when includeBuiltins is false', async () => {
    const dir = makeStyleDir({ 'only.md': '---\nname: only\ndescription: x.\n---\nBody.' })
    const harness = await createStyleHarness({ includeBuiltins: false }, dir)
    const session = harness.makeSession()
    const execution = await harness.runStyle(session, '/style')
    const text = execution?.result.kind === 'success' ? execution.result.text : ''
    expect(text).toContain('only')
    expect(text).not.toContain('step-by-step')
    await harness.dispose()
  })
})

describe('style file hot reload', () => {
  it('picks up a new style file without re-applying the plugin', async () => {
    const dir = makeStyleDir({ 'first.md': '---\nname: first\ndescription: a.\n---\nA body.' })
    const harness = await createStyleHarness({}, dir)
    const session = harness.makeSession()
    await harness.runStyle(session, '/style first')
    writeFileSync(join(dir, 'second.md'), '---\nname: second\ndescription: b.\n---\nB body.', 'utf8')
    // The watcher coalesces change events; give it time to reload.
    await new Promise(resolve => setTimeout(resolve, 700))
    const execution = await harness.runStyle(session, '/style second')
    expect(execution?.result).toEqual({ kind: 'success', text: 'switched to second' })
    expect(await harness.sectionText(session)).toContain('B body.')
    await harness.dispose()
  })

  it('keeps the previous library when a change would break the configured default', async () => {
    const dir = makeStyleDir({ 'first.md': '---\nname: first\ndescription: a.\n---\nA body.' })
    const harness = await createStyleHarness({ defaultStyle: 'first' }, dir)
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toContain('A body.')
    // Replace the file with one that drops the defaultStyle name.
    writeFileSync(join(dir, 'first.md'), '---\nname: renamed\ndescription: a.\n---\nB body.', 'utf8')
    await new Promise(resolve => setTimeout(resolve, 700))
    expect(await harness.sectionText(session)).toContain('A body.')
    await harness.dispose()
  })
})

describe('project default over the settings seam', () => {
  it('falls back to the settings outputStyle for sessions that never selected one', async () => {
    const harness = await createStyleHarness({}, undefined, { settings: true })
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toBe('')
    const scope = harness.settings?.lastScope
    expect(scope).toBeDefined()
    await scope?.update({ style: 'step-by-step' })
    expect(await harness.sectionText(session)).toContain('# Output style: step-by-step')
    // A session's own selection still wins over the project default.
    await harness.runStyle(session, '/style formal')
    expect(await harness.sectionText(session)).toContain('# Output style: formal')
    // /style off falls back to the project default again.
    await harness.runStyle(session, '/style off')
    expect(await harness.sectionText(session)).toContain('# Output style: step-by-step')
    await harness.dispose()
  })

  it('rejects a settings outputStyle that names no library style', async () => {
    const harness = await createStyleHarness({}, undefined, { settings: true })
    const scope = harness.settings?.lastScope
    expect(scope).toBeDefined()
    await expect(scope?.update({ style: 'nope' })).rejects.toThrow(/names no style/)
    await harness.dispose()
  })

  it('keeps the configured defaultStyle when no settings service is composed', async () => {
    const harness = await createStyleHarness({ defaultStyle: 'concise' })
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toContain('# Output style: concise')
    await harness.dispose()
  })
})

describe('configuration hot-reload (fiber disposal and re-apply)', () => {
  it('unregisters the old section on dispose and re-applies with the new config, keeping the durable selection', async () => {
    const dir = makeStyleDir({ 'verbose.md': LONG_STYLE })
    const harness = await createStyleHarness({ stylesDir: dir, maxStyleChars: 20 })
    const session = harness.makeSession()
    await harness.runStyle(session, '/style verbose')
    expect(await harness.sectionText(session)).toContain('x'.repeat(20))

    // Hot-reload: dispose the old fiber, mount the plugin again on the same
    // context with a changed budget. The section name re-registers without a
    // duplicate-name throw, and the session's durable selection survives.
    await harness.pluginFiber.dispose()
    const reloaded = await harness.ctx.plugin(outputStyles, { stylesDir: dir, maxStyleChars: 5, truncationMarker: '…' })
    expect(await harness.sectionText(session)).toContain('x'.repeat(5) + '…')
    await reloaded.dispose()
    await harness.dispose()
  })
})
