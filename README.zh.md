<div align="center">

# 🎨 dsh-output-styles
- **1024 商店渠道**：先 `npm i -g dsh1024`，再 `dsh1024 plugin --profile web add dsh-output-styles`（计入 [deepseek1024.com](https://deepseek1024.com) 安装排行）。

**DeepSeek Harness 的 Claude Code `outputStyles` 等价实现** —— 在运行时、按会话、持久地切换模型输出风格。

*`/style concise` —— 从此每条回复都简洁。`/style off` —— 回到项目默认。*

> **官方仓库。** 本仓库是 dsh-output-styles 的唯一官方仓库，由 PerryLink 维护。其他账号下的同名仓库与本项目无关。

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
| Harness | DeepSeek Harness `0.1.2-alpha.5`（2026-09-02 已适配）：会话信封保留 ignorable 字段但仅用于存量日志读取兼容——Session.append 仍无法盖章，门控行为不变。 |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | 全部（host + Web 客户端） |
| Model | 任意（系统提示注入） |

## What you get

`dsh-output-styles` 是 DeepSeek Harness 的 Claude Code `outputStyles` 等价实现：一个 `/style` 命令，在运行时切换模型输出风格，按会话持久化，并在每次提示组装时注入。

- **风格库** —— 每种风格一个 Markdown 文件（`styles/*.md`）；frontmatter 存元数据，正文即模型指令。内置六种（`concise`、`explanatory`、`formal`、`learning`、`proactive`、`step-by-step`），含与 Claude Code 对齐的 `proactive` 与 `learning`。
- **`/style` 命令** —— 无参数时列出风格（含描述）与当前选择；`/style <name>` 切换；`/style off` 恢复项目默认。
- **会话级持久化** —— 选择存于 `output_style` 存储域，按 sessionId 隔离，重启后仍保留。
- **系统提示注入** —— `systemPrompt.section()` 贡献（顺序 `sectionOrder`）在每次组装时注入当前会话的风格正文，按可配置预算截断。
- **Claude Code 对齐** —— `keep-coding-instructions`、`force-for-plugin`（别名 `force`）、`outputStyles` JSON 兼容、分层 `stylesDir` 目录、热重载，以及通过 DSH settings 接缝的项目默认回退。
- **渲染器注册表（`output.render.*`）** —— `ctx.outputRenderers` 允许任意插件注册纯 presenter，经 `output.render/before` waterfall 应用；内置渲染器 `concise` 与 `step-by-step`。
- **按会话/按工具规则** —— `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` 为匹配请求指定渲染器；可通过 `output-style-rules` 设置区编辑。
- **`/export`** —— 经渲染管线把当前会话导出为 Markdown 或净化 HTML；`--save <path>` 经用户审批后把净化文档写入该工作区路径。每次渲染都保留原文与渲染结果并列。

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

模型所见的一切都能从会话日志重建 —— 无新增会话事件类型、无 agent-loop 改动。风格名来自 `command/run`，精确注入文本来自 `request/header`，来源标记 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 随域记录携带。风格只作用于主会话；子代理会话保留各自提示（与 Claude Code 一致）。

## Install & uninstall

- **git channel**（最新 `main`）：`dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` —— `prepare` 脚本仅用生产依赖构建。
- **npm channel**（发布版本）：`dsh plugin --profile web add dsh-output-styles`。
- **tarball channel**：在本仓库执行 `pnpm pack`，然后 `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`。
- **uninstall**：`dsh plugin --profile web remove dsh-output-styles`。

## Configuration

所有可调项均为 Schemastery `Config` 字段（可在 cordis.yml 中修改）。非法值在加载期失败。

| Key | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | 风格库目录，相对 cwd 解析；后者覆盖前者。`[]` = 仅内置 `styles/` |
| `maxStyleChars` | `4000` | 风格正文预算（≥ 1）；超长正文带标记截断 |
| `defaultStyle` | `''` | 从未选择过风格的会话所用风格（且无 settings 默认）；`''` = 无风格 |
| `compatJson` | `true` | 加载 Claude Code `outputStyles` JSON 条目（单对象或数组） |
| `sectionOrder` | `90` | 注入段的顺序（0 = persona，100–199 = 工具指引） |
| `truncationMarker` | `"\n\n[style truncated]"` | 追加在截断点的标记 |
| `includeBuiltins` | `true` | 将包内置 `styles/` 作为最低优先级层 |
| `watchStyles` | `true` | 风格文件在磁盘上变化时重载库 |
| `rules` | `[]` | 按会话/按工具渲染规则：`[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | 注册 `/export` 命令（Markdown/HTML 会话导出，感知渲染器；`--save` 经审批写入） |
| `respectCoreOutputStyles` | `true` | 检测到核心 `outputStyles` 服务时跳过本插件的提示词注入（保留热切换 / rules / export） |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | 列出风格、切换或恢复项目默认 |
| `/export` | command | 把当前会话渲染为 Markdown 或净化 HTML；`--save` 经审批写入 |
| `output_style` | storage domain | 按 sessionId 隔离的会话级风格选择 |
| `systemPrompt.section()` | contribution | 在每次组装时注入当前风格正文 |
| `output.render.*` | renderer registry | `ctx.outputRenderers` + `output.render/before` waterfall |
| `style` | projection | 从已落定命令折叠出的 `{ options, currentValue }` |
| Web picker | client entry | `dsh-output-styles/client` 用弹出选择器装饰 `/style` |

## Command reference

| Input | Outcome |
|---|---|
| `/style` | 列出当前选择 + 每个风格一行（名称 — 描述） |
| `/style concise` | 切换（持久写入），`switched to concise` |
| `/style Diagrams first` | 多词名称取整个余下部分 |
| `/style off` | 恢复项目默认（settings 默认，其次 `defaultStyle`） |
| `/style nope` | `error: unknown output style "nope" (available: …)` |
| `/export` | 经渲染管线把当前会话渲染为 Markdown |
| `/export md` | 渲染为 Markdown（`md` 是 `markdown` 的简写） |
| `/export html` | 渲染为净化 HTML |
| `/export --renderer=concise` | 强制指定一个渲染器渲染（跳过规则） |
| `/export md --save report.md` | 渲染后经审批把净化文档写入 `report.md` |

## Style library

每种风格一个 Markdown 文件；frontmatter 存元数据，正文即模型指令。`name` 默认取文件名，可含空格（`Diagrams first`）。

| Field | Default | Meaning |
|---|---|---|
| `name` | 文件名 | 切换目标；字母、数字、空格与连字符（`off` 为保留字） |
| `description` | —（必填） | 列表与选择器中显示的一句话 |
| `whenToUse` | — | 追加到列表的可选指引 |
| `keep-coding-instructions` | `false` | 为 `true` 时保留 harness 提示；为 `false` 时整体替换（Claude Code 语义） |
| `force-for-plugin` | `false` | 无条件应用，覆盖任何会话选择；`force` 为别名，至多一种风格可设置 |

启用 `compatJson: true` 后，Claude Code `outputStyles` JSON 条目（`{ name, description, prompt }`）与 Markdown 风格并列加载；无法解析的条目带警告跳过。

## Renderer protocol

`output.render.*` 协议把呈现层变为扩展点。渲染器是**纯 presenter** —— `presenter(text, context)` 把参数映射为展示数据、绝不触碰 DOM —— 按工具名与内容类型匹配，按优先级排序。

- **Waterfall first**：每个渲染请求先经 `output.render/before`（`{ text, context }`）；监听器必须调用 `next()`。
- **Rules**：`rules: [{ match: { tool: 'bash' }, style: 'concise' }]` 为匹配请求指定渲染器；冲突按 `priority` 再按规则顺序裁决。
- **Built-ins**：`concise`（空白压缩 + 预算截断）与 `step-by-step`（一致的步骤编号）。
- **Auditability**：每次渲染结果携带 `{ original, rendered, rendererId, changed }`；渲染文本是展示内容，原文始终可从会话日志重建。

## Web picker

`dsh.client` 条目装饰 host `/style` 命令的裸调用，弹出一个选择器：一个 "off" 行 + 每个库风格一行（`description · whenToUse`），当前行高亮。选择通过命令 Remote 提交 `/style <name>`，因此每次切换都保留 host 的持久命令生命周期。选择器跟随 Web UI 自带的 `zh`/`en` 语言对。

## Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| 风格文件 | 用户/项目/受管层的 `.claude/output-styles` | `stylesDir` 目录 + 内置 `styles/`，后者目录优先 |
| 自定义风格 | Markdown，frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | 相同字段（`force-for-plugin` 原样接受，`force` 为别名）+ `whenToUse` |
| 旧版 JSON | `settings.json` 中的 `outputStyles` 数组 | 原样加载（`compatJson: true`） |
| 生效时机 | `/clear` 之后或新会话 | 立即——系统提示按请求重新组装 |
| 子代理 | 风格不适用 | 相同——子代理会话保留各自提示 |
| 切换 | `/config` 菜单或 `outputStyle` 设置（`/output-style` 命令已在 v2.1.91 移除） | `/style` 命令 + Web picker + settings `output-style.style` |

## Conflict check

开发前已对照 DSH 生态排查（2026-08 快照）：[topic:dsh-plugin](https://github.com/topics/dsh-plugin) 下无 `style`/`output-style` 仓库，四个主要 [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 中无 output-style 分类，[dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop) 中无条目。最接近的邻居——[dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)（persona）与 [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)（输出风格明确推迟到 v0.2+）——是相邻而非冲突。

## Permissions & data

- **Permissions**：workshop 清单声明 `fs:read`、`fs:write`、`fs:watch`、`storage:read`、`storage:write` 与 `settings:read`。
- **Data**：风格选择存于 `output_style` 存储域（按 sessionId 隔离）；不持久化其他状态，无网络请求。
- **Session log**：风格名来自 `command/run`，精确注入文本来自 `request/header`；来源标记 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 随域记录携带。

## Security boundaries

- **仅公开服务。** 贡献 `systemPrompt`、命令、存储与 settings；不改 engine / agent-loop / apiproxy / 官方 UI。
- **模型可见 ⟺ 已记录。** 模型所见的一切都能从会话日志重建 —— 无新增会话事件类型、无 agent-loop 改动。
- **始终保留原文。** 每次渲染（含 `/export`）都保留原文与渲染结果并列；HTML 导出使用净化 HTML。
- **写盘有门禁。** `/export --save` 仅在审批服务放行后写入，且写入内容先经 `sanitizeText` 纯函数净化；缺少审批或 fs 服务时一律不写入（fail-closed）。

## Known limitations

- **仅主会话。** 风格只作用于主会话；子代理会话保留各自提示（与 Claude Code 一致）。
- **截断。** 超过 `maxStyleChars` 的风格正文带标记截断。
- **跳过坏文件。** 损坏的风格文件带警告跳过，绝不破坏 profile。

## Development

```sh
pnpm install
pnpm run typecheck   # 两个 tsc 项目
pnpm test            # vitest —— 127 个测试
pnpm run verify      # typecheck + tests + self-contained（prepublishOnly 门禁）
pnpm run build       # lib/ 产物（host + client 包）
pnpm pack            # 供 dsh plugin add 的 tarball
```

发布：推送后缀与 `package.json` 版本一致的 `v*` 标签会触发 Publish workflow —— 完整验证后带 provenance 发布到 npm。

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) —— 作者与维护者：插件架构、风格库、bundle 安装、Web picker、五语文档与 CI/发布工具链。

## PerryLink DSH Plugin Family

这是 [PerryLink](https://github.com/PerryLink) 维护的 [33 个 DeepSeek Harness 插件](https://github.com/PerryLink) 之一。如果它能帮到你，其他的也会：

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | 审批链上的第二模型自动审查，默认失败关闭 | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | 带 Web UI 侧栏、消息与中断的持久后台子代理 | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | DeepSeek Harness 的成本治理：预算、碳排与延迟一屏呈现。 | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Claude Code /rewind 等价：快照、会话 fork、一次性恢复 | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | 把 Claude Code 会话、记忆、技能与 CLAUDE.md 迁入 DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | 跨平台原生桌面控制（DeepSeek Harness），Windows 优先。 | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | Web 输入框的终端式历史：方向键、Ctrl+R 搜索 | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | 数据集质量检查与引文核查（本插件可选消费的数字核查桥） | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | DeepSeek Harness 的提示注入、越狱与密钥泄露防护。 | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | 工程纪律守卫：需求质询、测试门禁、对手评审 | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | DeepSeek Harness 的统一静态图像生成路由。 | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | DeepSeek Harness 只读性能诊断。 | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | 面向中国公募基金的确定性研究报告 | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | 面向 DSH 的 GitHub PR/issues 集成，每次写入经审批门控 | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | 行业研究编排，经本插件的 `ctx.researchReport.assemble` 封存交付物 | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | DeepSeek Harness 的本地文档知识库。 | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | DeepSeek Harness 的本地模型（Ollama）接入。 | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | 通过语言服务器的 LSP 诊断、格式化、补全、代码操作与重命名 | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | PII 脱敏中间件：模型边界匿名化、展示层还原 | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | 只读 MCP 运行时面板：/mcp 命令 + 带状态、工具与错误的 Settings 标签页 | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | 审批门控的跨会话记忆：ctx.memory 接缝 + SQLite + 记忆工具 | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | DeepSeek Harness 的 OpenTelemetry 与 Langfuse 可观测导出器。 | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Claude Code 风格声明式 allow/deny/ask 权限规则，带审计 | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | 作为按需代理技能的插件开发知识库 | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | 可验证研究报告引擎：内容寻址证据账本与封存版本 | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | DeepSeek Harness 插件的多维质量评分。 | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | 在 Web 侧栏置顶会话，带持久排序 | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | DeepSeek Harness 的跨设备会话同步——会话存储的专用 git 镜像。 | |
| **[dsh-dsh-skill-pack-security](https://github.com/PerryLink/dsh-dsh-skill-pack-security)** | 安全审计技能包：密钥扫描、依赖与供应链审查 | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | DeepSeek Harness 的语音优先会话闭环：对它说，听它答。 | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | DeepSeek Harness 插件的隔离试装冒烟。 | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | DeepSeek Harness 的厂商参数翻译与确定性 JSON 修复。 | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors

### 从 DSH Desktop 市场安装

所有 PerryLink 插件均可在 DSH Desktop 内置市场中浏览：**市场 → 来源 → 添加来源 → 粘贴** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ 选中**。安装仍需通过市场的 npm 身份校验与你的确认。
