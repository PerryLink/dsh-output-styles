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

这个插件是 [DSH 插件家族](https://github.com/PerryLink)的一员（40+ 个，全部 Apache-2.0）。如果你在用，**给个 star** —— 它不会解锁任何功能，但会让下一个人在搜索里更容易找到它。

*English:* part of a 40+ plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.


## What is dsh-output-styles?

`/style concise` — and every reply from now on is terse. `/style off` — back to the project default.

![Terminal demo of dsh-output-styles: dsh-output-styles — /style lists, then switches at runtime](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-hero.png)

![Animated terminal demo of dsh-output-styles](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-demo.gif)

*The same run, animated.*

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

- [@PerryLink](https://github.com/PerryLink) — author and maintainer: plugin architecture, style library, bundle install, Web picker, five-language docs, and CI/release tooling.

## PerryLink DSH Plugin Family

This project is one of the **87 actively maintained** DeepSeek Harness plugins from [PerryLink](https://github.com/PerryLink). The family roster is **95** plugins in total — **5 frozen**, **3 retired** — and stays collapsed below so every README keeps a short first screen. Expand it to see every row, with the reason in the Status column.

<details>
<summary>Expand all 95 plugins</summary>

| Plugin | One-liner | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRED — see the repo README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 FROZEN — see the repo README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 FROZEN — see the repo README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 FROZEN — see the repo README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRED — see the repo README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRED — see the repo README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

### Install from the DSH Desktop Market

All PerryLink plugins are browsable in the built-in DSH Desktop Market: **Market → Sources → add source → paste** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ select it**. Installation still goes through the Market's npm-identity verification and your confirmation.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
