<div align="center">

# 🎨 dsh-output-styles

**Claude Code `outputStyles` for DeepSeek Harness** — switch the model's output style at runtime, per session, durably.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)
[![npm downloads](https://img.shields.io/npm/dm/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` — and every reply from now on is terse. `/style step-by-step` — and the model narrates numbered steps. `/style off` — back to the project default. One command per session, persisted across restarts, zero changes to the agent loop.

## ✨ Features

| | |
|---|---|
| 🗂️ **Style library** | One Markdown file per style (`styles/*.md`); frontmatter for metadata, body = the model directive. `name` defaults to the file name and may contain spaces (`Diagrams first`). Six built-ins ship in the box, including Claude Code-parity `proactive` and `learning`. |
| ⌨️ **`/style` command** | No argument lists styles (with descriptions) + current selection; `/style <name>` switches; `/style off` restores the project default. The whole remainder after `/style` is the style name. |
| 💾 **Session-scoped persistence** | The choice lives in the `output_style` storage domain, keyed by sessionId — two sessions never interfere, and the choice survives restarts. |
| 🧩 **System-prompt injection** | A `systemPrompt.section()` contribution (order 90) injects the current session's style body at every assembly; bodies are truncated at a configurable budget. |
| 🎭 **Claude Code `keep-coding-instructions`** | Styles with `keep-coding-instructions: false` (the default, like Claude Code) replace the whole system prompt — for styles that leave software engineering behind. |
| 📌 **Forced styles** | Claude Code's `force-for-plugin` (alias `force`) applies a style unconditionally, overriding any session selection; two forced styles fail the load. |
| 🔁 **Claude Code compatibility** | Loads `outputStyles` JSON collections (`{ name, description, prompt }`), single entries or `settings.json`-style arrays; unparseable entries are skipped with a warning. |
| 📚 **Layered directories** | `stylesDir` is a list; later directories override earlier ones (bundled `styles/` is the lowest layer, disable with `includeBuiltins: false`). |
| 🔄 **Hot reload** | Style-file changes are picked up without restarting (`watchStyles: false` to opt out). |
| ⚙️ **Project default over settings** | Sessions that never selected one fall back to `output-style.style` from the DSH settings seam, then to `defaultStyle`. |
| 🖱️ **Web picker** | A `dsh.client` entry (`dsh-output-styles/client`) decorates the host `/style` command with a projection-backed popup picker. |
| 📊 **Session projection** | A `style` projection (`{ options, currentValue }`) for the Web UI, folded from settled commands in the session log. |
| 🧯 **Fail loud, skip cleanly** | Misconfiguration throws at load; a bad style file is skipped with a warning and never breaks the profile. |
| 🌐 **Five-language docs** | EN · 中文 · 日本語 · 한국어 · Español. |

## 🚀 Quick start

```sh
# 1. Install — the package is a bundle layer, so one command composes
#    storage + storage-json + storage-domain + the plugin row:
dsh plugin --profile <name> add dsh-output-styles

# 2. Boot and switch
dsh --profile <name>
/style               # → output style off, then one line per style
/style concise       # → switched to concise
/style Diagrams first  # → names with spaces work too
/style off           # → back to the project default
```

The layer is idempotent over web profiles (insert-by-id replaces same-id rows), which compose `storage` in box. For the Web picker, add the client row to the profile:

```yaml
- id: output-styles-client
  name: 'dsh-output-styles/client'
```

## 🎬 Demo

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

## 🧠 How it works

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

## ⚙️ Configuration

Every tunable is a validated Schemastery `Config` field (invalid values fail the load):

| Field | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | Style-library directories, resolved against cwd; later entries override earlier ones. `[]` = the bundled `styles/` only. A bare string is a single-directory list. |
| `maxStyleChars` | `4000` | Style-body budget (code points, ≥ 1); longer bodies are truncated with a marker. |
| `defaultStyle` | `''` | Style for sessions that never selected one (and no settings default exists); `''` = no style. |
| `compatJson` | `true` | Load Claude Code `outputStyles` JSON entries (single objects or arrays). |
| `sectionOrder` | `90` | Order of the injected section (0 = persona, 100–199 = tool guidance). |
| `truncationMarker` | `"\n\n[style truncated]"` | Marker appended at the truncation point. |
| `includeBuiltins` | `true` | Include the package's bundled `styles/` as the lowest-priority layer. |
| `watchStyles` | `true` | Reload the library when a style file changes on disk. |

## 📚 Style library

<details>
<summary><code>styles/concise.md</code></summary>

```markdown
---
name: concise
description: Terse, direct answers — minimal prose, no preamble.
whenToUse: Daily coding work, tool-heavy sessions, or when prompt length matters.
keep-coding-instructions: true
---

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
- 回答语言跟随用户语言：中文提问用中文回答，英文提问用英文回答。
```

</details>

Frontmatter fields:

| Field | Default | Meaning |
|---|---|---|
| `name` | file name | Switch target; letters, digits, spaces, and hyphens (no leading/trailing space; `off` is reserved). |
| `description` | — (required) | One sentence shown in listings and the picker. |
| `whenToUse` | — | Optional guidance appended to listings. |
| `keep-coding-instructions` | `false` | Keep the harness prompt (identity, persona, tool guidance) when `true`; replace it entirely when `false` (Claude Code semantics). |
| `force-for-plugin` | `false` | Claude Code's field: apply unconditionally, overriding any session selection; `force` is accepted as an alias, and at most one style may set it. |

<details>
<summary>Claude Code <code>outputStyles</code> JSON (<code>compatJson: true</code>)</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

Entries accept `keep-coding-instructions` and `force-for-plugin` exactly as Claude Code writes them. Legacy `settings.json` arrays (`[{ … }, { … }]`) load as-is; bad entries are skipped with a warning.

</details>

## ⌨️ Command reference

| Input | Outcome |
|---|---|
| `/style` | List current selection + one line per style (name — description) |
| `/style concise` | Switch (durable write), `switched to concise` |
| `/style Diagrams first` | Multi-word names are the whole remainder |
| `/style off` | Restore the project default (settings default, then `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🖱️ Web picker

The `dsh.client` entry decorates the host `/style` command's bare invocation with a popup picker: an "off" row plus one row per library style (`description · whenToUse`), the active row marked. Picking submits `/style <name>` through the command Remote, so every switch keeps the host's durable command lifecycle and the `style` projection stays the single displayed fact. The picker follows the Web UI's shipped `zh`/`en` locale pair.

## 🔍 Conflict check

Screened against the DSH ecosystem before development (2026-08 snapshot): no `style`/`output-style` repository under [topic:dsh-plugin](https://github.com/topics/dsh-plugin), no output-style category in the four major [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), and no entry in the [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop). The closest neighbors — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) and [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (output styles explicitly deferred to v0.2+) — are adjacent, not conflicting.

## 🆚 Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| Style files | `.claude/output-styles` at user/project/managed levels | `stylesDir` directories + bundled `styles/`, later directory wins |
| Custom styles | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | Same fields (`force-for-plugin` accepted verbatim, `force` as alias) + `whenToUse` |
| Legacy JSON | `outputStyles` array in `settings.json` | Loaded verbatim (`compatJson: true`) |
| Taking effect | After `/clear` or a new session | Immediately — the system prompt re-assembles per request |
| Subagents | Styles do not apply | Same — subagent sessions keep their own prompts |
| Switching | `/config` menu or `outputStyle` setting (the `/output-style` command was removed in v2.1.91) | `/style` command + Web picker + settings `output-style.style` |

## 🧪 Development

```sh
pnpm install
pnpm run typecheck   # both tsc projects
pnpm test            # vitest — 93 tests
pnpm run verify      # typecheck + tests + self-contained (the prepublishOnly gate)
pnpm run build       # lib/ artifacts (host + client bundles)
pnpm pack            # tarball for dsh plugin add
```

Releases: pushing a `v*` tag whose suffix matches the `package.json` version triggers the Publish workflow — full verification, then an npm publish with provenance. Any `npm publish` also passes the `verify` gate through `prepublishOnly`.

Structure follows the [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template): `src/index.ts` (plugin metadata), `src/config.ts` (schema), `src/runtime.ts` (runtime service + activation), `src/invariant.ts` (invariants), `src/client/` (Web picker), `styles/` (built-ins).

## 👥 Contributors

Thanks to everyone who helped build this project:

- [@PerryLink](https://github.com/PerryLink) — author and maintainer: plugin architecture, style library, bundle install, Web picker, five-language docs, and CI/release tooling.

Found a bug or an idea? Open an [issue](https://github.com/PerryLink/dsh-output-styles/issues) or send a [pull request](https://github.com/PerryLink/dsh-output-styles/pulls) — contributions in any language are welcome.

## 📄 License

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
