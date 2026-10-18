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

  it('states the degraded mode in the /style reply, not only in the log', async () => {
    // `ctx.logger.info` never reaches the session transcript, so a degraded
    // switch used to answer exactly `switched to step-by-step` — identical to
    // the standalone reply, while nothing was injected. The command reply is
    // the user's channel, so the fact has to be stated there.
    const harness = await createStyleHarness({ defaultStyle: 'concise' }, undefined, { coreOutputStyles: true })
    const session = harness.makeSession()
    await harness.runStyle(session, '/style step-by-step')
    const done = session.snapshotEvents().find(event => event.type === 'command/done')
    const text = done?.type === 'command/done' ? done.data.text : ''
    expect(text).toContain('switched to step-by-step')
    expect(text).toContain('degraded coexistence mode')
    await harness.dispose()
  })

  it('says nothing extra in the /style reply when the plugin is standalone', async () => {
    const harness = await createStyleHarness({ defaultStyle: 'concise' })
    const session = harness.makeSession()
    await harness.runStyle(session, '/style step-by-step')
    const done = session.snapshotEvents().find(event => event.type === 'command/done')
    const text = done?.type === 'command/done' ? done.data.text : ''
    expect(text).toBe('switched to step-by-step')
    await harness.dispose()
  })

  it('exposes promptInjection through the style projection so clients can state it', async () => {
    const standalone = await createStyleHarness({ defaultStyle: 'concise' })
    const s1 = standalone.makeSession()
    expect(standalone.ctx.sessionProjections.snapshot(s1).values.style?.promptInjection).toBe('enabled')
    await standalone.dispose()

    const degraded = await createStyleHarness({ defaultStyle: 'concise' }, undefined, { coreOutputStyles: true })
    const s2 = degraded.makeSession()
    expect(degraded.ctx.sessionProjections.snapshot(s2).values.style?.promptInjection).toBe('disabled')
    await degraded.dispose()
  })
})
