# Coexistence with a core `outputStyles` capability

`dsh-output-styles` is the standalone Claude Code `outputStyles`-equivalent. If
DeepSeek Harness ships a first-party `outputStyles` feature, the two would
otherwise both inject an output-style directive into the system prompt. This
plugin ships a coexistence policy that detects the core capability and degrades
to the incremental surface it uniquely adds.

## Detection

The core capability is detected through its reserved service seam, not by name
guessing. A core implementation publishes the `outputStyles` service; the plugin
probes it at mount:

```ts
import { detectCoreOutputStyles } from 'dsh-output-styles'

// ctx is the plugin-scoped Cordis context.
const coreActive = detectCoreOutputStyles(ctx)
```

- **Core absent** → `standalone` mode: the plugin injects the style section
  (`systemPrompt.section('output-style:selection')` plus the
  `system-prompt/assemble` waterfall for `keep-coding-instructions: false`).
- **Core present** → `degraded` mode: prompt injection is left to the core, and
  the plugin keeps only hot-switch (`/style`), rules, and `/export`.

## Runnable verification

`coexistenceReport` is the runnable check for one composition:

```ts
import { coexistenceReport } from 'dsh-output-styles'

const report = coexistenceReport(ctx)
// report = { coreActive, mode: 'standalone' | 'degraded',
//            promptInjection: 'enabled' | 'disabled', retained, disabled }
```

It is also covered by the test suite (`tests/coexist.spec.ts`), which mounts the
plugin with a fake `outputStyles` service and asserts the injected section is
absent while `/style` and the renderer registry stay active.

## Forcing injection

A deployment that wants this plugin to keep injecting regardless of the core can
set `respectCoreOutputStyles: false` in `cordis.yml`. The default is `true`
(honor the core and avoid duplicate injection).

## Degraded surface

In `degraded` mode the plugin still contributes:

- **Hot-switch** — `/style` listing/selection, per-session persistence over the
  `output_style` domain, and the `style` session projection.
- **Rules** — the `output.render.*` renderer registry, the
  `output.render/before` waterfall, and per-session/per-tool rules.
- **Export** — `/export` (Markdown / sanitized HTML) through the renderer
  pipeline, with approval-gated `--save`.

Only the two prompt-injection registrations (the prompt section and the
`system-prompt/assemble` waterfall) are skipped.
