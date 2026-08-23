# output.render.* — the dsh-output-styles renderer protocol

> 中文版见 [renderer-protocol.zh.md](renderer-protocol.zh.md)。Style switching stays fully
> compatible; this document covers the presentation layer added in 0.4.0.

The renderer protocol turns output presentation into an extension point: any
plugin can register a **renderer** — a pure function that maps raw
model-visible text to display text — and the harness-facing surfaces of this
plugin (`/export`, the `ctx.outputRenderers.renderText` service) apply them
through one auditable pipeline.

## Renderer contract

```ts
interface OutputRenderer {
  id: string                 // kebab-case, unique in the registry
  name: string               // human-readable
  description: string        // one sentence
  match: RendererMatch[]     // [] = matches everything
  priority: number           // higher wins; ties break by registration order
  presenter: (text: string, context: RenderContext) => string  // PURE — no DOM, no I/O
}

interface RendererMatch {
  tool?: string | string[]           // tool names; '*' = any; omitted = any
  contentType?: 'text' | 'markdown' | 'html' | ContentType[]
}

interface RenderContext {
  tool: string               // '' for assistant/user prose
  contentType: ContentType
  sessionId?: string
  meta?: Record<string, string>
}
```

Rules the registry enforces (fail-loud):

- Invalid renderers (bad id grammar, missing fields, non-function presenter,
  non-finite priority) throw at registration and never enter the registry.
- Duplicate ids throw; `register()` returns a disposer that removes exactly
  that registration — reversibility is the caller's `ctx.effect` job.

## Render pipeline

```text
renderText(text, context)
  → output.render/before waterfall   (listeners transform {text, context}, MUST next())
  → rule table (first match by priority)
      ├─ rule hit → the named renderer applies (explicit; no other renderer runs)
      └─ no hit  → every matching renderer applies in priority order (composition)
  → { original, rendered, rendererId?, changed }
```

- The waterfall listener contract is the ordinary Cordis waterfall semantics:
  a listener that returns without calling `next()` short-circuits the whole
  pipeline — do that only on purpose.
- A rule naming an unregistered renderer fails loudly at render time (the
  registry can gain and lose renderers at runtime; silent fallback would
  hide drift).

## Built-in renderers

| id | Behavior |
| --- | --- |
| `concise` | Collapses whitespace runs and blank-line stacks, caps the presented text at a budget with a `[truncated]` marker. |
| `step-by-step` | Renumbers list items (dashes, bullets, or digits) consistently from 1; leaves prose untouched. |

Their ids mirror the two headline style names, so a rule like
`{ match: { tool: 'bash' }, style: 'concise' }` reads naturally.

## Per-session / per-tool rules

```yaml
# cordis.yml, under the dsh-output-styles row
config:
  rules:
    - match: { tool: bash }
      style: concise
    - match: { tool: read, contentType: text }
      style: step-by-step
      priority: 5
    - match: { session: "session-id-here" }
      style: step-by-step
```

Matching is exact (no globs except `'*'` for any tool); `match.session`
scopes a rule to one session. Rules can also be edited in the settings UI
(`output-style-rules` namespace), where the same shape is validated at
write time.

## Auditability

Presentation never destroys the source:

- every result object carries `original` beside `rendered`;
- the original text of an exported conversation is the session log itself —
  `/export` projects it through the official `deriveEventMessage` surface
  rule, the same rule the harness uses to build model requests;
- the render application is deterministic (same rules + same renderers in the
  same order), so the rendered output and its source reconstruct together.

## Worked third-party example

```ts
// my-plugin/renderers.ts
export const tableCompactor = {
  id: 'sql-table',
  name: 'SQL table compactor',
  description: 'Truncates oversized SQL result sets to the head plus a row count.',
  match: [{ tool: 'sql', contentType: 'text' }],
  priority: 20,
  presenter: (text: string): string => {
    const rows = text.split('\n')
    if (rows.length <= 50) return text
    return [...rows.slice(0, 50), `… ${rows.length - 50} more rows`].join('\n')
  },
}

// my-plugin/index.ts
export function apply(ctx: Context): void {
  const renderers = ctx.get('outputRenderers')   // optional: dsh-output-styles may be absent
  if (renderers !== undefined) {
    ctx.effect(() => renderers.register(tableCompactor))
  }
}
```

## Consuming the pipeline

```ts
const result = await ctx.outputRenderers.renderText(rawText, { tool: 'sql', contentType: 'text' })
// { original, rendered, rendererId, changed } — log both halves wherever you surface it.
```

## Export to disk

`/export` returns the rendered document as command output text. `/export
[md|markdown|html] [--renderer=<id>] --save <path>` additionally writes the
document to a workspace path: the document passes through the `sanitizeText`
pure function first, then the write is gated by the approval service
(`ctx.get('approval')`, fail-closed when absent) and performed by the fs
service (`ctx.get('fs')`, fail-loud when absent). The render pipeline itself is
unchanged — the same presenters and rule table apply before either output.
