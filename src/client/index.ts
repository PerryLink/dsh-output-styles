/**
 * Browser half of `dsh-output-styles`: a popup picker decorating the HOST
 * `/style` command. The picker reads the `style` session projection
 * (`{ options, currentValue }`), which the host plugin keeps fresh, and
 * submits the completed `/style <name>` / `/style off` line back through the
 * command Remote — so every switch keeps the host's durable command
 * lifecycle (`command/run`/`command/done`) and the projection stays the
 * single displayed fact.
 * @module dsh-output-styles/client
 */

import type { ClientContext, ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { CommandUiContract, SelectOption } from '@deepseek-ai/dsh-client-ui-commands/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { StyleSelectionView } from '../types.ts'
import { en, zh, type StyleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The style picker's copy. */
    style: StyleKey
  }
}

/** Client plugin name; keep stable after publishing. */
export const name = 'dsh-output-styles-client'

/** Required client services: the command surface, the sessions face, the command Remote, and locale. */
export const inject = ['commandUi', 'locale', 'remote', 'sessions']

/** Dictionary namespace owned by this plugin. */
const NS = 'style'

/** The picker row that restores the project default; stable, never a style name. */
const OFF_ID = 'off'

/** Flatten the projection into picker rows: the off row first, then one row per style. */
function optionsOf(view: StyleSelectionView, t: TranslateNS<typeof NS>): SelectOption[] {
  const rows: SelectOption[] = [{
    id: OFF_ID,
    label: t('option.off'),
    detail: t('option.offDetail'),
    active: view.currentValue === null,
  }]
  for (const option of view.options) {
    rows.push({
      id: option.value,
      label: option.name,
      detail: option.whenToUse !== undefined
        ? `${option.description} · ${option.whenToUse}`
        : option.description,
      active: view.currentValue === option.value,
    })
  }
  return rows
}

/**
 * Client plugin body: register the `style` dictionaries and decorate the
 * host `/style` command's bare invocation with the projection-backed picker.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-output-styles: style dictionaries')
  const t = ctx.locale.bind(NS)

  ctx.inject(['commandUi', 'remote', 'sessions'], (scope: ClientContext) => {
    const commandUi = scope.get('commandUi') as CommandUiContract
    // The host graph (`dsh-session`) and the client graph (`dsh-client-runtime`)
    // both declare a `sessions` service on Context; this package compiles
    // against both faces, so the runtime value is the client service named
    // 'sessions' and the host type is what the merged declaration resolves.
    const sessions = scope.get('sessions') as unknown as ISessions
    const remote = scope.remote

    scope.effect(() => commandUi.decorate({
      name: 'style',
      available: () => true,
      ui: {
        kind: 'popupSelect',
        options: async (session) => {
          const binding = sessions.binding(session.sessionId)
          const view = binding?.session.projections.faceOf('style').getSnapshot() as StyleSelectionView | undefined
          if (view === undefined) return []
          return optionsOf(view, t)
        },
        onSelect: async (option, session) => {
          const line = option.id === OFF_ID ? '/style off' : `/style ${option.id}`
          const result = await remote.commands.execute(session.sessionId, line, [])
          if (!result.ok) {
            throw new Error(`command.execute failed: ${result.error.code}: ${result.error.message}`)
          }
          if (result.value === undefined) {
            throw new Error(`unknown or malformed command: ${line}`)
          }
        },
      },
    }), 'dsh-output-styles: /style picker')
  })
}

export type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
