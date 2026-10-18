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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-output-styles?metric=downloads&lang=es)](https://dshfind.com/es/plugins/PerryLink/dsh-output-styles?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-output-styles
```


</div>

---


**📖 Base de conocimiento del ecosistema** — datos medidos, no marketing: [guía de desarrollo · datos de selección · criterios de mantenimiento](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

- **canal git** (último `main`): `dsh plugin --profile web add github:PerryLink/dsh-output-styles` — el script `prepare` compila solo con dependencias de producción.
- **canal npm** (versiones publicadas): `dsh plugin --profile web add dsh-output-styles`.
- **canal tarball**: `pnpm pack` en este repo, luego `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-output-styles`.

## ⭐ 如果它帮到了你

Este plugin forma parte de la [familia de plugins DSH](https://github.com/PerryLink) (más de 40, todos Apache-2.0). Si te resulta útil, **dale una estrella**: no desbloquea nada, pero ayuda a que la siguiente persona lo encuentre antes.

*English:* part of a 95 plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-output-styles?

`/style concise` — y a partir de ahora toda respuesta es concisa. `/style off` — de vuelta al valor por defecto del proyecto.

![Demostración de terminal de dsh-output-styles: dsh-output-styles — /style lists, then switches at runtime](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-hero.png)

![Animated terminal demo of dsh-output-styles](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-demo.gif)

*La misma ejecución, animada.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-rc.2` (adaptado el 2026-09-09): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. Verificado el 2026-09-11 contra el checkout master dsh-v0.1.7-alpha.1 (cadena de puertas completa + smoke de instalación del perfil). |
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
dsh plugin --profile web add github:PerryLink/dsh-output-styles
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-output-styles

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

- **Coexistencia con el core.** Si aparece una capacidad `outputStyles` de primera parte, este plugin detecta su servicio `outputStyles` y degrada a la superficie incremental (hot-switch, rules, `/transcript`) dejando la inyección del prompt al core — ver [`docs/COEXISTENCE.md`](docs/COEXISTENCE.md) y las funciones exportadas `detectCoreOutputStyles` / `coexistenceReport`. **El modo degradado se declara donde se ve**: cada respuesta de `/style <estilo>` y `/style off` lleva una nota `degraded coexistence mode`, y la proyección de sesión `style` expone `promptInjection: 'enabled' | 'disabled'`, así que ninguna superficie insinúa que el estilo está en vigor cuando no lo está. (Antes de 0.7.0 el único rastro era una línea `ctx.logger.info`, que nunca llega a la transcripción.)
- **Solo conversación principal.** Los estilos se aplican a la conversación principal; las sesiones de subagente conservan sus propios prompts (igual que Claude Code).
- **Truncado.** Los cuerpos de estilo más largos que `maxStyleChars` se truncan con un marcador.
- **Archivos omitidos.** Un archivo de estilo defectuoso se omite con una advertencia y nunca rompe el profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos proyectos tsc
pnpm test            # vitest — 156 tests
pnpm run verify      # typecheck + tests + self-contained (la puerta de prepublishOnly)
pnpm run build       # artefactos lib/ (bundles host + client)
pnpm pack            # tarball para dsh plugin add
```

Lanzamientos: empujar una etiqueta `v*` cuyo sufijo coincide con la versión de `package.json` dispara el workflow Publish — verificación completa y luego publicación a npm con procedencia.

## Interoperability with other DSH plugins

Verificado contra **DSH `0.2.0-rc.2`** (el runtime para el que se publica este README) y el conjunto de plugins con más estrellas sondeado el 2026-10-05.

Este plugin **no interfiere** con otros plugins, incluidos los de más estrellas:

- **Sin colisión de nombres de herramienta.** Todas las herramientas llevan espacio de nombres; ninguna ocupa un nombre desnudo ya perteneciente a una herramienta incluida u otro plugin.
- **Sin colisión de clave de servicio.** Solo provee `outputRenderers`; esa clave no es una costura incluida ni la provee ningún plugin de más estrellas.
- **Sin colisión de slot.** No registra ninguna clave de slot de cliente, así que no disputa un asiento `shadows-shipped-ui`.
- **Sin colisión de ruta HTTP.** No registra ningún prefijo `webServer`.
- **Sin colisión en la capa de patch.** El patch del bundle solo hace `insert` de su propia fila; nunca sobrescribe el `config` de una fila incluida.
- **Sin mutación global.** No parchea prototipos, ni reescribe `process.env`, ni reemplaza el dispatcher global de fetch.

**Los listeners de eventos compartidos no interfieren por construcción.** Observa los eventos sensibles al orden `system-prompt/assemble` con `ctx.on()` — el registro de difusión de Cordis, donde cada listener se ejecuta y ninguno puede dejar sin turno a otro. **Todos los listeners aquí delegan por `next()`**, así que la cadena nunca se cortocircuita:
  - `system-prompt/assemble` — also used by `dsh-routing-suite` (7000★, 13 listeners).

Evidencia estática: `dsh-plugin-doctor` K10–K13 dan `pass` en todas las comprobaciones de este repositorio.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor y mantenedor: arquitectura del plugin, librería de estilos, instalación de bundle, Web picker, documentación en cinco idiomas y herramientas de CI/lanzamiento.

## PerryLink DSH Plugin Family

Este proyecto es uno de los **87 plugins activamente mantenidos** de DeepSeek Harness de [PerryLink](https://github.com/PerryLink). El registro familiar tiene **95** plugins — **5 congelados**, **3 retirados** — y permanece plegado abajo para que cada README conserve una primera pantalla corta. Expándelo para ver cada fila, con el motivo en la columna Estado.

<details>
<summary>Expandir los 95 plugins</summary>

| Plugin | Una línea | Estado |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.
