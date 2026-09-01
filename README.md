<div align="center">

# 🎨 dsh-output-styles
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add dsh-output-styles` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-output-styles)

**Claude Code `outputStyles` for DeepSeek Harness** — switch the model's output style at runtime, per session, durably.

*`/style concise` — and every reply from now on is terse. `/style off` — back to the project default.*

> **Official repository.** This is the only official repository of dsh-output-styles, maintained by PerryLink. Same-name repositories under other accounts are not affiliated.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-output-styles/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-output-styles/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-output-styles?label=version)](https://github.com/PerryLink/dsh-output-styles/releases)
[![npm version](https://img.shields.io/npm/v/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)
[![npm downloads](https://img.shields.io/npm/dm/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.1-rc.2` 0.1.2-alpha.3 (adapted 2026-09-01): the session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged. |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | All (host + web client) |
| Model | Any (system-prompt injection) |

## What you get

`dsh-output-styles` is the Claude Code `outputStyles` equivalent for DeepSeek Harness: a `/style` command that switches the model's output style at runtime, persisted per session, injected at every prompt assembly.

- **Style library** — one Markdown file per style (`styles/*.md`); frontmatter for metadata, body = the model directive. Six built-ins ship in the box (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), including Claude Code-parity `proactive` and `learning`.
- **`/style` command** — no argument lists styles (with descriptions) plus the current selection; `/style <name>` switches; `/style off` restores the project default.
- **Session-scoped persistence** — the choice lives in the `output_style` storage domain, keyed by sessionId, and survives restarts.
- **System-prompt injection** — a `systemPrompt.section()` contribution (order `sectionOrder`) injects the current session's style body at every assembly, truncated at a configurable budget.
- **Claude Code parity** — `keep-coding-instructions`, `force-for-plugin` (`force` alias), `outputStyles` JSON compatibility, layered `stylesDir` directories, hot reload, and project-default fallback over the DSH settings seam.
- **Renderer registry (`output.render.*`)** — `ctx.outputRenderers` lets any plugin register a pure presenter, applied through the `output.render/before` waterfall; built-in renderers `concise` and `step-by-step`.
- **Per-session/per-tool rules** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` name the renderer for matching requests; editable through the `output-style-rules` settings section.
- **`/export`** — render the current session to Markdown or sanitized HTML through the render pipeline; `--save <path>` writes the sanitized document to that workspace path after user approval. Every render keeps the original text beside the rendered one.

## Quick start

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"

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
    M -->|full system prompt| H[request/header logged]
```

Everything the model sees is reconstructable from the session log — no new session event type, no agent-loop changes. The style name comes from `command/run`, the exact injected text from `request/header`, and the provenance marker `{ kind: 'plugin', plugin: 'dsh-output-styles' }` rides in the domain record. Styles apply to the main conversation only; subagent sessions keep their own prompts (matching Claude Code).

## Install & uninstall

- **git channel** (latest `main`): `dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` — the `prepare` script builds with production dependencies only.
- **npm channel** (published releases): `dsh plugin --profile web add dsh-output-styles`.
- **tarball channel**: `pnpm pack` in this repo, then `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-output-styles`.

## Configuration

All tunables are Schemastery `Config` fields (changeable from cordis.yml). Invalid values fail the load.

| Key | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | Style-library directories, resolved against cwd; later entries override earlier ones. `[]` = the bundled `styles/` only |
| `maxStyleChars` | `4000` | Style-body budget (≥ 1); longer bodies are truncated with a marker |
| `defaultStyle` | `''` | Style for sessions that never selected one (and no settings default exists); `''` = no style |
| `compatJson` | `true` | Load Claude Code `outputStyles` JSON entries (single objects or arrays) |
| `sectionOrder` | `90` | Order of the injected section (0 = persona, 100–199 = tool guidance) |
| `truncationMarker` | `"\n\n[style truncated]"` | Marker appended at the truncation point |
| `includeBuiltins` | `true` | Include the package's bundled `styles/` as the lowest-priority layer |
| `watchStyles` | `true` | Reload the library when a style file changes on disk |
| `rules` | `[]` | Per-session/per-tool render rules: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | Register the `/export` command (Markdown/HTML session export, renderer-aware; `--save` writes with approval) |
| `respectCoreOutputStyles` | `true` | When a core `outputStyles` service is detected, skip this plugin's prompt injection (keep hot-switch / rules / export) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | List styles, switch, or restore the project default |
| `/export` | command | Render the current session to Markdown or sanitized HTML; `--save` writes with approval |
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
| `/export` | Render the current session to Markdown through the renderer pipeline |
| `/export md` | Render to Markdown (`md` is the shorthand for `markdown`) |
| `/export html` | Render to sanitized HTML |
| `/export --renderer=concise` | Render with one renderer forced (rules bypassed) |
| `/export md --save report.md` | Render, then write the sanitized document to `report.md` after approval |

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
| Switching | `/config` menu or `outputStyle` setting (the `/output-style` command was removed in v2.1.91) | `/style` command + Web picker + settings `output-style.style` |

## Conflict check

Screened against the DSH ecosystem before development (2026-08 snapshot): no `style`/`output-style` repository under [topic:dsh-plugin](https://github.com/topics/dsh-plugin), no output-style category in the four major [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), and no entry in the [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop). The closest neighbors — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) and [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (output styles explicitly deferred to v0.2+) — are adjacent, not conflicting.

## Permissions & data

- **Permissions**: declares `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write`, and `settings:read` in its workshop manifest.
- **Data**: the style choice lives in the `output_style` storage domain (keyed by sessionId); no other state is persisted, no network requests.
- **Session log**: the style name comes from `command/run`, the exact injected text from `request/header`; the provenance marker `{ kind: 'plugin', plugin: 'dsh-output-styles' }` rides in the domain record.

## Security boundaries

- **Public services only.** Contributes `systemPrompt`, commands, storage, and settings; no engine / agent-loop / apiproxy / official-UI changes.
- **Model-visible ⟺ logged.** Everything the model sees is reconstructable from the session log — no new session event type, no agent-loop changes.
- **Original always kept.** Every render (and `/export`) keeps the original text beside the rendered one; sanitized HTML is used for HTML export.
- **Disk writes gated.** `/export --save` writes only after the approval service grants it, and the written content passes through the `sanitizeText` pure function first; without an approval or fs service it writes nothing (fail-closed).

## Known limitations

- **Core coexistence.** If a first-party `outputStyles` capability lands, this plugin detects its `outputStyles` service and degrades to the incremental surface (hot-switch, rules, `/export`) while leaving prompt injection to the core — see [`docs/COEXISTENCE.md`](docs/COEXISTENCE.md) and the exported `detectCoreOutputStyles` / `coexistenceReport` functions.
- **Main conversation only.** Styles apply to the main conversation; subagent sessions keep their own prompts (matching Claude Code).
- **Truncation.** Style bodies longer than `maxStyleChars` are truncated with a marker.
- **Skipped style files.** A bad style file is skipped with a warning and never breaks the profile.

## Development

```sh
pnpm install
pnpm run typecheck   # both tsc projects
pnpm test            # vitest — 127 tests
pnpm run verify      # typecheck + tests + self-contained (the prepublishOnly gate)
pnpm run build       # lib/ artifacts (host + client bundles)
pnpm pack            # tarball for dsh plugin add
```

Releases: pushing a `v*` tag whose suffix matches the `package.json` version triggers the Publish workflow — full verification, then an npm publish with provenance.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — author and maintainer: plugin architecture, style library, bundle install, Web picker, five-language docs, and CI/release tooling.

## PerryLink DSH Plugin Family

This project is one of the [33 DeepSeek Harness plugins](https://github.com/PerryLink) maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | Local document knowledge base for DeepSeek Harness. | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. | |
| **[dsh-dsh-skill-pack-security](https://github.com/PerryLink/dsh-dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
