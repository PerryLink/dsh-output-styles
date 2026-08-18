/**
 * Lifecycle and export-contract suite: the HMR-safety test (dispose the
 * contributing fiber, re-query the authoritative registries), the
 * default-export guard (module namespace + Loader unwrap round-trip), and the
 * explicit resolveConfig negative (the second fail-loud layer beyond the
 * Loader's Schemastery pass).
 *
 * @module dsh-output-styles/test/lifecycle.spec
 */

import { describe, expect, it } from 'vitest'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { createStyleHarness } from './harness.ts'
import { resolveConfig } from '../src/config.ts'

// ---------------------------------------------------------------------------
// C2: the function-plugin namespace must survive Loader unwrapping
// ---------------------------------------------------------------------------

describe('export contract', () => {
  it('module carries no default export and Loader unwrap round-trips the namespace', async () => {
    const plugin = await import('../src/index.ts')
    expect('default' in plugin).toBe(false)
    const loader = Object.create(Loader.prototype)
    const unwrapped = loader.unwrapExports(plugin)
    expect(unwrapped).toBe(plugin)
    expect(unwrapped.name).toBe('dsh-output-styles')
    expect(unwrapped.inject).toEqual(['systemPrompt', 'storageDomain'])
    expect(typeof unwrapped.Config).toBe('function')
    expect(typeof unwrapped.apply).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// C1: disposing the contributing fiber removes every registry contribution
// ---------------------------------------------------------------------------

describe('fiber disposal', () => {
  it('removes the /style command, the prompt section, and the renderer service on dispose', async () => {
    const harness = await createStyleHarness({})
    const session = harness.makeSession()
    await harness.runStyle(session, '/style concise')
    // Contributions are live before dispose.
    expect(harness.ctx.commands.list(harness.agentFor(session)).map(entry => entry.name)).toContain('style')
    expect(await harness.sectionText(session)).toContain('Output style: concise')
    expect(harness.ctx.get('outputRenderers')).toBeDefined()

    await harness.pluginFiber.dispose()

    expect(harness.ctx.commands.list(harness.agentFor(session)).map(entry => entry.name)).not.toContain('style')
    expect(harness.ctx.commands.list(harness.agentFor(session)).map(entry => entry.name)).not.toContain('export')
    expect(await harness.sectionText(session)).toBe('')
    expect(harness.ctx.get('outputRenderers')).toBeUndefined()
    await harness.dispose()
  })
})

// ---------------------------------------------------------------------------
// U4: the explicit resolveConfig layer rejects out-of-bounds values
// ---------------------------------------------------------------------------

describe('resolveConfig fail-loud', () => {
  it('rejects a non-kebab-case rule style with the real message', () => {
    expect(() => resolveConfig({ rules: [{ match: {}, style: 'Bad Style!' }] }, '/tmp')).toThrow(/rule style .* must be a kebab-case renderer id/u)
  })

  it('rejects a rule tool name with illegal characters', () => {
    expect(() => resolveConfig({ rules: [{ match: { tool: 'bad tool!' }, style: 'concise' }] }, '/tmp')).toThrow(/rule tool .* must be a tool name or '\*'/u)
  })

  it('rejects a non-finite maxStyleChars', () => {
    expect(() => resolveConfig({ maxStyleChars: Number.NaN }, '/tmp')).toThrow(/maxStyleChars must be a finite number/u)
  })
})
