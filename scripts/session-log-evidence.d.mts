/**
 * Types for the pure session-log evidence helpers (`session-log-evidence.mjs`),
 * consumed by `tests/session-log-evidence.spec.ts`. The implementation is plain
 * ESM because `scripts/verify-session-log.mjs` runs under bare Node.
 */

/** The printed evidence for one session log. */
export interface SessionEvidence {
  /** Total events read. */
  readonly eventCount: number
  /** Number of `system/message` (V3 surface node 0) events. */
  readonly systemMessageCount: number
  /** Number of legacy `request/header` events. */
  readonly requestHeaderCount: number
  /** The model-visible system prompt text. */
  readonly system: string
  /** The `# Output style: <name>` capture, when present. */
  readonly styleName: string | undefined
  /** Whether the system prompt carries an output-style heading. */
  readonly hasStyleHeading: boolean
  /** Whether the concise style body reached the prompt. */
  readonly hasStyleBody: boolean
  /** Whether the harness identity rides alongside the style. */
  readonly hasHarnessIdentity: boolean
  /** The style section excerpt (240 chars), or `''`. */
  readonly excerpt: string
}

/** Normalize a `SessionHandle.read()` result (V3 object or legacy array). */
export function normalizeReadResult(readResult: unknown): readonly unknown[]

/** Plain text of one frozen LLM message (string content or text parts). */
export function messageText(message: unknown): string

/** The model-visible system prompt: V3 `system/message`, else `request/header.system`. */
export function systemPromptText(events: readonly unknown[]): string

/** Event counts plus the output-style markers of one session log. */
export function sessionEvidence(events: readonly unknown[]): SessionEvidence

/** Candidate `output_style` unit files under a storages root. */
export function storageUnitPaths(
  root: string,
  entries: readonly string[],
  listDirectory?: (directory: string) => readonly string[],
): string[]
