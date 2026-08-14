<div align="center">

# 🎨 dsh-output-styles

**El `outputStyles` de Claude Code para DeepSeek Harness** — cambia el estilo de salida del modelo en tiempo de ejecución, por sesión y de forma duradera.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` — y todas las respuestas siguientes serán concisas. `/style step-by-step` — y el modelo narra pasos numerados. `/style off` — de vuelta al valor por defecto del proyecto. Un comando por sesión, persistente entre reinicios y con cero cambios en el bucle del agente.

## ✨ Características

| | |
|---|---|
| 🗂️ **Biblioteca de estilos** | Un archivo Markdown por estilo (`styles/*.md`); frontmatter para los metadatos, cuerpo = la directiva del modelo. `name` toma por defecto el nombre del archivo y puede contener espacios (`Diagrams first`). Se incluyen seis estilos integrados, entre ellos `proactive` y `learning`, en paridad con Claude Code. |
| ⌨️ **Comando `/style`** | Sin argumentos lista los estilos (con descripciones) + la selección actual; `/style <name>` cambia; `/style off` restaura el valor por defecto del proyecto. Todo el resto tras `/style` es el nombre del estilo. |
| 💾 **Persistencia por sesión** | La elección vive en el dominio de almacenamiento `output_style`, con clave sessionId: dos sesiones nunca interfieren y la elección sobrevive a los reinicios. |
| 🧩 **Inyección en el system prompt** | Una contribución `systemPrompt.section()` (orden 90) inyecta el cuerpo del estilo de la sesión actual en cada ensamblado; los cuerpos se truncan según un presupuesto configurable. |
| 🎭 **`keep-coding-instructions` de Claude Code** | Los estilos con `keep-coding-instructions: false` (el valor por defecto, como Claude Code) reemplazan todo el system prompt — para estilos que dejan atrás la ingeniería de software. |
| 📌 **Estilos forzados** | El campo `force-for-plugin` de Claude Code (alias `force`) aplica un estilo incondicionalmente, anulando cualquier selección de sesión; dos estilos forzados hacen fallar la carga. |
| 🔁 **Compatibilidad con Claude Code** | Carga colecciones JSON `outputStyles` (`{ name, description, prompt }`), entradas individuales o matrices estilo `settings.json`; las entradas no analizables se omiten con un aviso. |
| 📚 **Directorios en capas** | `stylesDir` es una lista; los directorios posteriores anulan los anteriores (el `styles/` incluido es la capa más baja; desactívalo con `includeBuiltins: false`). |
| 🔄 **Recarga en caliente** | Los cambios en los archivos de estilo se detectan sin reiniciar (`watchStyles: false` para desactivarlo). |
| ⚙️ **Valor por defecto del proyecto sobre ajustes** | Las sesiones que nunca eligieron uno recurren a `output-style.style` de los ajustes de DSH y, a continuación, a `defaultStyle`. |
| 🖱️ **Selector web** | Una entrada `dsh.client` (`dsh-output-styles/client`) decora el comando `/style` del host con un selector emergente basado en proyecciones. |
| 📊 **Proyección de sesión** | Una proyección `style` (`{ options, currentValue }`) para la Web UI, plegada a partir de los comandos asentados en el log de sesión. |
| 🧯 **Fallo ruidoso, omisión limpia** | La configuración incorrecta lanza al cargar; un archivo de estilo defectuoso se omite con un aviso y nunca rompe el perfil. |
| 🌐 **Documentación en cinco idiomas** | EN · 中文 · 日本語 · 한국어 · Español. |

## 🚀 Inicio rápido

```sh
# 1. Instalar — el paquete es una capa de bundle, así que un comando compone
#    storage + storage-json + storage-domain + la fila del plugin:
dsh plugin --profile <name> add dsh-output-styles

# 2. Arrancar y cambiar
dsh --profile <name>
/style               # → output style off y luego una línea por estilo
/style concise       # → switched to concise
/style Diagrams first  # → los nombres con espacios también funcionan
/style off           # → de vuelta al valor por defecto del proyecto
```

La capa es idempotente sobre los perfiles web (la inserción por id reemplaza las filas con el mismo id), que componen `storage` de fábrica. Para el selector web, añade la fila del cliente al perfil:

```yaml
- id: output-styles-client
  name: 'dsh-output-styles/client'
```

## 🎬 Demo

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

You > Preséntate en una sola frase.
AI  > Soy un agente de codificación de IA que se ejecuta sobre la plataforma de plugins DeepSeek Harness y se basa en el modelo deepseek-v4-pro.
```

## 🧠 Cómo funciona

```mermaid
flowchart LR
    U[Escribes /style concise] --> C[registro de comandos]
    C -->|command/run registrado| L[(log de sesión)]
    C -->|put {style, source}| D[(dominio output_style)]
    D --> R[OutputStyleRuntime]
    R -->|cuerpo en cada ensamblado| S[sección systemPrompt orden 90]
    S --> M[Petición al modelo]
    M -->|system prompt completo| H[request/header registrado]
```

Todo lo que ve el modelo es reconstruible desde el log de sesión — sin nuevos tipos de eventos de sesión ni cambios en el bucle del agente. El nombre del estilo viene de `command/run`, el texto inyectado exacto de `request/header`, y el marcador de procedencia `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja en el registro del dominio. Los estilos se aplican solo a la conversación principal; las sesiones de los subagentes mantienen sus propios prompts (igual que Claude Code).

## ⚙️ Configuración

Todo ajuste es un campo `Config` de Schemastery validado (los valores inválidos fallan la carga):

| Campo | Defecto | Significado |
|---|---|---|
| `stylesDir` | `[]` | Directorios de la biblioteca de estilos, resueltos contra cwd; las entradas posteriores anulan las anteriores. `[]` = solo el `styles/` incluido. Una cadena simple es una lista de un solo directorio. |
| `maxStyleChars` | `4000` | Presupuesto del cuerpo del estilo (puntos de código, ≥ 1); los cuerpos más largos se truncan con un marcador. |
| `defaultStyle` | `''` | Estilo para las sesiones que nunca eligieron uno (y no existe un valor por defecto en ajustes); `''` = sin estilo. |
| `compatJson` | `true` | Carga las entradas JSON `outputStyles` de Claude Code (objetos individuales o matrices). |
| `sectionOrder` | `90` | Orden de la sección inyectada (0 = persona, 100–199 = guía de herramientas). |
| `truncationMarker` | `"\n\n[style truncated]"` | Marcador añadido en el punto de truncado. |
| `includeBuiltins` | `true` | Incluye el `styles/` incluido en el paquete como la capa de menor prioridad. |
| `watchStyles` | `true` | Recarga la biblioteca cuando un archivo de estilo cambia en disco. |

## 📚 Biblioteca de estilos

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

Campos del frontmatter:

| Campo | Defecto | Significado |
|---|---|---|
| `name` | nombre del archivo | Objetivo del cambio; letras, dígitos, espacios y guiones (sin espacio inicial/final; `off` está reservado). |
| `description` | — (obligatorio) | Una frase mostrada en los listados y en el selector. |
| `whenToUse` | — | Guía opcional añadida a los listados. |
| `keep-coding-instructions` | `false` | Conserva el prompt del harness (identidad, persona, guía de herramientas) cuando es `true`; lo reemplaza por completo cuando es `false` (semántica de Claude Code). |
| `force-for-plugin` | `false` | Campo oficial de Claude Code: se aplica incondicionalmente, anulando cualquier selección de sesión; `force` es un alias y como máximo un estilo puede activarlo. |

<details>
<summary>JSON de Claude Code <code>outputStyles</code> (<code>compatJson: true</code>)</summary>

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

Las entradas aceptan `keep-coding-instructions` y `force-for-plugin` exactamente como los escribe Claude Code. Las matrices heredadas de `settings.json` (`[{ … }, { … }]`) se cargan tal cual; las entradas incorrectas se omiten con un aviso.

</details>

## ⌨️ Referencia de comandos

| Entrada | Resultado |
|---|---|
| `/style` | Lista la selección actual + una línea por estilo (nombre — descripción) |
| `/style concise` | Cambia (escritura duradera), `switched to concise` |
| `/style Diagrams first` | Los nombres de varias palabras son todo el resto |
| `/style off` | Restaura el valor por defecto del proyecto (valor por defecto de ajustes, luego `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🖱️ Selector web

La entrada `dsh.client` decora la invocación sin argumentos del comando `/style` del host con un selector emergente: una fila «off» más una fila por estilo de la biblioteca (`description · whenToUse`), con la fila activa marcada. Al elegir se envía `/style <name>` a través del Remote de comandos, de modo que cada cambio conserva el ciclo de vida duradero de comandos del host y la proyección `style` sigue siendo el único dato mostrado. Los textos del selector siguen el par de idiomas `zh`/`en` que incluye la Web UI.

## 🔍 Verificación de conflictos

Se contrastó con el ecosistema DSH antes del desarrollo (instantánea 2026-08): ningún repositorio `style`/`output-style` bajo [topic:dsh-plugin](https://github.com/topics/dsh-plugin), ninguna categoría de output-style en las cuatro [listas awesome](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) principales, y ninguna entrada en el [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop). Los vecinos más cercanos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) y [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos de salida diferidos explícitamente a v0.2+) — son adyacentes, no conflictivos.

## 🆚 Diferencias con Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| Archivos de estilo | `.claude/output-styles` en los niveles usuario/proyecto/gestionado | Directorios `stylesDir` + `styles/` incluido, gana el directorio posterior |
| Estilos personalizados | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | Los mismos campos (`force-for-plugin` aceptado literalmente, `force` como alias) + `whenToUse` |
| JSON heredado | Matriz `outputStyles` en `settings.json` | Se carga tal cual (`compatJson: true`) |
| Entrada en vigor | Tras `/clear` o una sesión nueva | Inmediatamente — el system prompt se reensambla en cada petición |
| Subagentes | Los estilos no se aplican | Igual — las sesiones de los subagentes mantienen sus propios prompts |
| Cambio | Menú `/config` o ajuste `outputStyle` (el comando `/output-style` se eliminó en v2.1.91) | Comando `/style` + selector web + ajustes `output-style.style` |

## 🧪 Desarrollo

```sh
pnpm install
pnpm run typecheck   # ambos proyectos tsc
pnpm test            # vitest — 92 pruebas
pnpm run build       # artefactos lib/ (bundles de host + cliente)
pnpm pack            # tarball para dsh plugin add
```

La estructura sigue [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template): `src/index.ts` (metadatos del plugin), `src/config.ts` (esquema), `src/runtime.ts` (servicio de runtime + activación), `src/invariant.ts` (invariantes), `src/client/` (selector web), `styles/` (estilos integrados).

## 📄 Licencia

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
