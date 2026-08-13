<div align="center">

# 🎨 dsh-output-styles

**El equivalente de `outputStyles` de Claude Code para DeepSeek Harness** — cambia el estilo de salida del modelo en tiempo de ejecución, por sesión, de forma duradera.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/PerryLink/dsh-output-styles/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH](https://img.shields.io/badge/deepseek--harness-0.1.0--rc.6-4d6bfe.svg)](#)

🌐 [English](README.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

</div>

---

`/style concise` — y todas las respuestas siguientes serán concisas. `/style step-by-step` — y el modelo narrará pasos numerados. `/style off` — de vuelta al comportamiento por defecto. Un comando por sesión, persistente entre reinicios y sin tocar el bucle del agente.

## ✨ Características

- **Biblioteca de estilos**: `styles/*.md` (un archivo = un estilo). Frontmatter con `name` / `description` / `whenToUse`; el cuerpo es la directiva inyectada al modelo.
- **Comando `/style`**: sin argumentos lista los estilos y la selección actual; `/style <name>` cambia; `/style off` restaura el valor por defecto. Validación estricta de entrada.
- **Persistencia por sesión**: la elección vive en el dominio `output_style` de `ctx.storageDomain`, con clave sessionId y valor `{ style, source }`, donde `source` lleva el marcador `{ kind: 'plugin', plugin: 'dsh-output-styles' }`. Dos sesiones no interfieren y la elección sobrevive a los reinicios.
- **Inyección en el system prompt**: una sección `ctx.systemPrompt.section()` (orden 90, nombre `output-style:selection`) inyecta el cuerpo del estilo actual en cada ensamblado; los cuerpos se truncan según `maxStyleChars` (4000 caracteres por defecto) con un marcador en el corte.
- **Compatibilidad con Claude Code**: con `compatJson: true` (por defecto) carga colecciones `outputStyles` en JSON (`{ "name", "description", "prompt" }`) y las convierte al formato interno; los JSON ilegibles se omiten con aviso.
- **Proyección de sesión**: registra la unidad `style` (`{ options, currentValue }`) para la Web UI; el plegado solo refleja los cambios realmente aceptados.
- **Fallo ruidoso, omisión limpia**: la configuración incorrecta lanza al cargar; un archivo de estilo defectuoso se omite con un aviso y nunca rompe el perfil.

## 🚀 Inicio rápido

```sh
# 1. Instalar (los perfiles web funcionan tal cual; headless necesita las filas de storage)
dsh plugin --profile <name> add dsh-output-styles

# 2. Escribir la fila de activación (plugin cordis puro: el CLI solo instala la dependencia)
#    cordis.patch.yml del perfil:
- insert:
    - id: output-styles
      name: 'dsh-output-styles'

# 3. Arrancar y cambiar
dsh --profile <name>
/style               # → output style off (available: concise, step-by-step)
/style concise       # → switched to concise
```

> **Requisito: `ctx.storageDomain`.** El plugin declara `inject: ['storageDomain']`: sin la facilidad de dominios (`@deepseek-ai/dsh-storage-domain`) con un backend kv enrutado para `output_style`, el plugin permanece pendiente y se activa cuando aparecen las filas de storage. El perfil web compone `storage` + `storage-json` (`backend: json`) + `storage-domain`; los perfiles headless añaden las tres filas por su cuenta (ejemplo en [cordis.patch.yml](cordis.patch.yml)).

## 🎬 Demo

```
You > /style
      output style off (available: concise, step-by-step)

You > /style concise
      switched to concise

You > 请只用一句话介绍你自己。
AI  > 我是运行在 DeepSeek Harness 插件化平台上、基于 deepseek-v4-pro 模型的 AI 编码代理。
```

*(Ejecución headless real con deepseek-v4-pro; antes del cambio, el mismo prompt producía una respuesta larga con preámbulo. Transcripciones completas en [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md).)*

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

Todo lo que ve el modelo es reconstruible desde el log de sesión — sin nuevos tipos de eventos de sesión y sin tocar el bucle del agente. El nombre del estilo viene de `command/run`, el texto inyectado exacto de `request/header`, y el marcador de procedencia `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja en el registro del dominio.

## ⚙️ Configuración

Todo parámetro ajustable es un campo `Config` de Schemastery (los valores inválidos fallan al cargar):

| Campo | Defecto | Significado |
|---|---|---|
| `stylesDir` | `''` | Directorio de la biblioteca; `''` = el `styles/` del paquete, otros valores contra cwd. |
| `maxStyleChars` | `4000` | Presupuesto del cuerpo en caracteres (≥ 1); el exceso se trunca con marcador. |
| `defaultStyle` | `''` | Estilo de las sesiones que nunca eligieron uno; `''` = las sesiones nuevas no inyectan nada. |
| `compatJson` | `true` | Cargar entradas JSON `outputStyles` de Claude Code. |
| `sectionOrder` | `90` | Orden de la sección inyectada (0 = persona, 100–199 = guía de herramientas). |
| `truncationMarker` | `"\n\n[style truncated]"` | Marcador añadido en el punto de truncado. |

## 📚 Formato de la biblioteca

```markdown
---
name: concise
description: Terse, direct answers — minimal prose, no preamble.
whenToUse: Daily coding work, tool-heavy sessions, or when prompt length matters.
---

You are in the concise output style for this conversation.
- Lead with the direct answer; skip preamble, restatements, and filler.
```

JSON de Claude Code `outputStyles` (`compatJson: true`):

```json
{ "name": "explain", "description": "Explain like a teacher.", "prompt": "Teach in small steps." }
```

`name` debe ser kebab-case (`^[a-z][a-z0-9-]*$`); `off` es el objetivo de cambio reservado.

## ⌨️ Referencia de comandos

| Entrada | Resultado |
|---|---|
| `/style` | Lista estilos y selección actual |
| `/style concise` | Cambia (escritura duradera), `switched to concise` |
| `/style off` | Restaura el valor por defecto |
| `/style nope` | `error: unknown output style "nope" (available: …)` |

## 🔍 Verificación de conflictos (instantánea 2026-08)

Sin repositorios homónimos en [topic:dsh-plugin](https://github.com/topics/dsh-plugin), sin categoría de output-style en las principales [listas awesome](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), y sin entrada en el [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop) (189 entradas). Los vecinos más cercanos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) y [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos diferidos a v0.2+) — son adyacentes, no conflictivos.

## 🧪 Desarrollo

```sh
pnpm install
pnpm run typecheck
pnpm test            # vitest — 53 pruebas
pnpm run build
pnpm pack
```

Estructura según [omdsh-dev/plugin-template](https://github.com/omdsh-dev/plugin-template): `src/index.ts`, `src/config.ts`, `src/runtime.ts`, `src/invariant.ts`, `styles/`. Registro de verificación: [docs/VERIFICATION.zh.md](docs/VERIFICATION.zh.md).

## 📄 Licencia

[Apache-2.0](LICENSE) © 2026 dsh-output-styles contributors

---

<sub>Topics: `dsh` · `dsh-plugin` · `deepseek-harness` · `output-styles` · `claude-code`</sub>
