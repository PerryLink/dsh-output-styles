<div align="center">

# 🎨 dsh-output-styles

**Claude Code `outputStyles` 를 DeepSeek Harness 에서** —— 모델 출력 스타일을 세션별로, 런타임에, 영구적으로 전환하세요.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![Tests](https://img.shields.io/badge/tests-53%20passed-success.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` —— 이제부터 모든 답변은 간결하게. `/style step-by-step` —— 모델이 번호 매긴 단계로 추론을 설명합니다. `/style off` —— 기본값으로 복귀. 세션마다 명령 하나, 재시작에도 유지되고, agent loop 는 전혀 건드리지 않습니다.

## ✨ 기능

- **스타일 라이브러리**: `styles/*.md` (파일 하나 = 스타일 하나). frontmatter `name` / `description` / `whenToUse`, 본문이 모델에 주입되는 지시문.
- **`/style` 명령**: 인자 없이 실행하면 스타일 목록과 현재 선택 표시. `/style <name>` 전환, `/style off` 기본 복귀. 엄격한 입력 검증.
- **세션별 영속화**: `ctx.storageDomain` 의 `output_style` 도메인에 sessionId 키로 `{ style, source }` 저장. `source` 는 `{ kind: 'plugin', plugin: 'dsh-output-styles' }`. 세션 간 간섭 없음, 재시작 후에도 유지.
- **시스템 프롬프트 주입**: `ctx.systemPrompt.section()` (order 90, 이름 `output-style:selection`) 이 매 조립마다 현재 세션의 스타일 본문을 주입. 본문은 `maxStyleChars`(기본 4000 자) 로 잘리고 잘린 지점에 마커 추가.
- **Claude Code 호환**: `compatJson: true`(기본) 일 때 `styles/*.json` 의 `outputStyles` 컬렉션 형식(`{ "name", "description", "prompt" }`)을 내부 형식으로 변환. 해석 불가 JSON 은 경고와 함께 건너뜀.
- **세션 프로젝션**: Web UI 용 `style` 프로젝션 유닛(`{ options, currentValue }`) 등록. 로그에서 실제 수락된 전환만 폴딩.
- **오설정은 즉시 실패, 손상 파일은 건너뜀**: 설정 오류는 로드 시 throw. 스타일 파일 하나의 파싱 실패는 경고만 남기고 플러그인 로드는 계속.

## 🚀 빠른 시작

```sh
# 1. 설치 (web 프로필은 그대로 동작. headless 는 storage 행 필요)
dsh plugin --profile <name> add dsh-output-styles

# 2. 활성화 행 작성 (순수 cordis 플러그인: CLI 는 의존성만 설치)
#    프로필 cordis.patch.yml:
- insert:
    - id: output-styles
      name: 'dsh-output-styles'

# 3. 부팅 후 전환
dsh --profile <name>
/style               # → output style off (available: concise, step-by-step)
/style concise       # → switched to concise
```

> **전제 조건: `ctx.storageDomain`.** 플러그인은 `inject: ['storageDomain']` 을 선언합니다. 스토리지 도메인 시설(`@deepseek-ai/dsh-storage-domain`, kv facet 백엔드로 라우팅)이 없으면 플러그인은 대기 상태로 남고, storage 행이 갖춰지면 자동 활성화됩니다. web 프로필은 `storage` + `storage-json`(`backend: json`) + `storage-domain` 내장. headless 는 세 행을 직접 추가합니다(샘플: [cordis.patch.yml](cordis.patch.yml)).

## 🎬 데모

```
You > /style
      output style off (available: concise, step-by-step)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

*(실제 headless 실행, deepseek-v4-pro. 전환 전 같은 프롬프트에는 서두가 긴 답변이 나왔습니다. 전체 기록: [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md).)*

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

모델이 보는 모든 것은 세션 로그에서 재구성 가능합니다(새 세션 이벤트 타입도, agent-loop 변경도 없음). 스타일 이름은 `command/run`, 주입된 전문은 `request/header`, 출처 마커 `{ kind: 'plugin', plugin: 'dsh-output-styles' }` 는 도메인 레코드에 남습니다.

## ⚙️ 설정

모든 조정 값은 Schemastery `Config` 필드(잘못된 값은 로드 시 실패):

| 필드 | 기본값 | 의미 |
|---|---|---|
| `stylesDir` | `''` | 스타일 라이브러리 디렉터리. `''` = 내장 `styles/`, 그 외 cwd 기준. |
| `maxStyleChars` | `4000` | 본문 문자 수 예산(≥1). 초과분은 마커와 함께 잘림. |
| `defaultStyle` | `''` | 미선택 세션의 폴백. `''` = 새 세션은 주입 없음. |
| `compatJson` | `true` | Claude Code `outputStyles` JSON 로드 여부. |
| `sectionOrder` | `90` | 주입 섹션 순서(0 = persona, 100–199 = 도구 지침). |
| `truncationMarker` | `"\n\n[style truncated]"` | 잘린 지점의 마커. |

## 📚 스타일 라이브러리 형식

```markdown
---
name: concise
description: Terse, direct answers — minimal prose, no preamble.
whenToUse: Daily coding work, tool-heavy sessions, or when prompt length matters.
---

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
```

Claude Code `outputStyles` JSON (`compatJson: true`):

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

`name` 은 kebab-case(`^[a-z][a-z0-9-]*$`). `off` 는 예약된 전환 대상입니다.

## ⌨️ 명령 레퍼런스

| 입력 | 결과 |
|---|---|
| `/style` | 스타일 목록과 현재 선택 |
| `/style concise` | 전환(영구 기록), `switched to concise` |
| `/style off` | 기본값 복귀 |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🔍 충돌 조사 (2026-08 스냅샷)

[topic:dsh-plugin](https://github.com/topics/dsh-plugin) 에 동명·동기능 저장소 없음, 주요 [awesome 목록](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 에도 output-style 카테고리 없음, [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop)(189 항목) 미수록. 인접 프로젝트는 [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md)(persona)와 [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace)(output styles 는 v0.2+ 로 연기)뿐이며 충돌하지 않습니다.

## 🧪 개발

```sh
pnpm install
pnpm run typecheck
pnpm test            # vitest — 53 테스트
pnpm run build
pnpm pack
```

구조는 [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template) 준수: `src/index.ts` / `src/config.ts` / `src/runtime.ts` / `src/invariant.ts` / `styles/`. 검증 기록: [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md).

## 📄 라이선스

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
