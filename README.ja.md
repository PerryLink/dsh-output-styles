<div align="center">

# 🎨 dsh-output-styles

**DeepSeek Harness 向け Claude Code `outputStyles`** —— モデルの出力スタイルを実行時に、セッション単位で、永続的に切り替えます。

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

`/style concise` —— これ以降の返信はすべて簡潔になります。`/style step-by-step` —— モデルが番号付きの手順で説明します。`/style off` —— プロジェクトのデフォルトに戻ります。セッションごとに 1 コマンド、再起動をまたいで保持され、agent loop には一切変更を加えません。

## ✨ 機能

| | |
|---|---|
| 🗂️ **スタイルライブラリ** | スタイルごとに 1 つの Markdown ファイル（`styles/*.md`）。frontmatter にメタデータ、本文がモデルへの指示です。`name` は既定でファイル名になり、空白を含めます（`Diagrams first`）。同梱の組み込みスタイルは 6 種で、Claude Code と同等の `proactive` と `learning` を含みます。 |
| ⌨️ **`/style` コマンド** | 引数なしでスタイル一覧（説明付き）と現在の選択を表示。`/style <name>` で切り替え、`/style off` でプロジェクトのデフォルトを復元します。`/style` より後の残り全体がスタイル名です。 |
| 💾 **セッション単位の永続化** | 選択は `output_style` ストレージドメインに sessionId をキーとして保持され、2 つのセッションが干渉することはなく、選択は再起動後も残ります。 |
| 🧩 **システムプロンプト注入** | `systemPrompt.section()` の貢献（order 90）が、毎回の組み立てで現在のセッションのスタイル本文を注入します。本文は設定可能なバジェットで切り詰められます。 |
| 🎭 **Claude Code `keep-coding-instructions`** | `keep-coding-instructions: false`（Claude Code と同じ既定）のスタイルはシステムプロンプト全体を置き換えます——ソフトウェアエンジニアリングから離れるスタイル向けです。 |
| 📌 **強制スタイル** | Claude Code の `force-for-plugin`（エイリアス `force`）はセッションの選択を無視して無条件にスタイルを適用します。強制スタイルが 2 つあると読み込みに失敗します。 |
| 🔁 **Claude Code 互換性** | `outputStyles` JSON コレクション（`{ name, description, prompt }`）を読み込みます。単一エントリまたは `settings.json` 形式の配列に対応し、解析不能なエントリは警告付きでスキップします。 |
| 📚 **ディレクトリの階層化** | `stylesDir` はリストで、後方のディレクトリが前方のものを上書きします（同梱の `styles/` が最下層で、`includeBuiltins: false` で無効化）。 |
| 🔄 **ホットリロード** | スタイルファイルの変更は再起動なしで反映されます（`watchStyles: false` で無効化）。 |
| ⚙️ **settings とプロジェクトデフォルト** | 一度も選択していないセッションは、DSH settings の `output-style.style`、次いで `defaultStyle` にフォールバックします。 |
| 🖱️ **Web ピッカー** | `dsh.client` エントリ（`dsh-output-styles/client`）が、ホストの `/style` コマンドを投影ベースのポップアップピッカーで装飾します。 |
| 📊 **セッション投影** | Web UI 向けの `style` 投影（`{ options, currentValue }`）。セッションログ内で確定したコマンドから折りたたまれます。 |
| 🧯 **失敗は明示、スキップはクリーンに** | 設定ミスは読み込み時に例外を投げます。不正なスタイルファイルは警告付きでスキップされ、プロファイルを壊すことはありません。 |
| 🌐 **5 言語のドキュメント** | EN · 中文 · 日本語 · 한국어 · Español。 |

## 🚀 クイックスタート

```sh
# 1. インストール——このパッケージは bundle レイヤーなので、1 コマンドで
#    storage + storage-json + storage-domain + プラグイン行が構成されます：
dsh plugin --profile <name> add dsh-output-styles

# 2. 起動して切り替え
dsh --profile <name>
/style               # → output style off、その後にスタイルごとに 1 行
/style concise       # → switched to concise
/style Diagrams first  # → 空白を含む名前も使えます
/style off           # → プロジェクトのデフォルトに戻る
```

このレイヤーは web プロファイルに対して冪等です（id 単位の挿入が同 id の行を置き換えます）。web プロファイルには `storage` があらかじめ含まれています。Web ピッカーを使うには、プロファイルにクライアント行を追加します：

```yaml
- id: output-styles-client
  name: 'dsh-output-styles/client'
```

## 🎬 デモ

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

You > 一文だけで自己紹介してください。
AI  > 私は DeepSeek Harness プラグインプラットフォーム上で動作する、deepseek-v4-pro モデルベースの AI コーディングエージェントです。
```

## 🧠 仕組み

```mermaid
flowchart LR
    U[/style concise と入力] --> C[コマンドレジストリ]
    C -->|command/run を記録| L[(セッションログ)]
    C -->|put {style, source}| D[(output_style ドメイン)]
    D --> R[OutputStyleRuntime]
    R -->|毎回の組み立てで本文を注入| S[systemPrompt セクション order 90]
    S --> M[モデルリクエスト]
    M -->|完全なシステムプロンプト| H[request/header を記録]
```

モデルが見るものはすべてセッションログから再構築できます——新しいセッションイベント型も agent-loop の変更も不要です。スタイル名は `command/run` から、注入された正確なテキストは `request/header` から得られ、出所マーカー `{ kind: 'plugin', plugin: 'dsh-output-styles' }` はドメインレコードに残ります。スタイルはメイン会話のみに適用され、サブエージェントのセッションは独自のプロンプトを保持します（Claude Code と一致）。

## ⚙️ 設定

すべての調整項目は検証付きの Schemastery `Config` フィールドです（不正な値は読み込みに失敗します）：

| フィールド | 既定 | 意味 |
|---|---|---|
| `stylesDir` | `[]` | スタイルライブラリのディレクトリ。cwd を基準に解決され、後方のエントリが前方のものを上書きします。`[]` = 同梱の `styles/` のみ。裸の文字列は単一ディレクトリのリストとみなされます。 |
| `maxStyleChars` | `4000` | スタイル本文のバジェット（コードポイント、≥ 1）。長い本文はマーカー付きで切り詰められます。 |
| `defaultStyle` | `''` | 一度も選択していないセッション（かつ settings の既定もない）向けのスタイル。`''` = スタイルなし。 |
| `compatJson` | `true` | Claude Code `outputStyles` の JSON エントリ（単一オブジェクトまたは配列）を読み込みます。 |
| `sectionOrder` | `90` | 注入セクションの順序（0 = persona、100–199 = ツールガイダンス）。 |
| `truncationMarker` | `"\n\n[style truncated]"` | 切り詰め位置に付加されるマーカー。 |
| `includeBuiltins` | `true` | パッケージ同梱の `styles/` を最優先度の低いレイヤーとして含めます。 |
| `watchStyles` | `true` | スタイルファイルがディスク上で変更されたときにライブラリを再読み込みします。 |
| `rules` | `[]` | セッション/ツール別の描画ルール：`[{ match: { tool?, contentType?, session? }, style, priority? }]`——`style` はレンダラー id（ビルトインはスタイル名と同名）。 |
| `enableExport` | `true` | `/export` コマンドを登録（Markdown/HTML セッション書き出し、レンダラー対応）。 |

## 🎨 レンダラープロトコル

`output.render.*` プロトコルはプレゼンテーション層を拡張点にします。レンダラーは**純粋な presenter**——`presenter(text, context)` が引数を表示データに写し、DOM には触れません——ツール名とコンテンツタイプでマッチし、優先度で並びます。サードパーティは `ctx.outputRenderers.register({ id, match, priority, presenter })` で登録（register は disposer を返し、呼び出し側の ctx.effect が所有）。各レンダーはまず `output.render/before` waterfall（リスナーは必ず `next()`）を通り、次にルール表（セッション/ツール別：`rules: [{ match: { tool: 'bash' }, style: 'concise' }]`、設定画面 `output-style-rules` で編集可）。ビルトインは `concise`（空白圧縮 + 予算切り詰め）と `step-by-step`（手順の連番化）。監査可能：各結果は `{ original, rendered, rendererId, changed }` を持ち、原文はセッションログそのもので決定論的に再構築できます。`/export [markdown|html] [--renderer=<id>]` は同じパイプラインで現在のセッションを書き出します。完全な仕様：docs/renderer-protocol.md（英語）/ docs/renderer-protocol.zh.md。
## 📚 スタイルライブラリ

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

frontmatter フィールド：

| フィールド | 既定 | 意味 |
|---|---|---|
| `name` | ファイル名 | 切り替え対象。英字、数字、空白、ハイフン（先頭・末尾の空白は不可。`off` は予約済み）。 |
| `description` | —（必須） | 一覧とピッカーに表示される 1 文。 |
| `whenToUse` | — | 一覧に追記される任意の利用ガイダンス。 |
| `keep-coding-instructions` | `false` | `true` のときハーネスのプロンプト（アイデンティティ、persona、ツールガイダンス）を保持し、`false` のとき完全に置き換えます（Claude Code のセマンティクス）。 |
| `force-for-plugin` | `false` | Claude Code 公式フィールド：セッションの選択を無視して無条件に適用します。`force` はエイリアスで、設定できるのは最大 1 つのスタイルです。 |

<details>
<summary>Claude Code <code>outputStyles</code> JSON（<code>compatJson: true</code>）</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

エントリは Claude Code が書き込むとおりに `keep-coding-instructions` と `force-for-plugin` を受け付けます。レガシーの `settings.json` 配列（`[{ … }, { … }]`）はそのまま読み込まれ、不正なエントリは警告付きでスキップされます。

</details>

## ⌨️ コマンドリファレンス

| 入力 | 結果 |
|---|---|
| `/style` | 現在の選択 + スタイルごとに 1 行（name — description）を一覧表示 |
| `/style concise` | 切り替え（永続書き込み）、`switched to concise` |
| `/style Diagrams first` | 複数語の名前は残り全体が対象 |
| `/style off` | プロジェクトのデフォルトを復元（settings の既定、次いで `defaultStyle`） |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🖱️ Web ピッカー

`dsh.client` エントリは、ホストの `/style` コマンドの引数なし呼び出しをポップアップピッカーで装飾します：「off」行 + ライブラリのスタイルごとに 1 行（`description · whenToUse`）で、アクティブな行がマークされます。選択するとコマンド Remote を通じて `/style <name>` が送信されるため、どの切り替えもホストの永続的なコマンドライフサイクルを経由し、`style` 投影が唯一の表示事実であり続けます。ピッカーの文言は Web UI が同梱する `zh`/`en` の言語ペアに従います。

## 🔍 競合チェック

開発前に DSH エコシステムを調査しました（2026-08 スナップショット）：[topic:dsh-plugin](https://github.com/topics/dsh-plugin) 配下に `style`/`output-style` のリポジトリはなく、4 つの主要な [awesome リスト](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) に output-style カテゴリはなく、[dsh-hub カタログ](https://github.com/omdsh-dev/dsh-hub-workshop) にもエントリはありません。最も近い隣接プロジェクト——[dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)（persona）と [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)（出力スタイルは明示的に v0.2+ へ先送り）——は隣接していて、競合はしません。

## 🆚 Claude Code との違い

| | Claude Code | dsh-output-styles |
|---|---|---|
| スタイルファイル | ユーザー/プロジェクト/マネージド階層の `.claude/output-styles` | `stylesDir` ディレクトリ + 同梱の `styles/`。後方のディレクトリが優先 |
| カスタムスタイル | Markdown、frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | 同じフィールド（`force-for-plugin` をそのまま受け付け、`force` はエイリアス）+ `whenToUse` |
| レガシー JSON | `settings.json` 内の `outputStyles` 配列 | そのまま読み込み（`compatJson: true`） |
| 反映タイミング | `/clear` 後または新しいセッション | 即時——システムプロンプトはリクエストごとに再構築 |
| サブエージェント | スタイルは適用されない | 同じ——サブエージェントのセッションは独自のプロンプトを保持 |
| 切り替え | `/config` メニューまたは `outputStyle` 設定（`/output-style` コマンドは v2.1.91 で削除） | `/style` コマンド + Web ピッカー + settings `output-style.style` |

## 🧪 開発

```sh
pnpm install
pnpm run typecheck   # 両方の tsc プロジェクト
pnpm test            # vitest — 93 テスト
pnpm run verify      # typecheck + テスト + 自己完結チェック（prepublishOnly ゲート）
pnpm run build       # lib/ 成果物（ホスト + クライアント bundle）
pnpm pack            # dsh plugin add 用の tarball
```

リリース：`package.json` のバージョンと一致する接尾辞を持つ `v*` タグを push すると Publish ワークフローが起動します——完全検証の後に npm へ公開（provenance 付き）。あらゆる `npm publish` も `prepublishOnly` 経由で `verify` ゲートを通過します。

構成は [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) に従います：`src/index.ts`（プラグインメタデータ）、`src/config.ts`（スキーマ）、`src/runtime.ts`（ランタイムサービス + アクティベーション）、`src/invariant.ts`（不変条件）、`src/client/`（Web ピッカー）、`styles/`（組み込みスタイル）。

## 👥 コントリビューター

本プロジェクトに貢献してくださったすべての方に感謝します：

- [@PerryLink](https://github.com/PerryLink) — 作者兼メンテナー：プラグインアーキテクチャ、スタイルライブラリ、bundle インストール、Web ピッカー、5 言語ドキュメント、CI/リリースツール。

バグやアイデアがあれば [issue](https://github.com/PerryLink/dsh-output-styles/issues) や [pull request](https://github.com/PerryLink/dsh-output-styles/pulls) をどうぞ。どの言語での貢献も歓迎します。

## 📄 ライセンス

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
