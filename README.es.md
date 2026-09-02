<div align="center">

# 🎨 dsh-output-styles
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-output-styles` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

**`outputStyles` de Claude Code para DeepSeek Harness**: cambia el estilo de salida del modelo en tiempo de ejecución, por sesión, de forma duradera.

*`/style concise` — y a partir de ahora toda respuesta es concisa. `/style off` — de vuelta al valor por defecto del proyecto.*

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
| Harness | DeepSeek Harness `0.1.2-alpha.5` (adaptado el 2026-09-02): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | Todas (host + cliente web) |
| Model | Cualquiera (inyección en el prompt del sistema) |

## What you get

`dsh-output-styles` es el equivalente de `outputStyles` de Claude Code para DeepSeek Harness: un comando `/style` que cambia el estilo de salida del modelo en tiempo de ejecución, persistido por sesión e inyectado en cada ensamblado del prompt.

- **Librería de estilos** — un archivo Markdown por estilo (`styles/*.md`); frontmatter para metadatos, cuerpo = la directiva del modelo. Seis estilos integrados (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), incluidos `proactive` y `learning` con paridad Claude Code.
- **Comando `/style`** — sin argumento lista los estilos (con descripciones) más la selección actual; `/style <name>` cambia; `/style off` restaura el valor por defecto del proyecto.
- **Persistencia por sesión** — la elección vive en el dominio de almacenamiento `output_style`, indexada por sessionId, y sobrevive a los reinicios.
- **Inyección en el prompt del sistema** — una contribución `systemPrompt.section()` (orden `sectionOrder`) inyecta el cuerpo del estilo actual en cada ensamblado, truncado a un presupuesto configurable.
- **Paridad Claude Code** — `keep-coding-instructions`, `force-for-plugin` (alias `force`), compatibilidad JSON `outputStyles`, directorios `stylesDir` por capas, recarga en caliente y fallback del proyecto sobre la costura de settings de DSH.
- **Registro de renderers (`output.render.*`)** — `ctx.outputRenderers` permite a cualquier plugin registrar un presenter puro, aplicado a través de la cascada `output.render/before`; renderers integrados `concise` y `step-by-step`.
- **Reglas por sesión/por herramienta** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nombran el renderer para solicitudes coincidentes; editables mediante la sección de settings `output-style-rules`.
- **`/export`** — renderiza la sesión actual a Markdown o HTML saneado a través de la tubería de render; `--save <path>` escribe el documento saneado en esa ruta de workspace tras la aprobación del usuario. Cada render conserva el texto original junto al renderizado.

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

Todo lo que el modelo ve es reconstruible desde el registro de sesión — sin un nuevo tipo de evento de sesión, sin cambios en el agent-loop. El nombre del estilo viene de `command/run`, el texto exacto inyectado de `request/header`, y el marcador de procedencia `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja en el registro del dominio. Los estilos se aplican solo a la conversación principal; las sesiones de subagente conservan sus propios prompts (igual que Claude Code).

## Install & uninstall

- **canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` — el script `prepare` compila solo con dependencias de producción.
- **canal npm** (versiones publicadas): `dsh plugin --profile web add dsh-output-styles`.
- **canal tarball**: `pnpm pack` en este repo, luego `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-output-styles`.

## Configuration

Todos los parámetros son campos Schemastery `Config` (modificables desde cordis.yml). Los valores inválidos fallan la carga.

| Key | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | Directorios de la librería, resueltos contra cwd; las entradas posteriores sobrescriben las anteriores. `[]` = solo los `styles/` integrados |
| `maxStyleChars` | `4000` | Presupuesto del cuerpo del estilo (≥ 1); los cuerpos más largos se truncan con un marcador |
| `defaultStyle` | `''` | Estilo para sesiones que nunca eligieron uno (y sin valor por defecto en settings); `''` = sin estilo |
| `compatJson` | `true` | Cargar entradas JSON `outputStyles` de Claude Code (objetos sueltos o arrays) |
| `sectionOrder` | `90` | Orden de la sección inyectada (0 = persona, 100–199 = guía de herramientas) |
| `truncationMarker` | `"\n\n[style truncated]"` | Marcador añadido en el punto de truncado |
| `includeBuiltins` | `true` | Incluir los `styles/` del paquete como capa de menor prioridad |
| `watchStyles` | `true` | Recargar la librería cuando un archivo de estilo cambia en disco |
| `rules` | `[]` | Reglas de render por sesión/herramienta: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | Registrar el comando `/export` (exportación de sesión Markdown/HTML, consciente del renderer; `--save` escribe con aprobación) |
| `respectCoreOutputStyles` | `true` | Al detectar un servicio core `outputStyles`, omitir la inyección de prompt de este plugin (mantener hot-switch / rules / export) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | Lista estilos, cambia o restaura el valor por defecto del proyecto |
| `/export` | command | Renderiza la sesión actual a Markdown o HTML saneado; `--save` escribe con aprobación |
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
| `/export` | Renderiza la sesión actual a Markdown a través de la pipeline de render |
| `/export md` | Renderiza a Markdown (`md` es la forma abreviada de `markdown`) |
| `/export html` | Renderiza a HTML saneado |
| `/export --renderer=concise` | Renderiza forzando un renderer (reglas omitidas) |
| `/export md --save report.md` | Renderiza y luego escribe el documento saneado en `report.md` tras la aprobación |

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
| Cambio | menú `/config` o ajuste `outputStyle` (el comando `/output-style` se eliminó en v2.1.91) | comando `/style` + Web picker + settings `output-style.style` |

## Conflict check

Filtrado contra el ecosistema DSH antes del desarrollo (instantánea 2026-08): ningún repositorio `style`/`output-style` bajo [topic:dsh-plugin](https://github.com/topics/dsh-plugin), ninguna categoría de output-style en las cuatro principales [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), y ninguna entrada en el [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop). Los vecinos más cercanos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) y [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos de salida diferidos explícitamente a v0.2+) — son adyacentes, no conflictivos.

## Permissions & data

- **Permissions**: el manifiesto de workshop declara `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` y `settings:read`.
- **Data**: la elección de estilo vive en el dominio de almacenamiento `output_style` (indexada por sessionId); no se persiste otro estado, sin solicitudes de red.
- **Session log**: el nombre del estilo viene de `command/run`, el texto exacto inyectado de `request/header`; el marcador de procedencia `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja en el registro del dominio.

## Security boundaries

- **Solo servicios públicos.** Contribuye `systemPrompt`, comandos, almacenamiento y settings; sin cambios en engine / agent-loop / apiproxy / UI oficial.
- **Visible para el modelo ⟺ registrado.** Todo lo que el modelo ve es reconstruible desde el registro de sesión — sin un nuevo tipo de evento de sesión, sin cambios en el agent-loop.
- **Original siempre conservado.** Cada render (y `/export`) conserva el texto original junto al renderizado; para la exportación HTML se usa HTML saneado.
- **Escrituras en disco controladas.** `/export --save` escribe solo después de que el servicio de aprobación lo conceda, y el contenido escrito pasa primero por la función pura `sanitizeText`; sin un servicio de aprobación o fs no escribe nada (fail-closed).

## Known limitations

- **Solo conversación principal.** Los estilos se aplican a la conversación principal; las sesiones de subagente conservan sus propios prompts (igual que Claude Code).
- **Truncado.** Los cuerpos de estilo más largos que `maxStyleChars` se truncan con un marcador.
- **Archivos omitidos.** Un archivo de estilo defectuoso se omite con una advertencia y nunca rompe el profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos proyectos tsc
pnpm test            # vitest — 127 tests
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

Este proyecto es uno de los [33 complementos de DeepSeek Harness](https://github.com/PerryLink) mantenidos por [PerryLink](https://github.com/PerryLink). Si este te ayuda, probablemente los demás también:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | Auto-revisión de segundo modelo en la cadena de aprobación, con cierre en fallo por defecto | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | Agentes hijos en segundo plano durables con barra lateral de UI web, mensajería e interrupción | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | Gobernanza de costes para DeepSeek Harness: presupuestos, carbono y latencia en un panel. | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Equivalente a /rewind de Claude Code: instantáneas, bifurcaciones de sesión, restauración de un solo uso | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Migra sesiones, memoria, habilidades y CLAUDE.md de Claude Code a DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | Control de escritorio nativo multiplataforma para DeepSeek Harness — Windows primero. | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | Historial de entrada estilo terminal para el compositor web: flechas, búsqueda Ctrl+R | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | Comprobaciones de calidad de datasets y verificación de citas (el puente numérico opcional consumido aquí) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | Defensa contra inyección de prompts, jailbreak y fuga de secretos para DeepSeek Harness. | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | Guardián de disciplina de ingeniería: interrogatorio de requisitos, puertas de pruebas, revisión adversaria | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | Enrutamiento unificado de generación de imágenes estáticas para DeepSeek Harness. | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | Diagnóstico de rendimiento de solo lectura para DeepSeek Harness. | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | Informes de investigación deterministas para fondos mutuos públicos chinos | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | Integración de PR/issues de GitHub para DSH, cada escritura controlada por aprobación | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | Orquestación de investigación sectorial que sella sus entregables mediante el `ctx.researchReport.assemble` de este plugin | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | Base de conocimiento documental local para DeepSeek Harness. | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | Integración de modelos locales (Ollama) para DeepSeek Harness. | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | Diagnósticos, formato, autocompletado, acciones de código y renombrado LSP sobre servidores de lenguaje | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | Middleware de enmascaramiento de PII: anonimiza en el límite del modelo, restaura en la capa de visualización | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | Panel de tiempo de ejecución MCP de solo lectura: comando /mcp + pestaña Settings con estado, herramientas y errores | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | Memoria entre sesiones controlada por aprobación: costura ctx.memory + SQLite + herramienta de memoria | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | Exportador de observabilidad OpenTelemetry y Langfuse para DeepSeek Harness. | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Reglas de permisos declarativas allow/deny/ask estilo Claude Code con auditoría | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | Base de conocimiento de desarrollo de plugins como habilidad de agente bajo demanda | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | Motor de informes de investigación verificables con evidencia direccionada por contenido | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | Puntuación de calidad multidimensional para plugins de DeepSeek Harness. | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | Fija sesiones en la barra lateral web con orden durable | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | Sincronización de sesiones entre dispositivos para DeepSeek Harness — un espejo git dedicado de tu almacén de sesiones. | |
| **[dsh-dsh-skill-pack-security](https://github.com/PerryLink/dsh-dsh-skill-pack-security)** | Paquete de habilidades de auditoría de seguridad: escaneo de secretos, revisión de dependencias y cadena de suministro | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | Bucle de sesión con voz para DeepSeek Harness: háblale y escucha su respuesta. | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | Pruebas de instalación y humo aisladas para plugins de DeepSeek Harness. | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | Traducción de parámetros entre proveedores y reparación determinista de JSON para DeepSeek Harness. | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
