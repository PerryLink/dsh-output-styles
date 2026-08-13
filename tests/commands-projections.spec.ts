import { describe, expect, it } from 'vitest'
import * as outputStyles from '../src/index.ts'
import { createStyleHarness } from './harness.ts'

describe('command discovery and session-log reconstruction', () => {
  it('advertises the style command to UI adapters', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const descriptors = harness.ctx.commands.list(harness.agentFor(session))
    const style = descriptors.find(descriptor => descriptor.name === 'style')
    expect(style).toMatchObject({
      name: 'style',
      description: 'Switch the model output style for this session',
      input: { hint: '<style | off>' },
    })
    await harness.dispose()
  })

  it('logs command/run with the style name and command/done with the outcome', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    await harness.runStyle(session, '/style concise')
    const run = session.events.find(event => event.type === 'command/run')
    expect(run?.type === 'command/run' && run.data).toMatchObject({
      name: 'style',
      args: ' concise',
      source: { kind: 'user' },
    })
    const done = session.events.find(event => event.type === 'command/done')
    expect(done?.type === 'command/done' && done.data).toMatchObject({
      kind: 'success',
      text: 'switched to concise',
    })
    await harness.dispose()
  })
})

describe('style session projection', () => {
  it('mirrors accepted switches and /style off in the whole-value view', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    const snapshot0 = harness.ctx.sessionProjections.snapshot(session)
    expect(snapshot0.values.style).toEqual({
      options: [
        { value: 'concise', name: 'concise', description: expect.stringContaining('Terse') },
        { value: 'step-by-step', name: 'step-by-step', description: expect.stringContaining('Numbered') },
      ],
      currentValue: null,
    })
    await harness.runStyle(session, '/style step-by-step')
    expect(harness.ctx.sessionProjections.snapshot(session).values.style?.currentValue).toBe('step-by-step')
    await harness.runStyle(session, '/style off')
    expect(harness.ctx.sessionProjections.snapshot(session).values.style?.currentValue).toBeNull()
    await harness.dispose()
  })

  it('does not fold rejected inputs (unknown names leave the view unchanged)', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    await harness.runStyle(session, '/style nope')
    expect(harness.ctx.sessionProjections.snapshot(session).values.style?.currentValue).toBeNull()
    await harness.dispose()
  })

  it('is independent per session', async () => {
    const harness = await createStyleHarness()
    const first = harness.makeSession('p1')
    const second = harness.makeSession('p2')
    await harness.runStyle(first, '/style concise')
    expect(harness.ctx.sessionProjections.snapshot(first).values.style?.currentValue).toBe('concise')
    expect(harness.ctx.sessionProjections.snapshot(second).values.style?.currentValue).toBeNull()
    await harness.dispose()
  })

  it('registers a unit whose state stays plain JSON (checkpoint round-trip)', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    await harness.runStyle(session, '/style concise')
    const checkpoint = harness.ctx.sessionProjections.checkpoint(session)
    expect(checkpoint['style']).toMatchObject({ ver: 1, val: { current: 'concise' } })
    const restored = harness.ctx.sessionProjections.restore(checkpoint, session.events, 0)
    expect(restored.snapshot.values.style?.currentValue).toBe('concise')
    await harness.dispose()
  })
})

describe('selection durability across reload', () => {
  it('survives a plugin reload on the same context (record lives on the medium)', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession('reloadable')
    await harness.runStyle(session, '/style concise')
    await harness.pluginFiber.dispose()
    const reloaded = await harness.ctx.plugin(outputStyles, {})
    expect(await harness.sectionText(session)).toContain('# Output style: concise')
    await reloaded.dispose()
    await harness.dispose()
  })
})
