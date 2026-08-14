import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as companion from '../src/invariant.ts'
import { installInvariant, PACKAGE_NAME } from '../src/invariant.ts'

/** Install the invariant body on a bare context with a recording fail and a fake session. */
function install(facts: companion.InvariantFacts): { ctx: Context; session: Session; fail: ReturnType<typeof vi.fn> } {
  const ctx = new Context()
  // The real reporter throws; the test records calls so assertions run after the emit.
  const fail = vi.fn(() => undefined as never)
  installInvariant(facts)(ctx, fail as unknown as companion.InvariantFailure)
  const session = { id: SessionId('s-1') } as unknown as Session
  return { ctx, session, fail }
}

describe('standalone invariant companion', () => {
  it('registers through the host registry and disposes with the fiber', async () => {
    const ctx = new Context()
    const unregister = vi.fn()
    const register = vi.fn<(packageName: string, installer: unknown) => () => void>(() => unregister)
    const removeService = ctx.provide('invariants', { register })

    const fiber = await ctx.plugin(companion)
    expect(register).toHaveBeenCalledTimes(1)
    expect(register.mock.calls[0]?.[0]).toBe(PACKAGE_NAME)
    expect(typeof register.mock.calls[0]?.[1]).toBe('function')

    await fiber.dispose()
    expect(unregister).toHaveBeenCalledTimes(1)
    removeService()
  })
})

describe('installInvariant checks', () => {
  it('rejects selection writes without the plugin source marker', () => {
    const { ctx, fail } = install({ knownStyles: () => undefined })
    ctx.emit('domain/changed', {
      domain: 'output_style', table: 'selection', key: 's-1', operation: 'put',
      value: { style: 'concise', source: { kind: 'user' } },
    })
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('source is'))
  })

  it('rejects selection writes naming styles outside the library', () => {
    const { ctx, fail } = install({ knownStyles: () => new Set(['concise']) })
    ctx.emit('domain/changed', {
      domain: 'output_style', table: 'selection', key: 's-1', operation: 'put',
      value: { style: 'stale', source: { kind: 'plugin', plugin: 'dsh-output-styles' } },
    })
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('not in the style library'))
  })

  it('rejects malformed style names on the durable boundary', () => {
    const { ctx, fail } = install({ knownStyles: () => undefined })
    ctx.emit('domain/changed', {
      domain: 'output_style', table: 'selection', key: 's-1', operation: 'put',
      value: { style: 'bad name!', source: { kind: 'plugin', plugin: 'dsh-output-styles' } },
    })
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('invalid style'))
  })

  it('ignores writes to other domains and tables', () => {
    const { ctx, fail } = install({ knownStyles: () => new Set(['concise']) })
    ctx.emit('domain/changed', {
      domain: 'other', table: 'selection', key: 's-1', operation: 'put',
      value: { style: 'Bad Name' },
    })
    ctx.emit('domain/changed', {
      domain: 'output_style', table: 'other', key: 's-1', operation: 'put',
      value: { style: 'Bad Name' },
    })
    expect(fail).not.toHaveBeenCalled()
  })

  it('verifies a successful switch command settled with a matching selection record', () => {
    const records = new Map<string, { style: string }>()
    const { ctx, session, fail } = install({
      knownStyles: () => undefined,
      selectionFor: id => records.get(id),
    })
    const run = { type: 'command/run', seq: 0, time: 0, data: { commandId: 'c-1', name: 'style', args: ' concise', source: { kind: 'user' } } }
    ctx.emit('session/event', session, run as unknown as SessionEvent)
    records.set(session.id, { style: 'concise' })
    const done = { type: 'command/done', seq: 1, time: 1, data: { commandId: 'c-1', kind: 'success', text: 'switched to concise' } }
    ctx.emit('session/event', session, done as unknown as SessionEvent)
    expect(fail).not.toHaveBeenCalled()
  })

  it('rejects a successful switch command whose selection record is missing', () => {
    const { ctx, session, fail } = install({
      knownStyles: () => undefined,
      selectionFor: () => undefined,
    })
    const run = { type: 'command/run', seq: 0, time: 0, data: { commandId: 'c-2', name: 'style', args: ' concise', source: { kind: 'user' } } }
    ctx.emit('session/event', session, run as unknown as SessionEvent)
    const done = { type: 'command/done', seq: 1, time: 1, data: { commandId: 'c-2', kind: 'success', text: 'switched to concise' } }
    ctx.emit('session/event', session, done as unknown as SessionEvent)
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('without a matching selection record'))
  })

  it('rejects /style off that leaves a selection record behind', () => {
    const records = new Map<string, { style: string }>([['s-1', { style: 'concise' }]])
    const { ctx, session, fail } = install({
      knownStyles: () => undefined,
      selectionFor: id => records.get(id),
    })
    const run = { type: 'command/run', seq: 0, time: 0, data: { commandId: 'c-3', name: 'style', args: ' off', source: { kind: 'user' } } }
    ctx.emit('session/event', session, run as unknown as SessionEvent)
    const done = { type: 'command/done', seq: 1, time: 1, data: { commandId: 'c-3', kind: 'success', text: 'output style off' } }
    ctx.emit('session/event', session, done as unknown as SessionEvent)
    expect(fail).toHaveBeenCalledWith(expect.stringContaining('selection record still exists'))
  })

  it('does not pair a failed command with the domain state', () => {
    const { ctx, session, fail } = install({
      knownStyles: () => undefined,
      selectionFor: () => undefined,
    })
    const run = { type: 'command/run', seq: 0, time: 0, data: { commandId: 'c-4', name: 'style', args: ' concise', source: { kind: 'user' } } }
    ctx.emit('session/event', session, run as unknown as SessionEvent)
    const done = { type: 'command/done', seq: 1, time: 1, data: { commandId: 'c-4', kind: 'error', text: 'boom' } }
    ctx.emit('session/event', session, done as unknown as SessionEvent)
    expect(fail).not.toHaveBeenCalled()
  })
})
