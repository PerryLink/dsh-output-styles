import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  messageText,
  normalizeReadResult,
  sessionEvidence,
  storageUnitPaths,
  systemPromptText,
} from '../scripts/session-log-evidence.mjs'

// Synthetic log shapes only: these helpers back scripts/verify-session-log.mjs,
// which reads real session logs, so the shapes are exercised here with plain
// data instead.
const STYLE_PROMPT = '# Output style: concise\n\nUse the following output style for every response.\n\n保持简洁，直接回答。\n\nDeepSeek Harness'

function systemMessageEvent(text: string, seq = 0) {
  return {
    type: 'system/message',
    seq,
    time: 0,
    data: {
      turn: seq,
      step: 0,
      message: {
        role: 'system',
        content: [{ type: 'text', text }],
        source: { kind: 'plugin', plugin: 'dsh-output-styles' },
      },
    },
    surfaceOp: 'append',
  }
}

function requestHeaderEvent(system: string, seq = 0) {
  return { type: 'request/header', seq, time: 0, data: { request: {}, header: { system } } }
}

describe('normalizeReadResult', () => {
  it('accepts the V3 { eventState, events } object and the legacy bare array', () => {
    const events = [systemMessageEvent(STYLE_PROMPT)]
    expect(normalizeReadResult({ eventState: { count: 1 }, events })).toEqual(events)
    expect(normalizeReadResult(events)).toEqual(events)
  })

  it('returns an empty list for an unrecognized or missing shape instead of throwing', () => {
    expect(normalizeReadResult(undefined)).toEqual([])
    expect(normalizeReadResult(null)).toEqual([])
    expect(normalizeReadResult({})).toEqual([])
    expect(normalizeReadResult({ events: undefined })).toEqual([])
  })
})

describe('messageText', () => {
  it('reads string content and the text parts of a block array', () => {
    expect(messageText({ content: 'plain' })).toBe('plain')
    expect(messageText({ content: [{ type: 'text', text: 'a' }, { type: 'tool_use', name: 'bash' }, { type: 'text', text: 'b' }] })).toBe('a\nb')
  })

  it('returns an empty string for anything else', () => {
    expect(messageText(undefined)).toBe('')
    expect(messageText(null)).toBe('')
    expect(messageText({ content: 42 })).toBe('')
    expect(messageText({})).toBe('')
  })
})

describe('systemPromptText', () => {
  it('prefers the V3 system/message node over a legacy request/header', () => {
    const events = [requestHeaderEvent('legacy text'), systemMessageEvent(STYLE_PROMPT, 1)]
    expect(systemPromptText(events)).toBe(STYLE_PROMPT)
  })

  it('takes the last system node even when it is empty (a dormant node never restores older text)', () => {
    expect(systemPromptText([systemMessageEvent(STYLE_PROMPT, 0), systemMessageEvent('', 1)])).toBe('')
  })

  it('falls back to request/header.system for stored V2 logs', () => {
    expect(systemPromptText([requestHeaderEvent('v2 system prompt')])).toBe('v2 system prompt')
  })

  it('returns an empty string when the log carries no system prompt', () => {
    expect(systemPromptText([])).toBe('')
    expect(systemPromptText([{ type: 'user/message', seq: 0, time: 0, data: {} }])).toBe('')
  })
})

describe('sessionEvidence', () => {
  it('reports counts and the output-style markers of a V3 log', () => {
    const events = [systemMessageEvent(STYLE_PROMPT, 0), { type: 'request/header', seq: 1, time: 0, data: { request: {}, header: {} } }]
    const evidence = sessionEvidence(events)
    expect(evidence).toMatchObject({
      eventCount: 2,
      systemMessageCount: 1,
      requestHeaderCount: 1,
      styleName: 'concise',
      hasStyleHeading: true,
      hasStyleBody: true,
      hasHarnessIdentity: true,
    })
    expect(evidence.excerpt.startsWith('# Output style: concise')).toBe(true)
    expect(evidence.excerpt.length).toBeLessThanOrEqual(240)
  })

  it('reports absent markers for a style-free log', () => {
    const evidence = sessionEvidence([{ type: 'user/message', seq: 0, time: 0, data: {} }])
    expect(evidence).toMatchObject({
      eventCount: 1,
      systemMessageCount: 0,
      requestHeaderCount: 0,
      styleName: undefined,
      hasStyleHeading: false,
      hasStyleBody: false,
      hasHarnessIdentity: false,
      excerpt: '',
    })
  })
})

describe('storageUnitPaths', () => {
  it('finds the single-layout whole-unit document', () => {
    expect(storageUnitPaths('storages', ['other.json', 'output_style.json'])).toEqual([join('storages', 'output_style.json')])
  })

  it('finds per-record layout files through the injected directory lister', () => {
    const paths = storageUnitPaths('storages', ['output_style'], () => ['selection.json', 'notes.txt'])
    expect(paths).toEqual([join('storages', 'output_style', 'selection.json')])
  })

  it('returns nothing for a root without the domain unit', () => {
    expect(storageUnitPaths('storages', ['sessions.json'])).toEqual([])
  })
})
