# 验证记录（dsh-output-styles）

> 本文档记录交付验证的实测命令与输出。运行环境：Windows + Node 22 + pnpm 11；宿主为已安装的 `@deepseek-ai/dsh` CLI `0.1.0-rc.6`（`dsh --version` 输出 `0.1.0-rc.6`）。版本：0.2.0。

## 1. 单元与集成测试

```text
$ pnpm test
 ✓ tests/config.spec.ts (9 tests)
 ✓ tests/style-command.spec.ts (10 tests)
 ✓ tests/invariant.spec.ts (9 tests)
 ✓ tests/style-library.spec.ts (24 tests)
 ✓ tests/commands-projections.spec.ts (7 tests)
 ✓ tests/runtime.spec.ts (23 tests)
 ✓ tests/client.spec.ts (6 tests)
 Test Files  7 passed (7)
      Tests  87 passed (87)
```

覆盖：风格解析（md/json 单对象与数组集合、坏文件/坏条目跳过、重名/保留字/双 force 抛错、`name` 缺省继承文件名、多词名、`keep-coding-instructions`/`force` 字段）、`/style` 分派（无参带描述列表/整段文本切换/off/未知名）、码点安全截断与预算、多目录分层（后者覆盖前者、`includeBuiltins`）、fs.watch 热加载（新文件生效、破坏 defaultStyle 时保留旧库）、settings 项目默认（回落、会话选择优先、非法名拒写）、`keep-coding-instructions: false` 整段替换系统提示、force 覆盖、会话隔离、HMR 配置热更新、`style` 投影按 command/done 成功折叠（checkpoint v2 往返、失败命令不改变状态）、不变量检查、Web 客户端选择器（装饰注册、投影选项、整行提交、Remote 失败浮出）。

集成用例用 npm 发布的 `@deepseek-ai/dsh-*@0.1.0-rc.6` 真实宿主/客户端服务组装（sessions / systemPrompt / commands / storage / storage-json / storage-domain / sessionProjections / settings；客户端 commandUi / sessions / remote / locale 为结构型测试替身）。

`pnpm run typecheck`（两个 tsc 工程）、`pnpm run build`（宿主 + 客户端两个 bundle）、`pnpm run verify:self-contained`（44 个文本文件）均通过。

## 2. 打包与 bundle 补丁层装载（0.2.0 新能力）

```text
$ pnpm pack
Tarball Contents（节选）: package.json, LICENSE, lib/index.js, lib/invariant.js, lib/invariant-*.js,
lib/client.js, lib/types/**/*.d.ts, src/**, styles/{concise,explanatory,formal,step-by-step}.md,
cordis.patch.yml, README.md, README.zh.md, README.ja.md, README.ko.md, README.es.md, docs/

$ env:DSH_HOME = <临时目录>
$ dsh plugin --profile scratch add ./dsh-output-styles-0.2.0.tgz
Packages: +9 ... Done in 3.1s        ← 不再出现 "declares no dsh.bundle" 警告

$ dsh --profile scratch --dump-config
# == dsh-output-styles
- id: storage
  name: '@deepseek-ai/dsh-storage'
- id: storage-json
  name: '@deepseek-ai/dsh-storage-json'
- id: storage-domain
  name: '@deepseek-ai/dsh-storage-domain'
- id: output-styles
  name: dsh-output-styles
```

包清单 `dsh.bundle.patch = ./cordis.patch.yml` 生效：一条 `plugin add` 即把 storage 三行 + 插件行作为补丁层组合进 profile（按 id 插入替换同 id 行，对 web profile 幂等）。0.1.0 时代的「纯依赖安装、需手写行」摩擦消除。

## 3. `--dump-config` 行生效

上一步的输出即证明：四行全部出现在生效组合中，schema 默认 config 正常展开（`stylesDir: []`、`includeBuiltins: true`、`watchStyles: true`），启动无 FAILED。

## 4. headless 实测（模型可见注入与回复风格变化）

0.1.0 交付时的真实 API 实测（deepseek-v4-pro）记录保留如下；0.2.0 的模型可见注入路径（`systemPrompt.section` + `system-prompt/assemble` waterfall）改动已由第 1 节的组装级集成测试覆盖，`keep-coding-instructions: false` 的整段替换断言即经真实 rc.6 `SystemPrompt.assemble` 输出验证。真实 API 复测需 `DEEPSEEK_API_KEY`，本机无 key 时按既有策略手动执行：

```text
$ dsh --profile styles-verify "请只用一句话介绍你自己，不要客套。"
（无风格）我是 DeepSeek Harness 中的 AI 编码代理，运行于 deepseek-v4-pro 模型之上，负责在插件化代理框架内执行代码编写、文件操作、命令运行与多步骤任务编排。

$ （cordis.patch.yml 中 output-styles 行改为 defaultStyle: concise，HMR 生效）
$ dsh --profile styles-verify "请只用一句话介绍你自己，不要客套。"
（concise）我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理，能直接读写文件、执行命令并检索代码来完成工程任务。
```

会话日志取证（经宿主真实持久化包 `dsh-session-persistence-jsonl` 解码读回，`scripts/verify-session-log.mjs`，0.2.0 起按任意风格名匹配 `# Output style: <name>` 并报告宿主身份是否共存）：

```text
== session session-3d490e6d-…（concise 运行，170 events）==
request/header logged before dispatch: true
style heading in logged system prompt: true
active style name in logged prompt: concise
style body in logged system prompt: true
harness identity alongside style: true
```

即：模型可见的风格正文在派发前完整写入 `request/header`（模型可见 ⟺ 已记录），有风格会话与无风格会话可区分；风格名由 `command/run`（`/style` 命令生命周期）与 `output_style` 域记录（含 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 来源标记）重建。`keep-coding-instructions: false` 的会话则 `harness identity alongside style: false`。

## 5. Web UI 入口

- **命令入口**：宿主 `/style` 命令经真实 rc.6 命令注册表注册（集成测试断言 `ctx.commands.list(agent)` 含 `{ name: 'style', input: { hint: '<style | off>' } }`）——这正是 Web UI 经 BFF 读取的同一注册表。
- **选择器（0.2.0 新能力）**：`dsh-output-styles/client` 客户端行用 `commandUi.decorate` 把 `/style` 裸调用装饰成投影驱动的 popupSelect（`off` 行 + 每风格一行、当前行高亮、中英双语）；客户端入口测试断言选项构建、`/style <整段名字>`/`/style off` 整行提交与 Remote 失败浮出。实测装载：向 profile 添加 `- id: output-styles-client / name: 'dsh-output-styles/client'` 行后经 Loader 解析，随 web bundle 的客户端运行时激活。
- **会话投影**：`style`（`{ options, currentValue, options[].whenToUse }`）供 Web UI 读取，经 `sessionProjections.snapshot`/`checkpoint` 往返验证（stateVersion 2）。
- **项目默认**：settings 命名空间 `output-style`（`{ style }`）注册在 settings seam 上，无 settings 服务时待激活、不影响主功能（集成测试覆盖两种组合）。

## 6. 已知边界

- 真实 API 复测（第 4 节）需要 `DEEPSEEK_API_KEY`；无 key 时组装级集成测试是模型可见路径的回归保障，真实 API 手动复测步骤不变。
- 风格不作用于子代理会话（与 Claude Code 语义一致，README「与 Claude Code 的差异」表明确记录）。
- settings 提供方未配置时项目默认回落 `defaultStyle`；settings 值在风格热加载后变为悬空名时静默降级为无风格（与悬空会话选择同策略）。
