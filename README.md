<div align="center">

# 🎨 dsh-output-styles

**Claude Code `outputStyles` for DeepSeek Harness** — switch the model's output style at runtime, per session, durably.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![Tests](https://img.shields.io/badge/tests-53%20passed-success.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` — and every reply from now on is terse. `/style step-by-step` — and the model narrates numbered steps. `/style off` — back to default. One command per session, persisted across restarts, zero changes to the agent loop.

## ✨ Features

| | |
|---|---|
| 🗂️ **Style library** | One Markdown file per style (`styles/*.md`); frontmatter `name` / `description` / `whenToUse`, body = the model directive. |
| ⌨️ **`/style` command** | No argument lists styles + current selection; `/style <name>` switches; `/style off` restores the default. Strict input validation. |
| 💾 **Session-scoped persistence** | The choice lives in the `output_style` storage domain, keyed by sessionId — two sessions never interfere, and the choice survives restarts. |
| 🧩 **System-prompt injection** | A `systemPrompt.section()` contribution (order 90) injects the current session's style body at every assembly; bodies are truncated at a configurable budget. |
| 🔁 **Claude Code compatibility** | Loads `outputStyles` JSON collections (`{ name, description, prompt }`); unparseable entries are skipped with a warning. |
| 📊 **Session projection** | A `style` projection (`{ options, currentValue }`) for the Web UI, folded from the session log. |
| 🧯 **Fail loud, skip cleanly** | Misconfiguration throws at load; a bad style file is skipped with a warning and never breaks the profile. |
| 🌐 **Five-language docs** | EN · 中文 · 日本語 · 한국어 · Español. |

## 🚀 Quick start

```sh
# 1. Install (web profiles work out of the box; headless needs the storage rows)
dsh plugin --profile <name> add dsh-output-styles

# 2. Add the row (plain cordis plugin — the CLI installs the dependency only)
#    profile cordis.patch.yml:
- insert:
    - id: output-styles
      name: 'dsh-output-styles'

# 3. Boot and switch
dsh --profile <name>
/style               # → output style off (available: concise, step-by-step)
/style concise       # → switched to concise
```

> **Prerequisite:** the plugin injects `storageDomain`. The web profile composes `storage` + `storage-json` + `storage-domain` in box; headless profiles add the three rows themselves (sample in [cordis.patch.yml](cordis.patch.yml)). Without them the plugin simply stays pending and activates once they appear.

## 🎬 Demo

```
You > /style
      output style off (available: concise, step-by-step)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

*(Real headless run, deepseek-v4-pro — before the switch the same prompt produced a full-preamble answer. Full transcripts in [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md).)*

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

Everything the model sees is reconstructable from the session log — no new session event type, no agent-loop changes. The style name comes from `command/run`, the exact injected text from `request/header`, and the provenance marker `{ kind: 'plugin', plugin: 'dsh-output-styles' }` rides in the domain record.

## ⚙️ Configuration

Every tunable is a validated Schemastery `Config` field (invalid values fail the load):

| Field | Default | Meaning |
|---|---|---|
| `stylesDir` | `''` | Style library directory; `''` = the bundled `styles/`, other values resolve against cwd. |
| `maxStyleChars` | `4000` | Style-body budget (characters, ≥ 1); longer bodies are truncated with a marker. |
| `defaultStyle` | `''` | Style for sessions that never selected one; `''` = new sessions inject nothing. |
| `compatJson` | `true` | Load Claude Code `outputStyles` JSON entries. |
| `sectionOrder` | `90` | Order of the injected section (0 = persona, 100–199 = tool guidance). |
| `truncationMarker` | `"\n\n[style truncated]"` | Marker appended at the truncation point. |

## 📚 Style library

<details>
<summary><code>styles/concise.md</code></summary>

```markdown
---
name: concise
description: Terse, direct answers — minimal prose, no preamble.
whenToUse: Daily coding work, tool-heavy sessions, or when prompt length matters.
---

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
- 回答语言跟随用户语言：中文提问用中文回答，英文提问用英文回答。
- End when the task is done; do not add closing summaries unless asked.
```

</details>

<details>
<summary>Claude Code <code>outputStyles</code> JSON (<code>compatJson: true</code>)</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

Names must be kebab-case (`^[a-z][a-z0-9-]*$`); `off` is the reserved switch target.

</details>

## ⌨️ Command reference

| Input | Outcome |
|---|---|
| `/style` | List styles + current selection |
| `/style concise` | Switch (durable write), `switched to concise` |
| `/style off` | Restore default |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🔍 Conflict check

Screened against the DSH ecosystem before development (2026-08 snapshot): no `style`/`output-style` repository under [topic:dsh-plugin](https://github.com/topics/dsh-plugin), no output-style category in the four major [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), and no entry in the [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop). The closest neighbors — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) and [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (output styles explicitly deferred to v0.2+) — are adjacent, not conflicting.

## 🧪 Development

```sh
pnpm install
pnpm run typecheck   # both tsc projects
pnpm test            # vitest — 53 tests
pnpm run build       # lib/ artifacts
pnpm pack            # tarball for dsh plugin add
```

Structure follows the [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template): `src/index.ts` (plugin metadata), `src/config.ts` (schema), `src/runtime.ts` (runtime service + activation), `src/invariant.ts` (invariants), `styles/` (built-ins).

## 📄 License

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
