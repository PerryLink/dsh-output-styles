<div align="center">

# 🎨 dsh-output-styles

**Claude Code の `outputStyles` を DeepSeek Harness へ** —— モデルの出力スタイルをセッション単位で、実行時に、永続的に切り替え。

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![Tests](https://img.shields.io/badge/tests-53%20passed-success.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` —— 以降の返信は簡潔に。`/style step-by-step` —— モデルは番号付きステップで推論を説明。`/style off` —— デフォルトに戻す。セッションごとに 1 コマンド、再起動しても保持され、agent loop には一切手を入れません。

## ✨ 機能

- **スタイルライブラリ**: `styles/*.md`（1 ファイル = 1 スタイル）。frontmatter に `name` / `description` / `whenToUse`、本文がモデルへ注入する指示。
- **`/style` コマンド**: 引数なしで利用可能なスタイルと現在の選択を一覧。`/style <name>` で切替、`/style off` でデフォルト復帰。入力は厳格に検証。
- **セッション単位の永続化**: `ctx.storageDomain` の `output_style` ドメインに sessionId をキーとして `{ style, source }` を保存。`source` は `{ kind: 'plugin', plugin: 'dsh-output-styles' }`。セッション間は相互に影響せず、再起動後も保持。
- **システムプロンプトへの注入**: `ctx.systemPrompt.section()`（order 90、名前 `output-style:selection`）が毎回のアセンブリで現在のスタイル本文を注入。本文は `maxStyleChars`（既定 4000 文字）で切り詰め、切り詰め位置にマーカーを付与。
- **Claude Code 互換**: `compatJson: true`（既定）で `styles/*.json` の `outputStyles` コレクション形式（`{ "name", "description", "prompt" }`）を読み込み内部形式へ変換。解釈不能な JSON は警告付きでスキップ。
- **セッション投影**: Web UI 向けに `style` 投影ユニット（`{ options, currentValue }`）を登録。ログ上で実際に受理された切替のみを折りたたみます。
- **設定ミスは即失敗、壊れたファイルはスキップ**: 設定エラーはロード時に throw。単一スタイルファイルの解析失敗は警告のみで、プラグインのロードは継続。

## 🚀 クイックスタート

```sh
# 1. インストール（web プロファイルはそのまま動作。headless は storage 行が必要）
dsh plugin --profile <name> add dsh-output-styles

# 2. アクティベーション行を記述（純 cordis プラグインのため CLI は依存追加のみ）
#    プロファイルの cordis.patch.yml:
- insert:
    - id: output-styles
      name: 'dsh-output-styles'

# 3. 起動して切替
dsh --profile <name>
/style               # → output style off (available: concise, step-by-step)
/style concise       # → switched to concise
```

> **前提条件: `ctx.storageDomain`。** プラグインは `inject: ['storageDomain']` を宣言します。ストレージドメイン施設（`@deepseek-ai/dsh-storage-domain`、kv facet 付きバックエンドへルーティング済み）が無い場合、プラグインは待機状態のままとなり、storage 行が揃うと自動で有効化されます。web プロファイルは `storage` + `storage-json`（`backend: json`）+ `storage-domain` を内蔵。headless は 3 行を自身で追加します（サンプル: [cordis.patch.yml](cordis.patch.yml)）。

## 🎬 デモ

```
You > /style
      output style off (available: concise, step-by-step)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

*(実 headless 実行・deepseek-v4-pro。切替前は同じプロンプトに対し前置き付きの長い回答でした。全記録は [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md)。)*

## 🧠 仕組み

```mermaid
flowchart LR
    U[/style concise を入力] --> C[コマンドレジストリ]
    C -->|command/run を記録| L[(セッションログ)]
    C -->|put {style, source}| D[(output_style ドメイン)]
    D --> R[OutputStyleRuntime]
    R -->|毎回のアセンブリで本文を注入| S[systemPrompt セクション order 90]
    S --> M[モデルリクエスト]
    M -->|完全なシステムプロンプト| H[request/header を記録]
```

モデルが見るすべてはセッションログから再構築可能です（新しいセッションイベント型も agent-loop の変更も不要）。スタイル名は `command/run`、実際に注入された全文は `request/header`、出所マーカー `{ kind: 'plugin', plugin: 'dsh-output-styles' }` はドメインレコードに残ります。

## ⚙️ 設定

すべての調整値は Schemastery の `Config` フィールド（不正値はロード時に失敗）:

| フィールド | 既定 | 意味 |
|---|---|---|
| `stylesDir` | `''` | スタイルライブラリのディレクトリ。`''` = 同梱 `styles/`、他は cwd 相対。 |
| `maxStyleChars` | `4000` | 本文の文字数バジェット（≥1）。超過分はマーカー付きで切り詰め。 |
| `defaultStyle` | `''` | 未選択セッションのフォールバック。`''` = 新規セッションは注入なし。 |
| `compatJson` | `true` | Claude Code `outputStyles` JSON を読み込むか。 |
| `sectionOrder` | `90` | 注入セクションの順序（0 = persona、100–199 = ツールガイダンス）。 |
| `truncationMarker` | `"\n\n[style truncated]"` | 切り詰め位置のマーカー。 |

## 📚 スタイルライブラリ形式

```markdown
---
name: concise
description: Terse, direct answers — minimal prose, no preamble.
whenToUse: Daily coding work, tool-heavy sessions, or when prompt length matters.
---

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
```

Claude Code `outputStyles` JSON（`compatJson: true`）:

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

`name` は kebab-case（`^[a-z][a-z0-9-]*$`）。`off` は予約済みの切替ターゲットです。

## ⌨️ コマンドリファレンス

| 入力 | 結果 |
|---|---|
| `/style` | スタイル一覧と現在の選択 |
| `/style concise` | 切替（永続書き込み）、`switched to concise` |
| `/style off` | デフォルト復帰 |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🔍 競合調査（2026-08 スナップショット）

[topic:dsh-plugin](https://github.com/topics/dsh-plugin) に同名・同機能のリポジトリはなく、主要 [awesome リスト](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) にも output-style カテゴリはありません。[dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop)（189 エントリ）にも未収録。近傍は [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)（persona）と [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)（output styles は v0.2+ に先送り）のみで、いずれも衝突しません。

## 🧪 開発

```sh
pnpm install
pnpm run typecheck
pnpm test            # vitest — 53 テスト
pnpm run build
pnpm pack
```

構成は [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) に準拠: `src/index.ts` / `src/config.ts` / `src/runtime.ts` / `src/invariant.ts` / `styles/`。検証記録は [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md)。

## 📄 ライセンス

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
