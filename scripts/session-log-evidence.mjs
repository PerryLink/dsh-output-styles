// Pure shape handling behind scripts/verify-session-log.mjs. Extracted so the
// session-format V3 shapes stay unit-testable without reading any real session
// log: the CLI opens $DSH_HOME/sessions, this module performs no I/O at all.
//
// V3 (dsh-v0.1.5-alpha.1) moved the rendered system prompt from
// `request/header.system` onto the surface as node 0 (`system/message`), and
// changed `SessionHandle.read()` from an event array to
// `{ eventState, events }`. Both shapes are handled here, with the V2 forms
// kept as a read-compatibility fallback.
import { join } from 'node:path'

/**
 * Normalize a `SessionHandle.read()` result into a flat event list. Accepts
 * the V3 `{ eventState, events }` object and the legacy bare array.
 * @param readResult - the value returned by `handle.read()`.
 * @returns the events, or an empty list for an unrecognized shape.
 */
export function normalizeReadResult(readResult) {
  if (Array.isArray(readResult)) return readResult
  if (readResult !== null && typeof readResult === 'object' && Array.isArray(readResult.events)) {
    return readResult.events
  }
  return []
}

/**
 * Plain text of one frozen LLM message: string content, or the text parts of a
 * content block array (tool parts are ignored — a system prompt never carries
 * them, and this stays a projection, not an interpretation).
 * @param message - a message-shaped object.
 * @returns the text, or `''` when there is none.
 */
export function messageText(message) {
  const content = message !== null && typeof message === 'object' ? message.content : undefined
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const part of content) {
    if (part !== null && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string') {
      parts.push(part.text)
    }
  }
  return parts.join('\n')
}

/**
 * The model-visible system prompt of a log. V3: the last `system/message`
 * event (an empty later node is dormant and deliberately never restores older
 * text, so the last node wins even when empty). V2 fallback: the last
 * `request/header.system` when the log has no `system/message` at all.
 * @param events - session events in seq order.
 * @returns the system prompt text, or `''`.
 */
export function systemPromptText(events) {
  const systemEvents = events.filter(event => event !== null && typeof event === 'object' && event.type === 'system/message')
  if (systemEvents.length > 0) return messageText(systemEvents[systemEvents.length - 1]?.data?.message)
  const headers = events.filter(event => event !== null && typeof event === 'object' && event.type === 'request/header')
  const system = headers[headers.length - 1]?.data?.header?.system
  return typeof system === 'string' ? system : ''
}

/**
 * The printed evidence for one session log: event counts, the active system
 * prompt, and the output-style markers a human auditor looks for.
 * @param events - session events in seq order.
 * @returns the evidence record (all fields plain data).
 */
export function sessionEvidence(events) {
  const systemMessageCount = events.filter(event => event !== null && typeof event === 'object' && event.type === 'system/message').length
  const requestHeaderCount = events.filter(event => event !== null && typeof event === 'object' && event.type === 'request/header').length
  const system = systemPromptText(events)
  const styleMatch = /# Output style: ([^\n]+)/.exec(system)
  const styleStart = system.indexOf('# Output style:')
  return {
    eventCount: events.length,
    systemMessageCount,
    requestHeaderCount,
    system,
    styleName: styleMatch === null ? undefined : styleMatch[1],
    hasStyleHeading: styleMatch !== null,
    // The concise style body is a stable, distinctive marker for "the style
    // body reached the model", not a summary of the prompt.
    hasStyleBody: system.includes('保持简洁'),
    // keep-coding-instructions: false — the style replaces the whole prompt,
    // so the harness identity is absent while a style heading is present.
    hasHarnessIdentity: system.includes('DeepSeek Harness'),
    excerpt: styleStart === -1 ? '' : system.slice(styleStart, styleStart + 240),
  }
}

/**
 * Candidate unit files for the `output_style` domain under a storages root.
 * The json backend's `single` layout writes one whole-unit document at
 * `<root>/<name>.json`; the `per-record` layout writes `<root>/<name>/<key>.json`.
 * @param root - the storages root directory.
 * @param entries - `readdirSync(root)` output.
 * @param listDirectory - `readdirSync`, injected for the per-record layout.
 * @returns absolute candidate file paths, in deterministic order.
 */
export function storageUnitPaths(root, entries, listDirectory) {
  const paths = []
  for (const entry of entries) {
    if (entry === 'output_style.json') {
      paths.push(join(root, entry))
    } else if (entry === 'output_style' && typeof listDirectory === 'function') {
      for (const file of listDirectory(join(root, entry))) {
        if (file.endsWith('.json')) paths.push(join(root, entry, file))
      }
    }
  }
  return paths
}
