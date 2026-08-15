<div align="center">

# 🎨 dsh-output-styles

**DeepSeek Harness를 위한 Claude Code `outputStyles`** —— 런타임에, 세션별로, 영구적으로 모델의 출력 스타일을 전환합니다.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` —— 이제부터 모든 답변이 간결해집니다. `/style step-by-step` —— 모델이 번호 매긴 단계로 설명합니다. `/style off` —— 프로젝트 기본값으로 복귀합니다. 세션당 명령 하나, 재시작에도 유지되며 agent loop 변경은 전혀 없습니다.

## ✨ 기능

| | |
|---|---|
| 🗂️ **스타일 라이브러리** | 스타일당 Markdown 파일 하나(`styles/*.md`). frontmatter에 메타데이터를, 본문은 모델 지시문입니다. `name`은 기본값이 파일명이며 공백을 포함할 수 있습니다(`Diagrams first`). 내장 스타일 6종이 함께 제공되며, Claude Code와 동등한 `proactive`와 `learning`을 포함합니다. |
| ⌨️ **`/style` 명령** | 인자 없이 실행하면 스타일 목록(설명 포함) + 현재 선택을 표시합니다. `/style <name>`으로 전환하고 `/style off`로 프로젝트 기본값을 복원합니다. `/style` 뒤의 나머지 전체가 스타일 이름입니다. |
| 💾 **세션 범위 영속화** | 선택은 `output_style` 저장소 도메인에 sessionId를 키로 저장되어, 두 세션이 서로 간섭하지 않고 선택은 재시작 후에도 유지됩니다. |
| 🧩 **시스템 프롬프트 주입** | `systemPrompt.section()` 기여(order 90)가 매 조립마다 현재 세션의 스타일 본문을 주입합니다. 본문은 설정 가능한 예산으로 잘립니다. |
| 🎭 **Claude Code `keep-coding-instructions`** | `keep-coding-instructions: false`(Claude Code와 같은 기본값)인 스타일은 시스템 프롬프트 전체를 교체합니다 —— 소프트웨어 엔지니어링에서 벗어나는 스타일용입니다. |
| 📌 **강제 스타일** | Claude Code의 `force-for-plugin`(별칭 `force`)이 세션 선택을 무시하고 무조건 스타일을 적용합니다. 강제 스타일이 둘이면 로드가 실패합니다. |
| 🔁 **Claude Code 호환성** | `outputStyles` JSON 컬렉션(`{ name, description, prompt }`)을 로드하며, 단일 항목 또는 `settings.json` 스타일 배열을 지원합니다. 해석 불가 항목은 경고와 함께 건너뜁니다. |
| 📚 **계층화된 디렉터리** | `stylesDir`은 목록이며 뒤쪽 디렉터리가 앞쪽을 재정의합니다(내장 `styles/`가 최하위 계층, `includeBuiltins: false`로 비활성화). |
| 🔄 **핫 리로드** | 스타일 파일 변경이 재시작 없이 반영됩니다(`watchStyles: false`로 해제). |
| ⚙️ **설정과 프로젝트 기본값** | 한 번도 선택하지 않은 세션은 DSH 설정의 `output-style.style`, 그다음 `defaultStyle`로 폴백합니다. |
| 🖱️ **웹 피커** | `dsh.client` 항목(`dsh-output-styles/client`)이 호스트의 `/style` 명령을 프로젝션 기반 팝업 피커로 꾸밉니다. |
| 📊 **세션 프로젝션** | Web UI용 `style` 프로젝션(`{ options, currentValue }`)으로, 세션 로그에서 확정된 명령으로부터 폴딩됩니다. |
| 🧯 **명확한 실패, 깔끔한 건너뜀** | 잘못된 설정은 로드 시 예외를 던집니다. 잘못된 스타일 파일은 경고와 함께 건너뛰며 프로필을 깨뜨리지 않습니다. |
| 🌐 **5개 언어 문서** | EN · 中文 · 日本語 · 한국어 · Español. |

## 🚀 빠른 시작

```sh
# 1. 설치 — 이 패키지는 번들 레이어이므로 한 명령으로
#    storage + storage-json + storage-domain + 플러그인 행이 구성됩니다:
dsh plugin --profile <name> add dsh-output-styles

# 2. 부팅하고 전환
dsh --profile <name>
/style               # → output style off, 그다음 스타일별 한 줄
/style concise       # → switched to concise
/style Diagrams first  # → 공백 포함 이름도 동작
/style off           # → 프로젝트 기본값으로 복귀
```

이 레이어는 웹 프로필에 대해 멱등적입니다(id 기준 삽입이 동일 id 행을 대체). 웹 프로필은 `storage`를 기본으로 포함합니다. 웹 피커를 사용하려면 프로필에 클라이언트 행을 추가하세요:

```yaml
- id: output-styles-client
  name: 'dsh-output-styles/client'
```

## 🎬 데모

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

You > 한 문장으로만 자기소개해 주세요.
AI  > 저는 DeepSeek Harness 플러그인 플랫폼에서 실행되고 deepseek-v4-pro 모델을 기반으로 하는 AI 코딩 에이전트입니다.
```

## 🧠 동작 방식

```mermaid
flowchart LR
    U[/style concise 입력] --> C[명령 레지스트리]
    C -->|command/run 기록| L[(세션 로그)]
    C -->|put {style, source}| D[(output_style 도메인)]
    D --> R[OutputStyleRuntime]
    R -->|매 조립마다 본문 주입| S[systemPrompt 섹션 order 90]
    S --> M[모델 요청]
    M -->|전체 시스템 프롬프트| H[request/header 기록]
```

모델이 보는 모든 것은 세션 로그에서 재구성할 수 있습니다 —— 새로운 세션 이벤트 타입도, agent-loop 변경도 없습니다. 스타일 이름은 `command/run`에서, 주입된 정확한 텍스트는 `request/header`에서 나오며, 출처 마커 `{ kind: 'plugin', plugin: 'dsh-output-styles' }`는 도메인 레코드에 남습니다. 스타일은 메인 대화에만 적용되며, 하위 에이전트 세션은 자체 프롬프트를 유지합니다(Claude Code와 일치).

## ⚙️ 설정

모든 조정 값은 검증된 Schemastery `Config` 필드입니다(잘못된 값은 로드 실패):

| 필드 | 기본값 | 의미 |
|---|---|---|
| `stylesDir` | `[]` | 스타일 라이브러리 디렉터리. cwd 기준으로 해석되며 뒤쪽 항목이 앞쪽을 재정의합니다. `[]` = 내장 `styles/`만. 단순 문자열은 단일 디렉터리 목록입니다. |
| `maxStyleChars` | `4000` | 스타일 본문 예산(코드 포인트, ≥ 1). 더 긴 본문은 마커와 함께 잘립니다. |
| `defaultStyle` | `''` | 한 번도 선택하지 않은 세션(설정 기본값도 없음)에 적용할 스타일. `''` = 스타일 없음. |
| `compatJson` | `true` | Claude Code `outputStyles` JSON 항목(단일 객체 또는 배열)을 로드합니다. |
| `sectionOrder` | `90` | 주입 섹션의 순서(0 = persona, 100–199 = 도구 지침). |
| `truncationMarker` | `"\n\n[style truncated]"` | 잘린 지점에 추가되는 마커. |
| `includeBuiltins` | `true` | 패키지 내장 `styles/`를 최저 우선순위 계층으로 포함합니다. |
| `watchStyles` | `true` | 디스크에서 스타일 파일이 변경되면 라이브러리를 다시 로드합니다. |

## 📚 스타일 라이브러리

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

frontmatter 필드:

| 필드 | 기본값 | 의미 |
|---|---|---|
| `name` | 파일명 | 전환 대상. 문자, 숫자, 공백, 하이픈(선행/후행 공백 없음. `off`는 예약됨). |
| `description` | —(필수) | 목록과 피커에 표시되는 한 문장. |
| `whenToUse` | — | 목록에 덧붙이는 선택적 안내. |
| `keep-coding-instructions` | `false` | `true`면 하네스 프롬프트(정체성, persona, 도구 지침)를 유지하고, `false`면 완전히 교체합니다(Claude Code 의미론). |
| `force-for-plugin` | `false` | Claude Code 공식 필드: 세션 선택을 무시하고 무조건 적용합니다. `force`는 별칭이며 최대 한 스타일만 설정할 수 있습니다. |

<details>
<summary>Claude Code <code>outputStyles</code> JSON(<code>compatJson: true</code>)</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

항목은 Claude Code가 쓰는 그대로 `keep-coding-instructions`와 `force-for-plugin` 필드를 받습니다. 레거시 `settings.json` 배열(`[{ … }, { … }]`)은 그대로 로드되고, 잘못된 항목은 경고와 함께 건너뜁니다.

</details>

## ⌨️ 명령 레퍼런스

| 입력 | 결과 |
|---|---|
| `/style` | 현재 선택 + 스타일별 한 줄(name — description) 나열 |
| `/style concise` | 전환(영구 기록), `switched to concise` |
| `/style Diagrams first` | 여러 단어 이름은 나머지 전체 |
| `/style off` | 프로젝트 기본값 복원(설정 기본값, 그다음 `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🖱️ 웹 피커

`dsh.client` 항목은 호스트 `/style` 명령의 인자 없는 호출을 팝업 피커로 꾸밉니다: 「off」 행 + 라이브러리 스타일별 한 행(`description · whenToUse`), 활성 행이 표시됩니다. 선택하면 명령 Remote를 통해 `/style <name>`을 제출하므로, 모든 전환이 호스트의 영구적인 명령 수명 주기를 유지하고 `style` 프로젝션이 유일하게 표시되는 사실로 남습니다. 피커 문구는 Web UI에 내장된 `zh`/`en` 언어 쌍을 따릅니다.

## 🔍 충돌 검사

개발 전 DSH 생태계를 조사했습니다(2026-08 스냅샷): [topic:dsh-plugin](https://github.com/topics/dsh-plugin) 아래 `style`/`output-style` 저장소 없음, 4대 [awesome 목록](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)에 output-style 카테고리 없음, [dsh-hub 카탈로그](https://github.com/omdsh-dev/dsh-hub-workshop)에도 항목 없음. 가장 가까운 이웃인 [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)(persona)와 [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)(출력 스타일을 명시적으로 v0.2+로 연기)은 인접하지만 충돌하지 않습니다.

## 🆚 Claude Code와의 차이

| | Claude Code | dsh-output-styles |
|---|---|---|
| 스타일 파일 | 사용자/프로젝트/관리 계층의 `.claude/output-styles` | `stylesDir` 디렉터리 + 내장 `styles/`, 뒤쪽 디렉터리가 우선 |
| 사용자 정의 스타일 | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | 동일 필드(`force-for-plugin` 그대로 수용, `force`는 별칭) + `whenToUse` |
| 레거시 JSON | `settings.json`의 `outputStyles` 배열 | 그대로 로드(`compatJson: true`) |
| 적용 시점 | `/clear` 후 또는 새 세션 | 즉시 — 시스템 프롬프트가 요청마다 재조립 |
| 하위 에이전트 | 스타일 미적용 | 동일 — 하위 에이전트 세션은 자체 프롬프트 유지 |
| 전환 | `/config` 메뉴 또는 `outputStyle` 설정(`/output-style` 명령은 v2.1.91에서 제거) | `/style` 명령 + 웹 피커 + 설정 `output-style.style` |

## 🧪 개발

```sh
pnpm install
pnpm run typecheck   # 두 tsc 프로젝트
pnpm test            # vitest — 92 테스트
pnpm run verify      # typecheck + 테스트 + 자체 포함 검사(prepublishOnly 게이트)
pnpm run build       # lib/ 산출물(호스트 + 클라이언트 번들)
pnpm pack            # dsh plugin add용 tarball
```

릴리스: `package.json` 버전과 일치하는 접미사를 가진 `v*` 태그를 push하면 Publish 워크플로가 실행됩니다 — 전체 검증 후 npm 게시(provenance 포함). 모든 `npm publish`도 `prepublishOnly`를 통해 `verify` 게이트를 통과합니다.

구조는 [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template)를 따릅니다: `src/index.ts`(플러그인 메타데이터), `src/config.ts`(스키마), `src/runtime.ts`(런타임 서비스 + 활성화), `src/invariant.ts`(불변식), `src/client/`(웹 피커), `styles/`(내장 스타일).

## 📄 라이선스

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
