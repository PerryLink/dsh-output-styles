# 验证记录（dsh-output-styles）

> 本文档记录交付验证的实测命令与输出。运行环境：Windows + Node 22 + pnpm 11；宿主为已安装的 `@deepseek-ai/dsh` CLI `0.1.0-rc.6`（`dsh --version` 输出 `0.1.0-rc.6`）。

## 1. 单元与集成测试

```text
$ pnpm test
 ✓ tests/config.spec.ts (6 tests)
 ✓ tests/invariant.spec.ts (9 tests)
 ✓ tests/style-command.spec.ts (7 tests)
 ✓ tests/style-library.spec.ts (13 tests)
 ✓ tests/commands-projections.spec.ts (7 tests)
 ✓ tests/runtime.spec.ts (11 tests)
 Test Files  6 passed (6)
      Tests  53 passed (53)
```

覆盖：风格解析（md/json、坏文件跳过、重名/保留字抛错）、`/style` 分派（无参/切换/off/未知名/多 token）、截断与预算、会话隔离、HMR 配置热更新（fiber 释放后重挂载无残留、持久化选择保留、storageDomain 缺失时待激活并在服务出现后自动激活）、`style` 投影折叠与 checkpoint 往返、不变量检查。集成用例用 npm 发布的 `@deepseek-ai/dsh-*@0.1.0-rc.6` 真实宿主服务组装（sessions / systemPrompt / commands / storage / storage-json / storage-domain / sessionProjections）。

`pnpm run typecheck`、`pnpm run build`、`pnpm run verify:self-contained` 均通过。

## 2. 打包与干净 profile 装载

```text
$ pnpm pack
Tarball Contents（节选）: package.json, LICENSE, lib/index.js, lib/invariant.js, lib/invariant-*.js,
lib/types/**/*.d.ts, src/**, styles/concise.md, styles/step-by-step.md, cordis.patch.yml,
README.md, README.zh.md, README.ja.md, README.ko.md, README.es.md, docs/

$ dsh plugin --profile styles-verify add ./dsh-output-styles-0.1.0.tgz
dsh: warning: dsh-output-styles declares no dsh.bundle — installed as a plain dependency, not a profile layer
```

说明：`0.1.0-rc.6` 的 CLI 对纯 cordis 插件只安装依赖、不自动写行（与官方 publish.md 一致）；激活行由 profile 的 `cordis.patch.yml` 写入（本插件随包附 `cordis.patch.yml` 样例）。headless 组合需补 `storage` / `storage-json` / `storage-domain` 三行（web bundle 内建）。

## 3. `--dump-config` 行生效

```text
$ dsh --profile styles-verify --dump-config
- id: storage
  name: '@deepseek-ai/dsh-storage'
- id: storage-json
  name: '@deepseek-ai/dsh-storage-json'
    root: <DSH_HOME>/storages
- id: storage-domain
  name: '@deepseek-ai/dsh-storage-domain'
- id: output-styles
  name: dsh-output-styles
```

四行全部出现在生效组合中，schema 默认 config 正常展开，启动无 FAILED。

## 4. headless 实测（模型可见注入与回复风格变化）

同一任务，先无风格、再 `defaultStyle: concise`（真实 API、真实模型 deepseek-v4-pro）：

```text
$ dsh --profile styles-verify "请只用一句话介绍你自己，不要客套。"
（无风格）我是 DeepSeek Harness 中的 AI 编码代理，运行于 deepseek-v4-pro 模型之上，负责在插件化代理框架内执行代码编写、文件操作、命令运行与多步骤任务编排。

$ （cordis.patch.yml 中 output-styles 行改为 defaultStyle: concise，HMR 生效）
$ dsh --profile styles-verify "请只用一句话介绍你自己，不要客套。"
（concise）我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理，能直接读写文件、执行命令并检索代码来完成工程任务。
```

会话日志取证（经宿主真实持久化包 `dsh-session-persistence-jsonl` 解码读回，`scripts/verify-session-log.mjs`）：

```text
== session session-3d490e6d-…（concise 运行，170 events）==
request/header logged before dispatch: true
style heading in logged system prompt: true
style body in logged system prompt: true
--- system prompt style excerpt ---
# Output style: concise

Use the following output style for every response in this conversation:

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
…

== session session-de0f3532-…（无风格运行）==
request/header logged before dispatch: true
style heading in logged system prompt: false
```

即：模型可见的风格正文在派发前完整写入 `request/header`（模型可见 ⟺ 已记录），有风格会话与无风格会话可区分；风格名由 `command/run`（`/style` 命令生命周期）与 `output_style` 域记录（含 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 来源标记）重建。

## 5. Web UI 命令入口

- `styles-verify-web` profile（bundles: `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` + 插件行）启动：`dsh web: http://127.0.0.1:3199`（该行在 Loader 树整体落定后打印），启动日志 0 FAILED、0 warning —— 插件行与 Web 组合共存激活。
- 命令发现：集成测试经真实 rc.6 命令注册表断言 `ctx.commands.list(agent)` 含 `{ name: 'style', description: 'Switch the model output style for this session', input: { hint: '<style | off>' } }` —— 这正是 Web UI 经 BFF 读取的同一注册表；`/style` 进入命令面板不依赖任何客户端插件。
- 会话投影 `style`（`{ options, currentValue }`）供 Web UI 读取，经 `sessionProjections.snapshot`/`checkpoint` 往返验证。

## 6. 已知边界

- Web 设置行（`dsh.client` 客户端插件）未实现，见 README TODO。
- headless profile 需自行补 storage 三行（web profile 内建），README 已说明。
