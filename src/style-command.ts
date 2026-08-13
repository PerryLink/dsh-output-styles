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
 * and multi-token inputs are `none` — the handler reports them (listing or
 * unknown-name error), and the projection fold treats them as no-ops, so
 * both sides agree on what actually switched.
 * @param rawInput - verbatim text after the command name.
 * @returns the decision; single-token inputs other than `off` name a style.
 */
export function parseStyleInput(rawInput: string): StyleInput {
  const arg = rawInput.trim()
  if (arg === '' || /\s/.test(arg)) return { kind: 'none' }
  if (arg === OFF) return { kind: 'off' }
  return { kind: 'switch', name: arg }
}

/** Projection-fold state: the last accepted style token, null after `/style off`. */
export interface StyleFoldState {
  /** Accepted switch target, or null when the session's style was turned off. */
  current: string | null
}

/** State for the empty log. */
export const EMPTY_STYLE_STATE: StyleFoldState = { current: null }

/**
 * One-event transition of the `style` projection unit. Only accepted
 * `/style` switches change the state; every other event returns the same
 * reference (the registry's change gate).
 * @param state - the folded state before `event`.
 * @param event - one committed session event.
 * @returns the next state; the same reference when the event is not an
 *   accepted style switch.
 */
export function applyStyleEvent(state: StyleFoldState, event: SessionEvent): StyleFoldState {
  if (event.type !== 'command/run' || event.data.name !== STYLE_COMMAND || event.data.args === undefined) {
    return state
  }
  const input = parseStyleInput(event.data.args)
  if (input.kind === 'none') return state
  const current = input.kind === 'off' ? null : input.name
  return current === state.current ? state : { current }
}
