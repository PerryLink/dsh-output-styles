import { mkdtempSync } from 'node:fs'
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
  it('lists the current selection and available styles with no argument', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const execution = await harness.runStyle(session, '/style')
    expect(execution?.result).toEqual({
      kind: 'success',
      text: 'output style off (available: concise, step-by-step)',
    })
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

  it('rejects unknown style names and multi-token input with an error listing available styles', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const unknown = await harness.runStyle(session, '/style nope')
    expect(unknown?.result).toEqual({
      kind: 'error',
      text: 'unknown output style "nope" (available: concise, step-by-step)',
    })
    const multi = await harness.runStyle(session, '/style concise extra')
    expect(multi?.result.kind).toBe('error')
    expect(multi?.result).toMatchObject({ text: expect.stringContaining('single tokens') })
    expect(await harness.sectionText(session)).toBe('')
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
