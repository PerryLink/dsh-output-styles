<div align="center">

# 🎨 dsh-output-styles

**DeepSeek Harness 版的 Claude Code `outputStyles`** —— 在运行时、按会话、持久地切换模型输出风格。

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` —— 从此之后每条回复都简洁。`/style step-by-step` —— 模型按编号步骤叙述推理。`/style off` —— 回到项目默认。每会话一条命令、重启后依然生效、零 agent-loop 改动。

## ✨ 特性

| | |
|---|---|
| 🗂️ **风格库** | 每个风格一个 Markdown 文件（`styles/*.md`）；frontmatter 存元数据，正文即模型指令。`name` 缺省继承文件名，且可含空格（如 `Diagrams first`）。内置六种风格，含与 Claude Code 对齐的 `proactive` 与 `learning`。 |
| ⌨️ **`/style` 命令** | 无参列出全部风格（含描述）与当前选择；`/style <name>` 切换；`/style off` 恢复项目默认。`/style` 之后的整段文本即风格名。 |
| 💾 **会话级持久化** | 选择保存在 `output_style` 存储域，按 sessionId 隔离——会话互不干扰，重启后保留。 |
| 🧩 **系统提示注入** | `systemPrompt.section()` 贡献（order 90）在每次组装时注入当前会话的风格正文；正文按可配置预算截断。 |
| 🎭 **Claude Code `keep-coding-instructions`** | `keep-coding-instructions: false`（缺省，与 Claude Code 一致）的风格**替换整个系统提示**——适合彻底离开软件工程的风格。 |
| 📌 **强制风格** | Claude Code 的 `force-for-plugin`（别名 `force`）无条件生效，覆盖任何会话选择；两个强制风格会在加载期报错。 |
| 🔁 **Claude Code 兼容** | 加载 `outputStyles` JSON 集合（`{ name, description, prompt }`），支持单对象与 `settings.json` 式数组；坏条目逐个跳过并警告。 |
| 📚 **目录分层** | `stylesDir` 是目录列表，后者覆盖前者（内置 `styles/` 是最低层，`includeBuiltins: false` 可排除）。 |
| 🔄 **热加载** | 风格文件改动即时生效，无需重启（`watchStyles: false` 可关闭）。 |
| ⚙️ **settings 项目默认** | 从未选择过的会话依次回落到 settings 的 `output-style.style`、再回落 `defaultStyle`。 |
| 🖱️ **Web 选择器** | `dsh.client` 入口（`dsh-output-styles/client`）把宿主 `/style` 命令装饰成投影驱动的弹窗选择器。 |
| 📊 **会话投影** | `style` 投影（`{ options, currentValue }`）供 Web UI 使用，按会话日志中**已成功落定**的命令折叠。 |
| 🧯 **失效即响、坏件干净跳过** | 配置错误加载期抛错；坏风格文件跳过并警告，绝不拖垮 profile。 |
| 🌐 **五语文档** | EN · 中文 · 日本語 · 한국어 · Español。 |

## 🚀 快速开始

```sh
# 1. 安装——本包是 bundle 补丁层，一条命令即组合好
#    storage + storage-json + storage-domain + 插件行：
dsh plugin --profile <name> add dsh-output-styles

# 2. 启动并切换
dsh --profile <name>
/style               # → 当前状态 + 每风格一行
/style concise       # → switched to concise
/style Diagrams first  # → 含空格的名字同样可用
/style off           # → 回到项目默认
```

该补丁层对 web profile 幂等（按 id 插入会替换同 id 行），web profile 本就内建 storage 三行。使用 Web 选择器时，向 profile 添加客户端行：

```yaml
- id: output-styles-client
  name: 'dsh-output-styles/client'
```

## 🎬 演示

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

## 🧠 工作原理

```mermaid
flowchart LR
    U[输入 /style concise] --> C[命令注册表]
    C -->|记录 command/run| L[(会话日志)]
    C -->|写入 {style, source}| D[(output_style 域)]
    D --> R[OutputStyleRuntime]
    R -->|每次组装注入正文| S[systemPrompt 节 order 90]
    S --> M[模型请求]
    M -->|完整系统提示| H[记录 request/header]
```

模型所见的一切都能从会话日志重建——无需新增会话事件类型、不改 agent-loop。风格名来自 `command/run`，注入的确切文本来自 `request/header`，来源标记 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 随域记录存储。风格只作用于主会话；子代理会话保持各自的提示（与 Claude Code 一致）。

## ⚙️ 配置

所有可调项都是带校验的 Schemastery `Config` 字段（非法值加载即失败）：

| 字段 | 默认 | 含义 |
|---|---|---|
| `stylesDir` | `[]` | 风格库目录列表，相对 cwd 解析；后者覆盖前者。`[]` = 仅内置 `styles/`。裸字符串视为单目录列表。 |
| `maxStyleChars` | `4000` | 风格正文预算（码点，≥ 1）；超长正文截断并加标记。 |
| `defaultStyle` | `''` | 从未选择过的会话（且无 settings 默认）使用的风格；`''` = 不注入。 |
| `compatJson` | `true` | 加载 Claude Code `outputStyles` JSON 条目（单对象或数组）。 |
| `sectionOrder` | `90` | 注入节顺序（0 = persona，100–199 = 工具指引）。 |
| `truncationMarker` | `"\n\n[style truncated]"` | 截断点追加的标记。 |
| `includeBuiltins` | `true` | 将包内置 `styles/` 作为最低优先级层纳入。 |
| `watchStyles` | `true` | 风格文件在磁盘上变化时重载风格库。 |

## 📚 风格库

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

frontmatter 字段：

| 字段 | 默认 | 含义 |
|---|---|---|
| `name` | 文件名 | 切换目标；字母、数字、空格、连字符（首尾无空白；`off` 为保留字）。 |
| `description` | ——（必填） | 列表与选择器里展示的一句话。 |
| `whenToUse` | —— | 可选适用场景说明，追加到列表。 |
| `keep-coding-instructions` | `false` | `true` 保留宿主提示（身份、persona、工具指引）；`false` 整体替换（Claude Code 语义）。 |
| `force-for-plugin` | `false` | Claude Code 官方字段：无条件生效，覆盖会话选择；`force` 为其别名，最多一个风格可设置。 |

<details>
<summary>Claude Code <code>outputStyles</code> JSON（<code>compatJson: true</code>）</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

条目按 Claude Code 原样接受 `keep-coding-instructions` 与 `force-for-plugin` 字段。旧版 `settings.json` 的数组形式（`[{ … }, { … }]`）原样加载；坏条目逐个跳过并警告。

</details>

## ⌨️ 命令参考

| 输入 | 结果 |
|---|---|
| `/style` | 列出当前选择 + 每风格一行（名称 — 描述） |
| `/style concise` | 切换（持久写入），`switched to concise` |
| `/style Diagrams first` | 含空格的风格名 = `/style` 后的整段文本 |
| `/style off` | 恢复项目默认（先 settings 默认，后 `defaultStyle`） |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🖱️ Web 选择器

`dsh.client` 入口把宿主 `/style` 命令的裸调用装饰成弹窗选择器：「off」行 + 每风格一行（`描述 · 适用场景`），当前行高亮。选中即通过命令 Remote 提交 `/style <name>`，因此每次切换都保留宿主的持久命令生命周期，`style` 投影始终是唯一展示事实。选择器文案跟随 Web UI 内置的 `zh`/`en` 语言对。

## 🔍 生态冲突检查

开发前对 DSH 生态做了筛查（2026-08 快照）：[topic:dsh-plugin](https://github.com/topics/dsh-plugin) 下没有 `style`/`output-style` 仓库，四大 [awesome 列表](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 没有 output-style 分类，[dsh-hub 目录](https://github.com/omdsh-dev/dsh-hub-workshop) 亦无条目。最接近的邻居——[dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)（persona）与 [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)（明确将输出风格推迟到 v0.2+）——相邻而不冲突。

## 🆚 与 Claude Code 的差异

| | Claude Code | dsh-output-styles |
|---|---|---|
| 风格文件 | 用户/项目/托管层级的 `.claude/output-styles` | `stylesDir` 目录 + 内置 `styles/`，后目录胜出 |
| 自定义风格 | Markdown，frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | 同字段（`force-for-plugin` 原样接受，`force` 为别名）+ `whenToUse` |
| 旧版 JSON | `settings.json` 里的 `outputStyles` 数组 | 原样加载（`compatJson: true`） |
| 生效时机 | `/clear` 或新会话后 | 立即生效——系统提示每次请求重组 |
| 子代理 | 风格不适用 | 一致——子代理会话保持各自提示 |
| 切换方式 | `/config` 菜单或 `outputStyle` 设置（`/output-style` 命令已在 v2.1.91 移除） | `/style` 命令 + Web 选择器 + settings `output-style.style` |

## 🧪 开发

```sh
pnpm install
pnpm run typecheck   # 两个 tsc 工程
pnpm test            # vitest —— 93 个测试
pnpm run verify      # typecheck + 测试 + 自包含检查（prepublishOnly 闸门）
pnpm run build       # lib/ 产物（宿主 + 客户端两个 bundle）
pnpm pack            # 供 dsh plugin add 使用的 tarball
```

发布：推送后缀与 `package.json` 版本一致的 `v*` tag 会触发 Publish 工作流——完整验证后发布到 npm（含 provenance）。任何 `npm publish` 也会通过 `prepublishOnly` 执行 `verify` 闸门。

结构遵循 [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template)：`src/index.ts`（插件元数据）、`src/config.ts`（schema）、`src/runtime.ts`（运行时服务与激活）、`src/invariant.ts`（不变量）、`src/client/`（Web 选择器）、`styles/`（内置风格）。

## 📄 License

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
