import { describe, expect, it } from 'vitest'
import { applyStyleEvent, EMPTY_STYLE_STATE, parseStyleInput } from '../src/style-command.ts'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

const SWITCH_RUN = {
  type: 'command/run',
  seq: 0,
  time: 0,
  data: {
    commandId: 'cmd-1' as never,
    name: 'style',
    args: ' concise',
    source: { kind: 'user' },
  },
} as unknown as SessionEvent

const OFF_RUN = {
  type: 'command/run',
  seq: 1,
  time: 1,
  data: {
    commandId: 'cmd-2' as never,
    name: 'style',
    args: ' off',
    source: { kind: 'user' },
  },
} as unknown as SessionEvent

const SWITCH_DONE = {
  type: 'command/done',
  seq: 2,
  time: 2,
  data: {
    commandId: 'cmd-1' as never,
    kind: 'success',
    text: 'switched to concise',
  },
} as unknown as SessionEvent

const OFF_DONE = {
  type: 'command/done',
  seq: 3,
  time: 3,
  data: {
    commandId: 'cmd-2' as never,
    kind: 'success',
    text: 'output style off',
  },
} as unknown as SessionEvent

describe('parseStyleInput', () => {
  it('parses the empty input as none (the listing form)', () => {
    expect(parseStyleInput('')).toEqual({ kind: 'none' })
    expect(parseStyleInput('   ')).toEqual({ kind: 'none' })
  })

  it('parses off as the restore-default switch', () => {
    expect(parseStyleInput('off')).toEqual({ kind: 'off' })
    expect(parseStyleInput(' off ')).toEqual({ kind: 'off' })
  })

  it('parses a single token as a style switch', () => {
    expect(parseStyleInput('concise')).toEqual({ kind: 'switch', name: 'concise' })
    expect(parseStyleInput(' step-by-step ')).toEqual({ kind: 'switch', name: 'step-by-step' })
  })

  it('takes the whole remainder as the style name (names may contain spaces)', () => {
    expect(parseStyleInput('concise extra')).toEqual({ kind: 'switch', name: 'concise extra' })
    expect(parseStyleInput(' Diagrams first ')).toEqual({ kind: 'switch', name: 'Diagrams first' })
  })
})

describe('applyStyleEvent', () => {
  it('commits a switch only when its command/done settles successfully', () => {
    let state = applyStyleEvent(EMPTY_STYLE_STATE, SWITCH_RUN)
    expect(state).toEqual({ current: null, pending: { commandId: 'cmd-1', target: { name: 'concise' } } })
    state = applyStyleEvent(state, SWITCH_DONE)
    expect(state).toEqual({ current: 'concise', pending: null })
  })

  it('commits /style off back to null on success', () => {
    let state = applyStyleEvent({ current: 'concise', pending: null }, OFF_RUN)
    state = applyStyleEvent(state, OFF_DONE)
    expect(state).toEqual({ current: null, pending: null })
  })

  it('drops a failed switch without touching the current selection', () => {
    const seeded = { current: 'step-by-step', pending: null }
    const failedDone = {
      ...SWITCH_DONE,
      data: { ...SWITCH_DONE.data, kind: 'error' },
    } as unknown as SessionEvent
    let state = applyStyleEvent(seeded, SWITCH_RUN)
    state = applyStyleEvent(state, failedDone)
    expect(state).toEqual({ current: 'step-by-step', pending: null })
  })

  it('drops an aborted off-delete and keeps the selection', () => {
    const seeded = { current: 'concise', pending: null }
    const abortedDone = {
      ...OFF_DONE,
      data: { ...OFF_DONE.data, kind: 'error' },
    } as unknown as SessionEvent
    let state = applyStyleEvent(seeded, OFF_RUN)
    state = applyStyleEvent(state, abortedDone)
    expect(state).toEqual({ current: 'concise', pending: null })
  })

  it('ignores a command/done whose commandId has no pending run', () => {
    const state = { current: 'concise', pending: null }
    expect(applyStyleEvent(state, SWITCH_DONE)).toBe(state)
  })

  it('returns the same state reference for unrelated events and empty listings', () => {
    const state = { current: 'concise', pending: null }
    const otherEvent = { ...SWITCH_RUN, type: 'todo/write', data: { todos: [] } } as unknown as SessionEvent
    const otherCommand = {
      ...SWITCH_RUN,
      data: { ...SWITCH_RUN.data, name: 'permission' },
    } as unknown as SessionEvent
    const emptyListing = {
      ...SWITCH_RUN,
      data: { ...SWITCH_RUN.data, args: '  ' },
    } as unknown as SessionEvent
    expect(applyStyleEvent(state, otherEvent)).toBe(state)
    expect(applyStyleEvent(state, otherCommand)).toBe(state)
    expect(applyStyleEvent(state, emptyListing)).toBe(state)
  })
})
