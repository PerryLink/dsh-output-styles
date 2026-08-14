/**
 * Package-owned invariant companion for `dsh-output-styles`.
 *
 * Two post-commit diagnostic checks over the events this plugin's write path
 * produces (both target events are committed before dispatch, so a violation
 * is reported — via the host registry's `fail` — rather than vetoed):
 *
 * 1. Every `output_style`/`selection` durable write carries this plugin's own
 *    source marker and a legal style name; when the library is known,
 *    the name must be a library member.
 * 2. A successful `/style <name>` command has a matching selection record on
 *    its session by the time its `command/done` settles, and `/style off`
 *    leaves no record. The standalone companion (no library/domain handle)
 *    skips this check.
 *
 * The main plugin registers a facts-bearing installer from its own context;
 * the `./invariant` export is the standalone companion usable through a
 * separate profile row.
 * @module dsh-output-styles/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Session, SessionEvent, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-commands'
import type { DomainChanged } from '@deepseek-ai/dsh-storage-domain'
import { parseStyleInput, STYLE_COMMAND } from './style-command.ts'
import { isValidStyleName } from './style-library.ts'
import { OFF, STYLE_SOURCE } from './types.ts'

/** Full npm package name owning the reported failures. */
export const PACKAGE_NAME = 'dsh-output-styles'

/** A package-attributed invariant failure reported by the host registry. */
export type InvariantFailure = (message: string) => never

/** Facts the installer needs beyond the event stream. */
export interface InvariantFacts {
  /** Library style names, or undefined when the companion has no library handle. */
  knownStyles(): ReadonlySet<string> | undefined
  /** One session's durable selection record; absent disables the pairing check. */
  selectionFor?(sessionId: SessionId): { style: string } | undefined
}

/** Installer callback accepted by the host's invariant registry. */
export type InvariantInstaller = (ctx: Context, fail: InvariantFailure) => void | Promise<void>

/** Minimal runtime contract used by the companion without a source checkout. */
export interface InvariantRegistry {
  register(packageName: string, installer: InvariantInstaller): () => void
}

/** Cordis companion plugin name. */
export const name = 'dsh-output-styles-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** Facts for the standalone companion: envelope checks only, no library/domain handle. */
const COMPANION_FACTS: InvariantFacts = {
  knownStyles: () => undefined,
}

/** One `/style` command run awaiting its `command/done`. */
interface PendingSwitch {
  session: Session
  expected: { name: string } | { off: true }
}

/**
 * Build the installer over a facts source. The standalone companion and the
 * main plugin share this body; only the facts differ.
 * @param facts - library and domain access for the checks.
 * @returns the installer the host registry activates in its child context.
 */
export function installInvariant(facts: InvariantFacts): InvariantInstaller {
  return (ctx, fail) => {
    const pending = new Map<string, PendingSwitch>()

    ctx.on('domain/changed', (change: DomainChanged) => {
      if (change.domain !== 'output_style' || change.table !== 'selection' || change.operation !== 'put') return
      const value = change.value as { style?: unknown; source?: unknown }
      if (typeof value.style !== 'string' || !isValidStyleName(value.style)) {
        fail(`selection record names invalid style ${JSON.stringify(value.style)}`)
      }
      if (JSON.stringify(value.source) !== JSON.stringify(STYLE_SOURCE)) {
        fail(`selection record source is ${JSON.stringify(value.source)}; expected this plugin's own marker`)
      }
      const known = facts.knownStyles()
      if (known !== undefined && typeof value.style === 'string' && !known.has(value.style)) {
        fail(`selection record names style "${value.style}" that is not in the style library`)
      }
    })

    ctx.on('session/event', (session: Session, event: SessionEvent) => {
      if (event.type === 'command/run'
        && event.data.name === STYLE_COMMAND
        && event.data.args !== undefined) {
        const input = parseStyleInput(event.data.args)
        if (input.kind === 'off') {
          pending.set(String(event.data.commandId), { session, expected: { off: true } })
        } else if (input.kind === 'switch') {
          pending.set(String(event.data.commandId), { session, expected: { name: input.name } })
        }
        return
      }
      if (event.type !== 'command/done') return
      const entry = pending.get(String(event.data.commandId))
      if (entry === undefined) return
      pending.delete(String(event.data.commandId))
      if (event.data.kind !== 'success' || facts.selectionFor === undefined) return
      const record = facts.selectionFor(entry.session.id)
      if ('off' in entry.expected) {
        if (record !== undefined) {
          fail(`/style ${OFF} settled on session "${entry.session.id}" but its selection record still exists`)
        }
      } else if (record === undefined || record.style !== entry.expected.name) {
        fail(`/style ${entry.expected.name} settled on session "${entry.session.id}" without a matching selection record`)
      }
    }, { global: true })
  }
}

/**
 * Resolve the host registry through Cordis's named service lookup. Keeping
 * this narrow local contract lets the companion build without host source
 * files; a composed DSH profile still supplies the real `invariants` service.
 * @param ctx - Cordis context carrying the host service.
 * @returns the host invariant registry.
 * @throws {Error} when the companion is loaded without its host service.
 */
function getInvariantRegistry(ctx: Context): InvariantRegistry {
  const registry = ctx.get('invariants') as InvariantRegistry | undefined
  if (registry === undefined) {
    throw new Error(`invariant companion requires the "invariants" service for ${PACKAGE_NAME}`)
  }
  return registry
}

/**
 * Register the standalone companion with envelope-only facts.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(getInvariantRegistry(ctx).register(PACKAGE_NAME, installInvariant(COMPANION_FACTS)))
