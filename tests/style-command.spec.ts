import { describe, expect, it } from 'vitest'
import { applyStyleEvent, EMPTY_STYLE_STATE, parseStyleInput } from '../src/style-command.ts'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

const SWITCH_EVENT = {
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

const OFF_EVENT = {
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

  it('rejects multi-token input as none (the handler reports an unknown name)', () => {
    expect(parseStyleInput('concise extra')).toEqual({ kind: 'none' })
  })
})

describe('applyStyleEvent', () => {
  it('folds an accepted switch into the state', () => {
    expect(applyStyleEvent(EMPTY_STYLE_STATE, SWITCH_EVENT)).toEqual({ current: 'concise' })
  })

  it('folds /style off back to null', () => {
    expect(applyStyleEvent({ current: 'concise' }, OFF_EVENT)).toEqual({ current: null })
  })

  it('returns the same state reference for unrelated events and rejected inputs', () => {
    const state = { current: 'concise' }
    const otherEvent = { ...SWITCH_EVENT, type: 'todo/write', data: { todos: [] } } as unknown as SessionEvent
    const otherCommand = {
      ...SWITCH_EVENT,
      data: { ...SWITCH_EVENT.data, name: 'permission' },
    } as unknown as SessionEvent
    const multiToken = {
      ...SWITCH_EVENT,
      data: { ...SWITCH_EVENT.data, args: 'concise extra' },
    } as unknown as SessionEvent
    const repeated = { ...SWITCH_EVENT, seq: 9 } as unknown as SessionEvent
    expect(applyStyleEvent(state, otherEvent)).toBe(state)
    expect(applyStyleEvent(state, otherCommand)).toBe(state)
    expect(applyStyleEvent(state, multiToken)).toBe(state)
    expect(applyStyleEvent(state, repeated)).toBe(state)
  })
})
