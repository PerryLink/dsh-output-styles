/**
 * Strict parsing of the `/style` command input and the pure projection fold
 * over its logged lifecycle events.
 *
 * The handler and the session-projection unit share {@link parseStyleInput}:
 * the projection folds exactly the inputs the handler accepts, so the
 * displayed selection can never diverge from what the command did.
 * @module dsh-output-styles/style-command
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-commands'
import { OFF } from './types.ts'

/** Command name registered on `ctx.commands`; also the log's `command/run` name. */
export const STYLE_COMMAND = 'style'

/** One strict parse of a `/style` input line. */
export type StyleInput =
  | { kind: 'none' }
  | { kind: 'off' }
  | { kind: 'switch'; name: string }

/**
 * Parse the text after `/style` into one switch decision. The empty string
 * is `none` — the handler treats it as the listing form, and the projection
 * fold ignores it. Anything else is a switch: `off` restores the default,
 * and every other input is one style name taken verbatim (style names may
 * contain spaces, so the whole remainder is the candidate). Unknown names
 * are rejected by the handler against the library, and the fold commits only
 * what the handler reports as successful, so both sides agree on what
 * actually switched.
 * @param rawInput - verbatim text after the command name.
 * @returns the decision; non-empty inputs other than `off` name a style.
 */
export function parseStyleInput(rawInput: string): StyleInput {
  const arg = rawInput.trim()
  if (arg === '') return { kind: 'none' }
  if (arg === OFF) return { kind: 'off' }
  return { kind: 'switch', name: arg }
}

/** Projection-fold state: the last settled selection plus the in-flight switch. */
export interface StyleFoldState {
  /** Accepted switch target that settled successfully, or null when the session's style was turned off. */
  current: string | null
  /**
   * One `/style` run that entered its handler but has not settled yet: its
   * `command/run` claimed this slot and only its paired `command/done`
   * resolves it. A failed or aborted run drops the target without touching
   * `current`, so the folded state always mirrors what the write path actually
   * committed.
   */
  pending: { commandId: string; target: { name: string } | { off: true } } | null
}

/** State for the empty log. */
export const EMPTY_STYLE_STATE: StyleFoldState = { current: null, pending: null }

/**
 * One-event transition of the `style` projection unit. Only a successful
 * `/style` command settles into `current`: `command/run` parks the target as
 * `pending` and its paired `command/done` commits it on `kind: 'success'` or
 * drops it otherwise. Every other event returns the same reference (the
 * registry's change gate).
 * @param state - the folded state before `event`.
 * @param event - one committed session event.
 * @returns the next state; the same reference when the event leaves it unchanged.
 */
export function applyStyleEvent(state: StyleFoldState, event: SessionEvent): StyleFoldState {
  if (event.type === 'command/run') {
    if (event.data.name !== STYLE_COMMAND || event.data.args === undefined) return state
    const input = parseStyleInput(event.data.args)
    if (input.kind === 'none') return state
    const commandId = String(event.data.commandId)
    if (state.pending?.commandId === commandId) return state
    const target: { name: string } | { off: true } = input.kind === 'off' ? { off: true } : { name: input.name }
    return { ...state, pending: { commandId, target } }
  }
  if (event.type !== 'command/done' || state.pending === null) return state
  if (state.pending.commandId !== String(event.data.commandId)) return state
  if (event.data.kind !== 'success') {
    // The handler reported failure or was aborted: the selection record was
    // not written (or the off-delete did not land), so current stays put.
    return { current: state.current, pending: null }
  }
  const current = 'off' in state.pending.target ? null : state.pending.target.name
  return { current, pending: null }
}
