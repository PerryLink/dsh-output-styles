import { describe, expect, it } from 'vitest'
import { createSystemMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { conversationLines, toHtml, toMarkdown } from '../src/export.ts'
import { createStyleHarness } from './harness.ts'

// A synthetic V3 surface: node 0 is the rendered system prompt
// (`system/message`), which the model request carries but a human transcript
// never showed. No real session data is involved.
const STYLE_PROMPT = [
  '# Output style: concise',
  '',
  'Use the following output style for every response in this conversation:',
  '',
  '保持简洁，直接回答。',
  '',
  'DeepSeek Harness',
].join('\n')

function systemEvent(text: string) {
  return createSystemMessage(text, 'dsh-output-styles')
}

describe('conversationLines over a V3 surface', () => {
  it('excludes the system/message surface node and keeps the user turn', async () => {
    const harness = await createStyleHarness()
    try {
      const session = harness.makeSession()
      session.append('system/message', { turn: 0, step: 0, message: systemEvent(STYLE_PROMPT) }, { surfaceOp: 'append' })
      session.append('user/message', createUserMessage({
        content: [{ type: 'text', text: 'ship it' }],
        source: { kind: 'user' },
      }), { surfaceOp: 'append' })

      const events = session.snapshotEvents()
      expect(events.some(event => event.type === 'system/message')).toBe(true)
      const lines = conversationLines(events)
      expect(lines).toEqual([{ role: 'user', text: 'ship it' }])
      const markdown = toMarkdown(lines)
      expect(markdown).toContain('## User\n\nship it')
      expect(markdown.match(/^## User$/gmu)).toHaveLength(1)
      expect(markdown).not.toContain('Output style')
      expect(markdown).not.toContain('保持简洁')
      expect(markdown).not.toContain('DeepSeek Harness')
      expect(toHtml(lines)).not.toContain('Output style')
    } finally {
      await harness.dispose()
    }
  })

  it('excludes a dormant later system node without restoring the older text', async () => {
    const harness = await createStyleHarness()
    try {
      const session = harness.makeSession()
      session.append('system/message', { turn: 0, step: 0, message: systemEvent(STYLE_PROMPT) }, { surfaceOp: 'append' })
      // An empty later system node records "no system prompt": the older text
      // is deliberately never model-visible again, so it must not leak into the
      // transcript either.
      session.append('system/message', { turn: 1, step: 0, message: systemEvent('') }, { surfaceOp: 'append' })
      session.append('user/message', createUserMessage({
        content: [{ type: 'text', text: 'hello' }],
        source: { kind: 'user' },
      }), { surfaceOp: 'append' })

      expect(conversationLines(session.snapshotEvents())).toEqual([{ role: 'user', text: 'hello' }])
    } finally {
      await harness.dispose()
    }
  })

  it('keeps pre-V3 stored logs unchanged: request/header.system never enters the transcript', async () => {
    // A V2 log: the system prompt lives in a log-only `request/header` event
    // (removed from the header type in V3), so it is not a surface node at all.
    // Built as plain data because no supported host can append this shape.
    const legacy = [
      {
        type: 'request/header',
        seq: 0,
        time: 0,
        data: { request: {}, header: { system: STYLE_PROMPT } },
      },
      {
        type: 'user/message',
        seq: 1,
        time: 0,
        data: createUserMessage({ content: [{ type: 'text', text: 'legacy turn' }], source: { kind: 'user' } }),
        surfaceOp: 'append',
      },
    ] as unknown as SessionEvent[]
    expect(conversationLines(legacy)).toEqual([{ role: 'user', text: 'legacy turn' }])
  })
})

describe('/export over a V3 surface', () => {
  it('renders only the conversation, not the system prompt', async () => {
    const harness = await createStyleHarness()
    try {
      const session = harness.makeSession()
      session.append('system/message', { turn: 0, step: 0, message: systemEvent(STYLE_PROMPT) }, { surfaceOp: 'append' })
      session.append('user/message', createUserMessage({
        content: [{ type: 'text', text: 'ship it' }],
        source: { kind: 'user' },
      }), { surfaceOp: 'append' })

      const execution = await harness.runExport(session, '/export md')
      expect(execution?.result).toMatchObject({ kind: 'success' })
      const text = execution?.result.text ?? ''
      expect(text).toContain('## User\n\nship it')
      expect(text).not.toContain('Output style')
      expect(text).not.toContain('保持简洁')

      const html = await harness.runExport(session, '/export html')
      expect(html?.result.text ?? '').not.toContain('Output style')
    } finally {
      await harness.dispose()
    }
  })
})
