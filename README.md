<div align="center">

# 🎨 dsh-output-styles
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add dsh-output-styles` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-output-styles)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-output-styles?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-output-styles?ref=badge)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-output-styles/badge)](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-output-styles)

**Claude Code `outputStyles` for DeepSeek Harness** — switch the model's output style at runtime, per session, durably.

*`/style concise` — and every reply from now on is terse. `/style off` — back to the project default.*

> **Official repository.** This is the only official repository of dsh-output-styles, maintained by PerryLink. Same-name repositories under other accounts are not affiliated.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-output-styles.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-output-styles/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-output-styles/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-output-styles?label=version)](https://github.com/PerryLink/dsh-output-styles/releases)
[![npm version](https://img.shields.io/npm/v/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)
[![npm downloads](https://img.shields.io/npm/dm/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-output-styles
```


</div>

---

**📖 Ecosystem knowledge base** — measured data, not marketing: [plugin development guide · plugin-selection data · maintenance criteria](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

- **git channel** (latest `main`): `dsh plugin --profile web add github:PerryLink/dsh-output-styles` — the `prepare` script builds with production dependencies only.
- **npm channel** (published releases): `dsh plugin --profile web add dsh-output-styles`.
- **tarball channel**: `pnpm pack` in this repo, then `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-output-styles`.

## ⭐ 如果它帮到了你

这个插件是 [DSH 插件家族](https://github.com/PerryLink)的一员（95 个，全部 Apache-2.0）。如果你在用，**给个 star** —— 它不会解锁任何功能，但会让下一个人在搜索里更容易找到它。

*English:* part of a 95 plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.


## What is dsh-output-styles?

`/style concise` — and every reply from now on is terse. `/style off` — back to the project default.

![Workflow diagram for dsh-output-styles: install → open panel → act.](docs/assets/dsh-output-styles-flow.svg)

*Workflow overview: install → open panel → act. The examples below use the real command surface.*



## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-rc.2` (adapted 2026-09-09): the session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged. Verified 2026-09-11 against the dsh-v0.2.1-rc.2 checkout (full gate chain + profile install smoke). |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | All (host + web client) |
| Model | Any (system-prompt injection) |

## What you get

`dsh-output-styles` is the Claude Code `outputStyles` equivalent for DeepSeek Harness: a `/style` command that switches the model's output style at runtime, persisted per session, injected at every prompt assembly.

- **Style library** — one Markdown file per style (`styles/*.md`); frontmatter for metadata, body = the model directive. Six built-ins ship in the box (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), including Claude Code-parity `proactive` and `learning`.
- **`/style` command** — no argument lists styles (with descriptions) plus the current selection; `/style <name>` switches; `/style off` restores the project default.
- **Session-scoped persistence** — the choice lives in the `output_style` storage domain, keyed by sessionId, and survives restarts.
- **System-prompt injection** — a `systemPrompt.section()` contribution (order `sectionOrder`) injects the current session's style body at every assembly, truncated at a configurable budget.
- **Claude Code parity** — `keep-coding-instructions`, `force-for-plugin` (`force` alias), `outputStyles` JSON compatibility, layered `stylesDir` directories, hot reload, and a project-default fallback that is live-editable from the Web Plugins page.
- **Renderer registry (`output.render.*`)** — `ctx.outputRenderers` lets any plugin register a pure presenter, applied through the `output.render/before` waterfall; built-in renderers `concise` and `step-by-step`.
- **Per-session/per-tool rules** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` name the renderer for matching requests; live-editable from the Web Plugins page.
- **`/transcript`** — render the current session to Markdown or sanitized HTML through the render pipeline; `--save <path>` writes the sanitized document to that workspace path after user approval. Every render keeps the original text beside the rendered one.

## Quick start

```sh
dsh plugin --profile web add github:PerryLink/dsh-output-styles
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-output-styles

# or from npm (published releases)
dsh plugin --profile web add dsh-output-styles

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: output-styles'
```

## Demo

```
You > /style
      output style off
      concise — Terse, direct answers — minimal prose, no preamble. (Daily coding work, tool-heavy sessions, or when prompt length matters.)
      explanatory — Educational answers with short "Insights" that teach as you work. (Learning a codebase, onboarding, …)
      formal — Formal, precise prose with complete sentences and defined terms. (Reports, documentation, release notes, …)
      learning — Collaborative learn-by-doing mode with short "Insights" and small hands-on steps for the user. (Pairing, onboarding, …)
      proactive — Execute immediately, assume reasonable defaults, and prefer action over planning. (Routine multi-step work, …)
      step-by-step — Numbered reasoning steps with explicit intermediate results. (Debugging, design decisions, …)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

## How it works

```mermaid
flowchart LR
    U[You type /style concise] --> C[command registry]
    C -->|command/run logged| L[(session log)]
    C -->|put {style, source}| D[(output_style domain)]
    D --> R[OutputStyleRuntime]
    R -->|body at every assembly| S[systemPrompt section order 90]
    S --> M[Model request]
    M -->|full system prompt| H[system/message logged]
```

Everything the model sees is reconstructable from the session log — no new session event type, no agent-loop changes. The style name comes from `command/run`, the exact injected text from `system/message`, and the provenance marker `{ kind: 'dsh-output-styles' }` rides in the domain record. Styles apply to the main conversation only; subagent sessions keep their own prompts (matching Claude Code).

### Examples

These are the plugin's real entry points; install once, then call one.

#### Detailed example

**Command**

~~~sh
/style concise
~~~

**Output**

~~~text
switched to concise
~~~

*Observed from `plugins/dsh-output-styles/src/runtime.ts:474-478; asserted in tests/runtime.spec.ts:91; README §Command reference line 194`*

#### Brief examples

- `/transcript`
- `output_style`

## Configuration

All tunables are Schemastery `Config` fields (changeable from cordis.yml). Invalid values fail the load.

`defaultStyle` and `rules` are declared `volatile()`, so on a host that composes the settings forms seam they are **live, Web-editable fields**: edit them under **Plugins → dsh-output-styles** in the Web UI and the running plugin adopts the new value without a remount. Every other field stays composition-only and needs a reload. A committed value is validated before it is applied — an invalid one is rejected and the running values are left unchanged.

| Key | Default | Web-editable | Meaning |
|---|---|---|---|
| `stylesDir` | `[]` | no | Style-library directories, resolved against cwd; later entries override earlier ones. `[]` = the bundled `styles/` only |
| `maxStyleChars` | `4000` | no | Style-body budget (≥ 1); longer bodies are truncated with a marker |
| `defaultStyle` | `''` | **yes** | Style for sessions that never selected one; `''` = no style. A name that is not in the live library is refused rather than injected |
| `compatJson` | `true` | no | Load Claude Code `outputStyles` JSON entries (single objects or arrays) |
| `sectionOrder` | `90` | no | Order of the injected section (0 = persona, 100–199 = tool guidance) |
| `truncationMarker` | `"\n\n[style truncated]"` | no | Marker appended at the truncation point |
| `includeBuiltins` | `true` | no | Include the package's bundled `styles/` as the lowest-priority layer |
| `watchStyles` | `true` | no | Reload the library when a style file changes on disk |
| `rules` | `[]` | **yes** | Per-session/per-tool render rules: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | no | Register the `/transcript` command (Markdown/HTML session export, renderer-aware; `--save` writes with approval) |
| `respectCoreOutputStyles` | `true` | no | When a core `outputStyles` service is detected, skip this plugin's prompt injection (keep hot-switch / rules / export) |

**Migrating from 0.1.6 or earlier.** Those versions kept two plugin-owned settings
sections, `output-style` (`style`) and `output-style-rules` (`rules`). The 0.1.7
host deleted the API they were built on, so both sections are gone. Move any value
you had there into the corresponding `Config` field — `output-style.style` →
`defaultStyle`, `output-style-rules.rules` → `rules` — in your profile patch
(`cordis.yml`), or set it on the Plugins page. Per-session choices made with
`/style` are unaffected: they live in the `output_style` storage domain.

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | List styles, switch, or restore the project default |
| `/transcript` | command | Render the current session to Markdown or sanitized HTML; `--save` writes with approval |
| `output_style` | storage domain | Session-scoped style choice, keyed by sessionId |
| `systemPrompt.section()` | contribution | Injects the current style body at every assembly |
| `output.render.*` | renderer registry | `ctx.outputRenderers` + the `output.render/before` waterfall |
| `style` | projection | `{ options, currentValue }` folded from settled commands |
| Web picker | client entry | `dsh-output-styles/client` decorates `/style` with a popup picker |

## Command reference

| Input | Outcome |
|---|---|
| `/style` | List the current selection + one line per style (name — description) |
| `/style concise` | Switch (durable write), `switched to concise` |
| `/style Diagrams first` | Multi-word names are the whole remainder |
| `/style off` | Restore the project default (settings default, then `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |
| `/transcript` | Render the current session to Markdown through the renderer pipeline |
| `/transcript md` | Render to Markdown (`md` is the shorthand for `markdown`) |
| `/transcript html` | Render to sanitized HTML |
| `/transcript --renderer=concise` | Render with one renderer forced (rules bypassed) |
| `/transcript md --save report.md` | Render, then write the sanitized document to `report.md` after approval |

## Style library

One Markdown file per style; frontmatter for metadata, body = the model directive. `name` defaults to the file name and may contain spaces (`Diagrams first`).

| Field | Default | Meaning |
|---|---|---|
| `name` | file name | Switch target; letters, digits, spaces, and hyphens (`off` is reserved) |
| `description` | — (required) | One sentence shown in listings and the picker |
| `whenToUse` | — | Optional guidance appended to listings |
| `keep-coding-instructions` | `false` | Keep the harness prompt when `true`; replace it when `false` (Claude Code semantics) |
| `force-for-plugin` | `false` | Apply unconditionally, overriding any session selection; `force` is an alias, at most one style may set it |

With `compatJson: true`, Claude Code `outputStyles` JSON entries (`{ name, description, prompt }`) load beside Markdown styles; unparseable entries are skipped with a warning.

## Renderer protocol

The `output.render.*` protocol turns presentation into an extension point. A renderer is a **pure presenter** — `presenter(text, context)` maps args to display data, never touches the DOM — matched by tool name and content type, ordered by priority.

- **Waterfall first**: every render request passes through `output.render/before` (`{ text, context }`); listeners must call `next()`.
- **Rules**: `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` names the renderer for matching requests; ties break by `priority`, then rule order.
- **Built-ins**: `concise` (whitespace compaction + budget truncation) and `step-by-step` (consistent step numbering).
- **Auditability**: every render result carries `{ original, rendered, rendererId, changed }`; the rendered text is what surfaces, the original stays reconstructable from the session log.

## Web picker

The `dsh.client` entry decorates the host `/style` command's bare invocation with a popup picker: an "off" row plus one row per library style (`description · whenToUse`), the active row marked. Picking submits `/style <name>` through the command Remote, so every switch keeps the host's durable command lifecycle. The picker follows the Web UI's shipped `zh`/`en` locale pair.

## Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| Style files | `.claude/output-styles` at user/project/managed levels | `stylesDir` directories + bundled `styles/`, later directory wins |
| Custom styles | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | Same fields (`force-for-plugin` accepted verbatim, `force` as alias) + `whenToUse` |
| Legacy JSON | `outputStyles` array in `settings.json` | Loaded verbatim (`compatJson: true`) |
| Taking effect | After `/clear` or a new session | Immediately — the system prompt re-assembles per request |
| Subagents | Styles do not apply | Same — subagent sessions keep their own prompts |
| Switching | `/config` menu or `outputStyle` setting (the `/output-style` command was removed in v2.1.91) | `/style` command + Web picker + the `defaultStyle` field on the Web Plugins page |

## Conflict check

Screened against the DSH ecosystem before development (2026-08 snapshot): no `style`/`output-style` repository under [topic:dsh-plugin](https://github.com/topics/dsh-plugin), no output-style category in the four major [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), and no entry in the [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop). The closest neighbors — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) and [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (output styles explicitly deferred to v0.2+) — are adjacent, not conflicting.

## Permissions & data

- **Permissions**: declares `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write`, and `settings:read` in its workshop manifest.
- **Data**: the style choice lives in the `output_style` storage domain (keyed by sessionId); no other state is persisted, no network requests.
- **Session log**: the style name comes from `command/run`, the exact injected text from `system/message`; the provenance marker `{ kind: 'dsh-output-styles' }` rides in the domain record.

## Security boundaries

- **Public services only.** Contributes `systemPrompt`, commands, storage, and settings; no engine / agent-loop / apiproxy / official-UI changes.
- **Model-visible ⟺ logged.** Everything the model sees is reconstructable from the session log — no new session event type, no agent-loop changes.
- **Original always kept.** Every render (and `/transcript`) keeps the original text beside the rendered one; sanitized HTML is used for HTML export.
- **Disk writes gated.** `/transcript --save` writes only after the approval service grants it, and the written content passes through the `sanitizeText` pure function first; without an approval or fs service it writes nothing (fail-closed).

## Known limitations

- **Core coexistence.** If a first-party `outputStyles` capability lands, this plugin detects its `outputStyles` service and degrades to the incremental surface (hot-switch, rules, `/transcript`) while leaving prompt injection to the core — see [`docs/COEXISTENCE.md`](docs/COEXISTENCE.md) and the exported `detectCoreOutputStyles` / `coexistenceReport` functions. **Degraded mode is stated where you can see it**: every `/style` switch and `/style off` reply carries a `degraded coexistence mode` note, and the `style` session projection exposes `promptInjection: 'enabled' | 'disabled'`, so no surface implies the style is in force when it is not. (Before 0.7.0 the only trace was a `ctx.logger.info` line, which never reaches the session transcript.)
- **Main conversation only.** Styles apply to the main conversation; subagent sessions keep their own prompts (matching Claude Code).
- **Truncation.** Style bodies longer than `maxStyleChars` are truncated with a marker.
- **Skipped style files.** A bad style file is skipped with a warning and never breaks the profile.

## Development

```sh
pnpm install
pnpm run typecheck   # both tsc projects
pnpm test            # vitest — 156 tests
pnpm run verify      # typecheck + tests + self-contained (the prepublishOnly gate)
pnpm run build       # lib/ artifacts (host + client bundles)
pnpm pack            # tarball for dsh plugin add
```

Releases: pushing a `v*` tag whose suffix matches the `package.json` version triggers the Publish workflow — full verification, then an npm publish with provenance.

## Interoperability with other DSH plugins

Verified against **DSH `0.2.0-rc.2`** (the runtime this README ships for) and the high-star plugin set surveyed on 2026-10-05.

This plugin **does not interfere** with other plugins, including the widely installed high-star ones:

- **No tool-name collision.** Every tool is namespaced; no bare name owned by a shipped tool or another plugin is registered.
- **No service-key collision.** It provides `outputRenderers`; that key is not a built-in seam and is not provided by any surveyed high-star plugin.
- **No slot collision.** It registers no client slot key, so it cannot contend for a `shadows-shipped-ui` seat.
- **No HTTP route collision.** It registers no `webServer` prefix.
- **No patch-layer collision.** The bundle patch only `insert`s its own row; it never overrides a built-in row's `config`.
- **No global mutation.** It does not patch prototypes, rewrite `process.env`, or replace the global fetch dispatcher.

**Shared event listeners are non-interfering by construction.** It observes the ordering-sensitive event `system-prompt/assemble` with `ctx.on()` — Cordis's broadcast registration, where every listener runs and none can starve another. **Every listener here delegates through `next()`**, so the chain is never short-circuited, and a mutation is applied to the value `next()` produced rather than returned in its place:
  - `system-prompt/assemble` — also used by `dsh-routing-suite` (7000★, 13 listeners).

Static evidence: `dsh-plugin-doctor` K10–K13 report `pass` for every check on this repository.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@kskazuha](https://github.com/kskazuha) — the Web style picker revival on 0.1.7 (#8).
- [@Bingtang1019](https://github.com/Bingtang1019) — the module-table handoff report for `lib/client.js` (#10).
- [@PerryLink](https://github.com/PerryLink) — author and maintainer: plugin architecture, style library, bundle install, Web picker, five-language docs, and CI/release tooling.

## PerryLink DSH Plugin Family

This project is part of the DeepSeek Harness plugin family from [PerryLink](https://github.com/PerryLink). The roster stays collapsed below so every README keeps a short first screen; expand it to see every row and its status.

<details>
<summary>Expand all plugins</summary>

| Plugin | Status |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** |  |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 FROZEN — see the repo README |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 FROZEN — see the repo README |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 FROZEN — see the repo README |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 FROZEN — see the repo README |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 FROZEN — see the repo README |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 RETIRED — see the repo README |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 RETIRED — see the repo README |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 RETIRED — see the repo README |

</details>

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
