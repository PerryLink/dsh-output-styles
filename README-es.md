<div align="center">

# 🎨 dsh-output-styles
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-output-styles` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

**`outputStyles` de Claude Code para DeepSeek Harness**: cambia el estilo de salida del modelo en tiempo de ejecución, por sesión, de forma duradera.

*`/style concise` — y a partir de ahora toda respuesta es concisa. `/style off` — de vuelta al valor por defecto del proyecto.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-output-styles)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-output-styles.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-output-styles/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-output-styles/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-output-styles?label=version)](https://github.com/PerryLink/dsh-output-styles/releases)
[![npm version](https://img.shields.io/npm/v/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)
[![npm downloads](https://img.shields.io/npm/dm/dsh-output-styles)](https://www.npmjs.com/package/dsh-output-styles)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.1.7-alpha.1` (adaptado el 2026-09-09): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. Verificado el 2026-09-11 contra el checkout master dsh-v0.1.7-alpha.1 (cadena de puertas completa + smoke de instalación del perfil). |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | Todas (host + cliente web) |
| Model | Cualquiera (inyección en el prompt del sistema) |

## What you get

`dsh-output-styles` es el equivalente de `outputStyles` de Claude Code para DeepSeek Harness: un comando `/style` que cambia el estilo de salida del modelo en tiempo de ejecución, persistido por sesión e inyectado en cada ensamblado del prompt.

- **Librería de estilos** — un archivo Markdown por estilo (`styles/*.md`); frontmatter para metadatos, cuerpo = la directiva del modelo. Seis estilos integrados (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), incluidos `proactive` y `learning` con paridad Claude Code.
- **Comando `/style`** — sin argumento lista los estilos (con descripciones) más la selección actual; `/style <name>` cambia; `/style off` restaura el valor por defecto del proyecto.
- **Persistencia por sesión** — la elección vive en el dominio de almacenamiento `output_style`, indexada por sessionId, y sobrevive a los reinicios.
- **Inyección en el prompt del sistema** — una contribución `systemPrompt.section()` (orden `sectionOrder`) inyecta el cuerpo del estilo actual en cada ensamblado, truncado a un presupuesto configurable.
- **Paridad Claude Code** — `keep-coding-instructions`, `force-for-plugin` (alias `force`), compatibilidad JSON `outputStyles`, directorios `stylesDir` por capas, recarga en caliente y un fallback del proyecto editable en vivo desde la página **Plugins** de la Web.
- **Registro de renderers (`output.render.*`)** — `ctx.outputRenderers` permite a cualquier plugin registrar un presenter puro, aplicado a través de la cascada `output.render/before`; renderers integrados `concise` y `step-by-step`.
- **Reglas por sesión/por herramienta** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nombran el renderer para solicitudes coincidentes; editables en vivo desde la página **Plugins** de la Web.
- **`/transcript`** — renderiza la sesión actual a Markdown o HTML saneado a través de la tubería de render; `--save <path>` escribe el documento saneado en esa ruta de workspace tras la aprobación del usuario. Cada render conserva el texto original junto al renderizado.

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
    M -->|full system prompt| H[system/message logged]
```

Todo lo que el modelo ve es reconstruible desde el registro de sesión — sin un nuevo tipo de evento de sesión, sin cambios en el agent-loop. El nombre del estilo viene de `command/run`, el texto exacto inyectado de `system/message`, y el marcador de procedencia `{ kind: 'dsh-output-styles' }` viaja en el registro del dominio. Los estilos se aplican solo a la conversación principal; las sesiones de subagente conservan sus propios prompts (igual que Claude Code).

## Install & uninstall

- **canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` — el script `prepare` compila solo con dependencias de producción.
- **canal npm** (versiones publicadas): `dsh plugin --profile web add dsh-output-styles`.
- **canal tarball**: `pnpm pack` en este repo, luego `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-output-styles`.

## Configuration

Todos los parámetros son campos Schemastery `Config` (modificables desde cordis.yml). Los valores inválidos fallan la carga.

`defaultStyle` y `rules` están declarados `volatile()`, así que en un host que compone la costura de formularios de settings son **campos vivos, editables en la Web**: edítalos en **Plugins → dsh-output-styles** de la interfaz Web y el plugin en ejecución adopta el nuevo valor sin remontarse. Todos los demás campos siguen siendo solo de composición y requieren una recarga. Un valor confirmado se valida antes de aplicarse — si es inválido se rechaza y los valores en ejecución no cambian.

| Key | Default | Editable en Web | Meaning |
|---|---|---|---|
| `stylesDir` | `[]` | No | Directorios de la librería, resueltos contra cwd; las entradas posteriores sobrescriben las anteriores. `[]` = solo los `styles/` integrados |
| `maxStyleChars` | `4000` | No | Presupuesto del cuerpo del estilo (≥ 1); los cuerpos más largos se truncan con un marcador |
| `defaultStyle` | `''` | **Sí** | Estilo para sesiones que nunca eligieron uno; `''` = sin estilo. Un nombre que no está en la librería viva se rechaza en lugar de inyectarse |
| `compatJson` | `true` | No | Cargar entradas JSON `outputStyles` de Claude Code (objetos sueltos o arrays) |
| `sectionOrder` | `90` | No | Orden de la sección inyectada (0 = persona, 100–199 = guía de herramientas) |
| `truncationMarker` | `"\n\n[style truncated]"` | No | Marcador añadido en el punto de truncado |
| `includeBuiltins` | `true` | No | Incluir los `styles/` del paquete como capa de menor prioridad |
| `watchStyles` | `true` | No | Recargar la librería cuando un archivo de estilo cambia en disco |
| `rules` | `[]` | **Sí** | Reglas de render por sesión/herramienta: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | No | Registrar el comando `/transcript` (exportación de sesión Markdown/HTML, consciente del renderer; `--save` escribe con aprobación) |
| `respectCoreOutputStyles` | `true` | No | Al detectar un servicio core `outputStyles`, omitir la inyección de prompt de este plugin (mantener hot-switch / rules / export) |

**Migración desde 0.1.6 o anterior.** Esas versiones mantenían dos secciones de settings propias del plugin, `output-style` (`style`) y `output-style-rules` (`rules`). El host 0.1.7 eliminó la API sobre la que se construyeron, así que ambas secciones ya no existen. Mueve cualquier valor que tuvieras ahí al campo `Config` correspondiente — `output-style.style` → `defaultStyle`, `output-style-rules.rules` → `rules` — en el patch de tu perfil (`cordis.yml`), o defínelo en la página Plugins. Las elecciones por sesión hechas con `/style` no se ven afectadas: viven en el dominio de almacenamiento `output_style`.

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | Lista estilos, cambia o restaura el valor por defecto del proyecto |
| `/transcript` | command | Renderiza la sesión actual a Markdown o HTML saneado; `--save` escribe con aprobación |
| `output_style` | storage domain | Elección de estilo por sesión, indexada por sessionId |
| `systemPrompt.section()` | contribution | Inyecta el cuerpo del estilo actual en cada ensamblado |
| `output.render.*` | renderer registry | `ctx.outputRenderers` + la cascada `output.render/before` |
| `style` | projection | `{ options, currentValue }` plegado desde comandos asentados |
| Web picker | client entry | `dsh-output-styles/client` decora `/style` con un selector emergente |

## Command reference

| Input | Outcome |
|---|---|
| `/style` | Lista la selección actual + una línea por estilo (nombre — descripción) |
| `/style concise` | Cambia (escritura durable), `switched to concise` |
| `/style Diagrams first` | Los nombres de varias palabras son el resto completo |
| `/style off` | Restaura el valor por defecto del proyecto (default de settings, luego `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |
| `/transcript` | Renderiza la sesión actual a Markdown a través de la pipeline de render |
| `/transcript md` | Renderiza a Markdown (`md` es la forma abreviada de `markdown`) |
| `/transcript html` | Renderiza a HTML saneado |
| `/transcript --renderer=concise` | Renderiza forzando un renderer (reglas omitidas) |
| `/transcript md --save report.md` | Renderiza y luego escribe el documento saneado en `report.md` tras la aprobación |

## Style library

Un archivo Markdown por estilo; frontmatter para metadatos, cuerpo = la directiva del modelo. `name` toma por defecto el nombre del archivo y puede contener espacios (`Diagrams first`).

| Field | Default | Meaning |
|---|---|---|
| `name` | nombre del archivo | Destino del cambio; letras, dígitos, espacios y guiones (`off` está reservado) |
| `description` | — (obligatorio) | Una frase mostrada en listados y el selector |
| `whenToUse` | — | Guía opcional añadida a los listados |
| `keep-coding-instructions` | `false` | Mantener el prompt del harness cuando `true`; reemplazarlo cuando `false` (semántica Claude Code) |
| `force-for-plugin` | `false` | Aplicar incondicionalmente, sobrescribiendo cualquier selección de sesión; `force` es un alias, a lo sumo un estilo puede fijarlo |

Con `compatJson: true`, las entradas JSON `outputStyles` de Claude Code (`{ name, description, prompt }`) cargan junto a los estilos Markdown; las entradas no analizables se omiten con una advertencia.

## Renderer protocol

El protocolo `output.render.*` convierte la presentación en un punto de extensión. Un renderer es un **presenter puro** — `presenter(text, context)` mapea argumentos a datos de visualización, nunca toca el DOM — emparejado por nombre de herramienta y tipo de contenido, ordenado por prioridad.

- **Waterfall primero**: toda solicitud de render pasa por `output.render/before` (`{ text, context }`); los listeners deben llamar `next()`.
- **Rules**: `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nombra el renderer para solicitudes coincidentes; los empates se resuelven por `priority` y luego por orden de regla.
- **Built-ins**: `concise` (compactación de espacios + truncado por presupuesto) y `step-by-step` (numeración de pasos consistente).
- **Auditabilidad**: cada resultado de render lleva `{ original, rendered, rendererId, changed }`; el texto renderizado es lo que se muestra, el original sigue siendo reconstruible desde el registro de sesión.

## Web picker

La entrada `dsh.client` decora la invocación desnuda del comando `/style` con un selector emergente: una fila "off" más una fila por estilo de la librería (`description · whenToUse`), con la fila activa marcada. Elegir envía `/style <name>` a través del Remote de comandos, de modo que cada cambio conserva el ciclo de vida durable del comando host. El selector sigue el par de idiomas `zh`/`en` de la Web UI.

## Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| Archivos de estilo | `.claude/output-styles` en niveles usuario/proyecto/gestionado | directorios `stylesDir` + `styles/` integrados, gana el directorio posterior |
| Estilos personalizados | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | Mismos campos (`force-for-plugin` aceptado textualmente, `force` como alias) + `whenToUse` |
| JSON heredado | array `outputStyles` en `settings.json` | Cargado textualmente (`compatJson: true`) |
| Cuándo entra en vigor | Después de `/clear` o una sesión nueva | Inmediatamente — el prompt del sistema se reensambla por solicitud |
| Subagentes | Los estilos no se aplican | Igual — las sesiones de subagente conservan sus propios prompts |
| Cambio | menú `/config` o ajuste `outputStyle` (el comando `/output-style` se eliminó en v2.1.91) | comando `/style` + Web picker + campo `defaultStyle` en la página Plugins de la Web |

## Conflict check

Filtrado contra el ecosistema DSH antes del desarrollo (instantánea 2026-08): ningún repositorio `style`/`output-style` bajo [topic:dsh-plugin](https://github.com/topics/dsh-plugin), ninguna categoría de output-style en las cuatro principales [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), y ninguna entrada en el [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop). Los vecinos más cercanos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) y [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos de salida diferidos explícitamente a v0.2+) — son adyacentes, no conflictivos.

## Permissions & data

- **Permissions**: el manifiesto de workshop declara `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` y `settings:read`.
- **Data**: la elección de estilo vive en el dominio de almacenamiento `output_style` (indexada por sessionId); no se persiste otro estado, sin solicitudes de red.
- **Session log**: el nombre del estilo viene de `command/run`, el texto exacto inyectado de `system/message`; el marcador de procedencia `{ kind: 'dsh-output-styles' }` viaja en el registro del dominio.

## Security boundaries

- **Solo servicios públicos.** Contribuye `systemPrompt`, comandos, almacenamiento y settings; sin cambios en engine / agent-loop / apiproxy / UI oficial.
- **Visible para el modelo ⟺ registrado.** Todo lo que el modelo ve es reconstruible desde el registro de sesión — sin un nuevo tipo de evento de sesión, sin cambios en el agent-loop.
- **Original siempre conservado.** Cada render (y `/transcript`) conserva el texto original junto al renderizado; para la exportación HTML se usa HTML saneado.
- **Escrituras en disco controladas.** `/transcript --save` escribe solo después de que el servicio de aprobación lo conceda, y el contenido escrito pasa primero por la función pura `sanitizeText`; sin un servicio de aprobación o fs no escribe nada (fail-closed).

## Known limitations

- **Solo conversación principal.** Los estilos se aplican a la conversación principal; las sesiones de subagente conservan sus propios prompts (igual que Claude Code).
- **Truncado.** Los cuerpos de estilo más largos que `maxStyleChars` se truncan con un marcador.
- **Archivos omitidos.** Un archivo de estilo defectuoso se omite con una advertencia y nunca rompe el profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos proyectos tsc
pnpm test            # vitest — 148 tests
pnpm run verify      # typecheck + tests + self-contained (la puerta de prepublishOnly)
pnpm run build       # artefactos lib/ (bundles host + client)
pnpm pack            # tarball para dsh plugin add
```

Lanzamientos: empujar una etiqueta `v*` cuyo sufijo coincide con la versión de `package.json` dispara el workflow Publish — verificación completa y luego publicación a npm con procedencia.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor y mantenedor: arquitectura del plugin, librería de estilos, instalación de bundle, Web picker, documentación en cinco idiomas y herramientas de CI/lanzamiento.

## PerryLink DSH Plugin Family

This project is one of the **45 DeepSeek Harness plugins** maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default | |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command | |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | |
| **[dsh-catalog](https://github.com/PerryLink/dsh-catalog)** | DSH Desktop Market standard catalog source for the PerryLink family | |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence | |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore | |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. | |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search | |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) | |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review | |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. | |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds | |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval | |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` | |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools | |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. | |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. | |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers | |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer | |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors | |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool | |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. | |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching | |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit | |
| **[dsh-plugin-certification](https://github.com/PerryLink/dsh-plugin-certification)** | Community certification registry with repro-checkable grades and badges | |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins | |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill | |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins | |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card | |
| **[dsh-plugin-upgrade-015](https://github.com/PerryLink/dsh-plugin-upgrade-015)** | Merged `0.1.3-alpha.1` → `0.1.5-rc.1` upgrade corridor card plus a zero-dependency seam scanner | |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions | |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. | |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. | |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review | |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. | |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. | |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools | |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. | |


## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.
