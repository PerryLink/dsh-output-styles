import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import * as outputStyles from '../src/index.ts'
import { createStyleHarness } from './harness.ts'

describe('core outputStyles coexistence', () => {
  it('detects the reserved core service seam', () => {
    const ctx = new Context()
    expect(outputStyles.detectCoreOutputStyles(ctx)).toBe(false)
    ctx.provide('outputStyles', {} as never)
    expect(outputStyles.detectCoreOutputStyles(ctx)).toBe(true)
  })

  it('reports the coexistence mode and retained surfaces', () => {
    const ctx = new Context()
    expect(outputStyles.coexistenceReport(ctx)).toMatchObject({
      coreActive: false,
      mode: 'standalone',
      promptInjection: 'enabled',
    })
    ctx.provide('outputStyles', {} as never)
    const report = outputStyles.coexistenceReport(ctx)
    expect(report).toMatchObject({ coreActive: true, mode: 'degraded', promptInjection: 'disabled' })
    expect(report.retained).toEqual(['hot-switch', 'rules', 'export'])
    expect(report.disabled).toContain('system-prompt injection')
  })

  it('degrades to no prompt injection when the core service is composed', async () => {
    const harness = await createStyleHarness({ defaultStyle: 'concise' }, undefined, { coreOutputStyles: true })
    const session = harness.makeSession()
    // No injected style section: prompt injection belongs to the core.
    expect(await harness.sectionText(session)).toBe('')
    // Hot-switch command still registers and works.
    await harness.runStyle(session, '/style step-by-step')
    const done = session.snapshotEvents().find(event => event.type === 'command/done')
    expect(done?.type === 'command/done' && done.data.text).toContain('switched to step-by-step')
    // The renderer/export incremental surface stays provided.
    expect(harness.ctx.get('outputRenderers')).toBeDefined()
    await harness.dispose()
  })

  it('force-injects when respectCoreOutputStyles is false even with the core composed', async () => {
    const harness = await createStyleHarness(
      { defaultStyle: 'concise', respectCoreOutputStyles: false },
      undefined,
      { coreOutputStyles: true },
    )
    const session = harness.makeSession()
    expect(await harness.sectionText(session)).toContain('# Output style: concise')
    await harness.dispose()
  })
})
