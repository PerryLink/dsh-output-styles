<div align="center">

# 🎨 dsh-output-styles

**Claude Code `outputStyles` 的 DeepSeek Harness 等价能力** —— 运行时按会话切换模型输出风格，持久化保存。

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![Tests](https://img.shields.io/badge/tests-53%20passed-success.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` —— 之后的每次回复都简洁直给；`/style step-by-step` —— 模型改为按步骤叙述推理；`/style off` —— 恢复默认。每个会话一条命令，重启不丢，不动 agent loop。

## ✨ 功能

- **风格库**：`styles/*.md`，每文件一个风格（frontmatter `name`/`description`/`whenToUse`，正文即注入模型的风格指令）。
- **`/style` 斜杠命令**：无参列出可用风格与当前选择；`/style <name>` 切换；`/style off` 恢复默认；参数严格校验（空输入/多 token/未知名分别处理）。
- **会话级持久化**：经 `ctx.storageDomain` 的 `output_style` 域按 sessionId 存 `{ style, source }`，`source` 携带来源标记 `{ kind: 'plugin', plugin: 'dsh-output-styles' }`；两个会话互不影响，选择跨重启保留。
- **系统提示词注入**：经 `ctx.systemPrompt.section()` 注册名为 `output-style:selection`、默认 order 90 的提示词段，每次组装读取当前会话选择；正文按 `maxStyleChars`（默认 4000 字符）截断并在截断处加标记。
- **Claude Code 兼容**：`compatJson: true`（默认）时加载 `styles/*.json` 的 `outputStyles` 收藏格式（`{ "name", "description", "prompt" }`），转换为内部风格对象；无法解析的 JSON 跳过并警告。
- **会话投影**：注册 `style` 投影单元（`{ options, currentValue }`）供 Web UI 显示当前风格；折叠只镜像日志中被实际接受的切换。
- **响亮失败、干净跳过**：配置错误加载期抛错；单个风格文件解析失败只警告跳过，不影响插件加载。
- **五语文档**：EN · 中文 · 日本語 · 한국어 · Español。

## 🚀 快速开始

```sh
# 1. 安装（web profile 开箱即用；headless 需补 storage 行）
dsh plugin --profile <name> add dsh-output-styles

# 2. 写激活行（纯 cordis 插件：CLI 只装依赖不写行）
#    profile 的 cordis.patch.yml：
- insert:
    - id: output-styles
      name: 'dsh-output-styles'

# 3. 启动并切换
dsh --profile <name>
/style               # → output style off (available: concise, step-by-step)
/style concise       # → switched to concise
```

> **前置条件：`ctx.storageDomain`。** 插件经 `inject: ['storageDomain']` 声明依赖：组合中没有存储域设施（`@deepseek-ai/dsh-storage-domain`，且 `output_style` 域能路由到带 kv facet 的后端）时，插件保持待激活，补上存储行后自动激活。web profile 内建 `storage` + `storage-json`（`backend: json`）+ `storage-domain` 三行；headless profile 自行补三行（样例见 [cordis.patch.yml](cordis.patch.yml)）。

## 🎬 演示

```
You > /style
      output style off (available: concise, step-by-step)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

*(真实 headless 运行、deepseek-v4-pro；切换前同一提示词给出的是带开场白的完整自我介绍。完整实录见 [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md)。)*

## 🧠 工作原理

```mermaid
flowchart LR
    U[输入 /style concise] --> C[命令注册表]
    C -->|command/run 落日志| L[(会话日志)]
    C -->|put {style, source}| D[(output_style 域)]
    D --> R[OutputStyleRuntime]
    R -->|每次组装注入正文| S[systemPrompt 段 order 90]
    S --> M[模型请求]
    M -->|完整系统提示词| H[request/header 落日志]
```

模型可见的一切都能从会话日志重建 —— 不新增会话事件类型、不改 agent-loop：风格名来自 `command/run`，模型实际收到的文本来自 `request/header`（`header.system` 含完整渲染后的系统提示词），名称与来源标记随域记录持久化。

## ⚙️ 配置

全部可调参数进 `Config`（Schemastery schema，加载期校验，非法值响亮失败），改 `cordis.yml` 即可、无需改代码：

| 字段 | 默认 | 含义 |
|---|---|---|
| `stylesDir` | `''` | 风格库目录；`''` = 包内 `styles/`，其他值相对进程 cwd 解析。 |
| `maxStyleChars` | `4000` | 风格正文预算（字符数，≥1）；超预算在截断处追加标记。 |
| `defaultStyle` | `''` | 从未选择过风格的会话回退到的风格；`''` = 新会话默认不注入。 |
| `compatJson` | `true` | 是否加载 Claude Code `outputStyles` JSON 收藏格式。 |
| `sectionOrder` | `90` | 注入段顺序（0 为 persona，100–199 为工具指引）。 |
| `truncationMarker` | `"\n\n[style truncated]"` | 截断标记文本。 |

`defaultStyle` 指向库中不存在的名字、风格重名、或某风格名为保留字 `off`，均加载期抛错（歧义必须响亮失败）。

## 📚 风格库格式

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
<summary>Claude Code <code>outputStyles</code> JSON（<code>compatJson: true</code>）</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

`name` 必须 kebab-case（`^[a-z][a-z0-9-]*$`）；`off` 为保留切换目标。

</details>

## ⌨️ 命令参考

| 输入 | 结果 |
|---|---|
| `/style` | 列出可用风格与当前选择 |
| `/style concise` | 切换（写域记录），`switched to concise` |
| `/style off` | 删除选择，恢复默认 |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🔍 冲突排查结论（2026-08 快照）

- **GitHub `topic:dsh-plugin`**：无 `dsh-output-styles` 同名仓库；最接近的是 [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)（persona 注入）与 [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)（明确把 output styles 列为 v0.2+ 未支持项）—— 相邻能力，不冲突。
- **awesome 列表**：[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 等四大列表均无 output-style 类目。
- **dsh-hub catalog**：[dsh-hub-workshop](https://github.com/omdsh-dev/dsh-hub-workshop) 的 `catalog.json`（189 条目）无 `style`/`output-style` 条目；本插件若收录应归 `kind: extension`。

## 🧠 模型可见 ⟺ 已记录

注入的风格正文是模型可见内容。本插件**不新增会话事件类型**：`command/run`（`name: 'style'` + 原文 `args`）记录切换意图，`request/header` 在派发前记录完整渲染后的系统提示词（含风格标题与正文），`output_style` 域记录携带 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 来源标记。为何不按 `SessionEventMap` 扩展规范新增事件：仓库外插件的事件类型不在 `KNOWN_SESSION_EVENT_TYPES` 内，且 `Session.append` 不暴露 `ignorable` 信封字段 —— 落盘后宿主恢复会话时会拒绝读取自己的日志，复用已有日志记录是仓库外插件唯一自洽的路径。

## 🧪 开发

```sh
pnpm install
pnpm run typecheck   # 两个 tsc 项目
pnpm test            # vitest — 53 用例
pnpm run build       # lib/ 产物
pnpm pack            # tarball，dsh plugin add 直接装
```

结构按 [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template)：`src/index.ts`（插件元数据）、`src/config.ts`（schema）、`src/runtime.ts`（运行时服务与激活）、`src/invariant.ts`（不变量）、`styles/`（内置风格）。

单元测试覆盖：风格解析（md/json、坏文件跳过、重名/保留字抛错）、命令分派（无参/切换/off/未知名/多 token）、截断与预算、会话隔离、HMR 配置热更新（fiber 释放后重挂载无残留、持久化选择保留、storageDomain 缺失时待激活并在服务出现后自动激活）、投影折叠与 checkpoint 往返、不变量检查。验证实录见 [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md)。

## 📄 许可

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
