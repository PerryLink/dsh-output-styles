/**
 * Session export: a pure projection of the current session's message surface
 * into Markdown or sanitized HTML, with renderer application on top. The
 * extraction reads only the public `session.events` log through the official
 * `deriveEventMessage` projection — the same rule the harness uses to build
 * model requests — so the exported document is reconstructable from the log.
 * Every render application preserves the original text beside the rendered
 * one, keeping the auditable pair intact inside the export document.
 *
 * Host-side module (imports the dsh-session surface projection); the pure
 * Markdown/HTML/sanitize functions stay free of both DOM and I/O.
 * @module dsh-output-styles/export
 */

import { deriveEventMessage, foldSurface } from '@deepseek-ai/dsh-session/surface'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { RendererRegistry, RenderedText } from './renderers.ts'

/** One exported conversation line. */
export interface ExportLine {
  /** Speaker role: 'user', 'assistant', or 'tool'. */
  readonly role: 'user' | 'assistant' | 'tool'
  /** The original message text (or tool-call/tool-result rendering). */
  readonly text: string
  /** Tool name for tool lines, otherwise undefined. */
  readonly tool?: string
}

/** A completed export document (renderer application included). */
export interface ExportDocument {
  readonly plugin: 'dsh-output-styles'
  readonly schema: 'output-export-v1'
  readonly format: 'markdown' | 'html'
  readonly exportedAt: string
  /** The rendered document text (what the user copies/downloads). */
  readonly text: string
  readonly lines: readonly ExportLine[]
  readonly rendered: readonly RenderedText[]
}

/**
 * Extract the message surface of a session log as plain lines. Tool calls and
 * tool results render as labeled lines so the transcript stays readable; the
 * content is never summarized — this is a projection, not an interpretation.
 * @param events - the session log, in seq order.
 * @returns the conversation lines in surface order.
 */
export function conversationLines(events: readonly SessionEvent[]): ExportLine[] {
  const { nodes } = foldSurface(events)
  const lines: ExportLine[] = []
  for (const seq of nodes) {
    const event = events.find(item => item.seq === seq)
    if (event === undefined) continue
    const message = deriveEventMessage(event)
    if (message === null) continue
    const described = describeMessage(message)
    if (described.text === '') continue
    lines.push(described)
  }
  return lines
}

/**
 * Project one derived message into an export line: string content becomes a
 * user/assistant line; a content carrying only tool_use parts becomes a tool
 * call line; only tool_result parts become a tool result line. Mixed content
 * keeps the text parts and the message role.
 */
function describeMessage(message: { readonly content?: unknown; readonly role?: string }): ExportLine {
  const content = message.content
  const baseRole: 'user' | 'assistant' = message.role === 'assistant' ? 'assistant' : 'user'
  if (typeof content === 'string') {
    return { role: baseRole, text: content.trim() }
  }
  if (Array.isArray(content)) {
    const textParts: string[] = []
    const toolUses: string[] = []
    const toolResults: string[] = []
    for (const part of content) {
      if (part === null || typeof part !== 'object') continue
      const record = part as Record<string, unknown>
      if (record['type'] === 'text' && typeof record['text'] === 'string') {
        textParts.push(record['text'])
      } else if (record['type'] === 'tool_use') {
        toolUses.push(String(record['name'] ?? 'tool'))
      } else if (record['type'] === 'tool_result') {
        const raw = record['content']
        const body = typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw.map(item => typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>)['text'] === 'string' ? (item as Record<string, unknown>)['text'] : '').join(' ')
            : ''
        toolResults.push(body.trim())
      }
    }
    if (textParts.length === 0 && toolUses.length > 0) {
      const first = toolUses[0]
      return first === undefined
        ? { role: 'tool', text: '[tool call]' }
        : { role: 'tool', tool: first, text: toolUses.map(name => `[tool call: ${name}]`).join('\n') }
    }
    if (textParts.length === 0 && toolResults.length > 0) {
      return { role: 'tool', tool: 'tool-result', text: toolResults.join('\n') }
    }
    return { role: baseRole, text: textParts.join('\n').trim() }
  }
  return { role: baseRole, text: '' }
}

/**
 * Sanitize one text for HTML embedding: escape the five markup-significant
 * characters and strip control characters except newline/tab. Pure function,
 * covered by extreme-case tests (tags, null bytes, huge inputs).
 * @param text - the raw text.
 * @returns the HTML-safe text.
 */
export function sanitizeText(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Render one export line as a Markdown block: headings by role and fenced
 * blocks for tool lines so multi-line content never breaks the transcript.
 * @param line - the export line.
 * @returns the Markdown text.
 */
export function lineToMarkdown(line: ExportLine): string {
  if (line.tool !== undefined) {
    return `### \`${line.tool}\`\n\n\`\`\`text\n${line.text}\n\`\`\``
  }
  const heading = line.role === 'user' ? '## User' : '## Assistant'
  return `${heading}\n\n${line.text}`
}

/** Build the complete Markdown document for a set of lines. */
export function toMarkdown(lines: readonly ExportLine[]): string {
  const body = lines.map(lineToMarkdown).join('\n\n')
  return `# Session export\n\n${body === '' ? '_No messages yet._' : body}\n`
}

/** Build the complete sanitized HTML document for a set of lines. */
export function toHtml(lines: readonly ExportLine[]): string {
  const body = lines.map((line) => {
    const safe = sanitizeText(line.text).replace(/\n/g, '<br>')
    if (line.tool !== undefined) {
      return `<h3><code>${sanitizeText(line.tool)}</code></h3>\n<pre>${safe}</pre>`
    }
    const heading = line.role === 'user' ? 'User' : 'Assistant'
    return `<h2>${heading}</h2>\n<p>${safe}</p>`
  }).join('\n')
  return '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Session export</title></head>\n<body>\n'
    + `<h1>Session export</h1>\n${body === '' ? '<p><em>No messages yet.</em></p>' : body}\n</body>\n</html>\n`
}

/**
 * Apply the renderer pipeline to every line of a conversation (per-tool and
 * per-content-type rules decide which renderer touches which line) and build
 * the export document. Both the rendered document and the original lines
 * stay inside the returned document, so the render application is auditable.
 * @param registry - the renderer registry.
 * @param lines - the extracted conversation lines.
 * @param format - export format.
 * @param rules - configured style rules.
 * @param now - exportedAt timestamp (injected for deterministic tests).
 * @returns the complete export document.
 */
export function renderExport(
  registry: RendererRegistry,
  lines: readonly ExportLine[],
  format: 'markdown' | 'html',
  rules: readonly import('./renderers.ts').StyleRule[],
  now: Date = new Date(),
): ExportDocument {
  const rendered: RenderedText[] = []
  const presented: ExportLine[] = lines.map((line) => {
    const result = registry.render(line.text, {
      tool: line.tool ?? '',
      contentType: 'markdown',
    }, rules)
    rendered.push(result)
    return { ...line, text: result.rendered }
  })
  const document = format === 'markdown' ? toMarkdown(presented) : toHtml(presented)
  return {
    plugin: 'dsh-output-styles',
    schema: 'output-export-v1',
    format,
    exportedAt: now.toISOString(),
    text: document,
    lines: presented,
    rendered,
  }
}
