import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'
import type { ClientSessionContext } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { CommandDecoration } from '@deepseek-ai/dsh-client-ui-commands/client'
import type { StyleSelectionView } from '../src/types.ts'
import * as client from '../src/client/index.ts'

function makeView(current: string | null): StyleSelectionView {
  return {
    options: [
      { value: 'concise', name: 'concise', description: 'Terse.', whenToUse: 'Daily work' },
      { value: 'Diagrams first', name: 'Diagrams first', description: 'Lead with a diagram.' },
    ],
    currentValue: current,
  }
}

interface ClientDouble {
  ctx: Context
  decorations: CommandDecoration[]
  executes: { sessionId: string; line: string }[]
  dictionaries: string[][]
}

/** Compose a bare context with the client service doubles and apply the client plugin. */
async function makeClient(options?: {
  current?: string | null
  execute?: (sessionId: string, line: string) => Promise<{ ok: true; value: { result: unknown } } | { ok: false; error: { code: string; message: string } }>
}): Promise<ClientDouble> {
  const ctx = new Context()
  const decorations: CommandDecoration[] = []
  const executes: { sessionId: string; line: string }[] = []
  const dictionaries: string[][] = []
  ctx.provide('commandUi', {
    decorate: (decoration: CommandDecoration) => {
      decorations.push(decoration)
      return () => {}
    },
    register: () => { throw new Error('not used by this plugin') },
    popupFor: () => { throw new Error('not used by this plugin') },
  })
  ctx.provide('sessions', {
    binding: () => ({
      session: {
        projections: {
          faceOf: (key: string) => ({
            getSnapshot: () => (key === 'style' ? makeView(options?.current ?? null) : undefined),
            subscribe: () => () => {},
          }),
        },
      },
    }),
  })
  ctx.provide('locale', {
    register: (_ns: string, dicts: object) => {
      dictionaries.push(Object.keys(dicts))
      return () => {}
    },
    bind: () => (key: string) => key,
  })
  ctx.provide('remote', {
    commands: {
      execute: (sessionId: string, line: string) => {
        executes.push({ sessionId, line })
        return options?.execute?.(sessionId, line)
          ?? Promise.resolve({ ok: true, value: { result: { kind: 'success', text: 'ok' } } })
      },
    },
  })
  await ctx.plugin(client)
  return { ctx, decorations, executes, dictionaries }
}

const session: ClientSessionContext = { sessionId: SessionId('s-1') }

describe('dsh-output-styles client picker', () => {
  it('decorates the host /style command with projection-backed options', async () => {
    const { decorations, dictionaries } = await makeClient({ current: 'concise' })
    expect(decorations).toHaveLength(1)
    const decoration = decorations[0]
    expect(decoration?.name).toBe('style')
    expect(decoration?.available(session)).toBe(true)

    const options = await decoration?.ui.options(session, new AbortController().signal)
    expect(options?.map(option => option.id)).toEqual(['off', 'concise', 'Diagrams first'])
    expect(options?.[0]).toMatchObject({ label: 'option.off', active: false })
    expect(options?.[1]).toMatchObject({ label: 'concise', detail: 'Terse. · Daily work', active: true })
    expect(options?.[2]).toMatchObject({ label: 'Diagrams first', detail: 'Lead with a diagram.', active: false })
    expect(dictionaries).toEqual([['zh', 'en']])
  })

  it('marks the off row active when the session has no selection', async () => {
    const { decorations } = await makeClient()
    const decoration = decorations[0]
    const options = await decoration?.ui.options(session, new AbortController().signal)
    expect(options?.[0]).toMatchObject({ active: true })
  })

  it('submits the completed command line on select, including multi-word names and off', async () => {
    const { decorations, executes } = await makeClient()
    const decoration = decorations[0]
    const options = await decoration?.ui.options(session, new AbortController().signal)
    await decoration?.ui.onSelect(options?.[2]!, session)
    await decoration?.ui.onSelect(options?.[0]!, session)
    expect(executes).toEqual([
      { sessionId: 's-1', line: '/style Diagrams first' },
      { sessionId: 's-1', line: '/style off' },
    ])
  })

  it('surfaces a remote refusal as a settlement failure', async () => {
    const { decorations } = await makeClient({
      execute: () => Promise.resolve({ ok: false, error: { code: 'REMOTE', message: 'boom' } }),
    })
    const decoration = decorations[0]
    const options = await decoration?.ui.options(session, new AbortController().signal)
    await expect(decoration?.ui.onSelect(options?.[1]!, session)).rejects.toThrow('REMOTE')
  })

  it('surfaces an unmatched command as a settlement failure', async () => {
    const { decorations } = await makeClient({
      execute: () => Promise.resolve({ ok: true, value: undefined as never }),
    })
    const decoration = decorations[0]
    const options = await decoration?.ui.options(session, new AbortController().signal)
    await expect(decoration?.ui.onSelect(options?.[1]!, session)).rejects.toThrow(/unknown or malformed command/)
  })

  it('returns no options when the style projection has not arrived', async () => {
    const { decorations } = await makeClient()
    // A binding-less session (not listed/scoped) yields an empty picker.
    const ctx = new Context()
    ctx.provide('commandUi', {
      decorate: (decoration: CommandDecoration) => { decorations.push(decoration); return () => {} },
    })
    ctx.provide('sessions', { binding: () => undefined })
    ctx.provide('locale', { register: () => () => {}, bind: () => (key: string) => key })
    ctx.provide('remote', { commands: { execute: async () => ({ ok: true, value: { result: {} } }) } })
    await ctx.plugin(client)
    const decoration = decorations[decorations.length - 1]
    const options = await decoration?.ui.options(session, new AbortController().signal)
    expect(options).toEqual([])
  })
})
