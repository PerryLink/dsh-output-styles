<div align="center">

# 🎨 dsh-output-styles

**O `outputStyles` do Claude Code para o DeepSeek Harness**: alterne o estilo de saída do modelo em tempo de execução, por sessão, de forma durável.

*`/style concise` — e a partir de agora toda resposta é concisa. `/style off` — de volta ao padrão do projeto.*

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
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | Todas (host + cliente web) |
| Model | Qualquer (injeção no prompt do sistema) |

## What you get

O `dsh-output-styles` é o equivalente do `outputStyles` do Claude Code para o DeepSeek Harness: um comando `/style` que alterna o estilo de saída do modelo em tempo de execução, persistido por sessão e injetado a cada montagem do prompt.

- **Biblioteca de estilos** — um arquivo Markdown por estilo (`styles/*.md`); frontmatter para metadados, corpo = a diretiva do modelo. Seis estilos integrados (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), incluindo `proactive` e `learning` com paridade Claude Code.
- **Comando `/style`** — sem argumento lista os estilos (com descrições) e a seleção atual; `/style <name>` alterna; `/style off` restaura o padrão do projeto.
- **Persistência por sessão** — a escolha vive no domínio de armazenamento `output_style`, indexada por sessionId, e sobrevive a reinícios.
- **Injeção no prompt do sistema** — uma contribuição `systemPrompt.section()` (ordem `sectionOrder`) injeta o corpo do estilo atual a cada montagem, truncado em um orçamento configurável.
- **Paridade Claude Code** — `keep-coding-instructions`, `force-for-plugin` (alias `force`), compatibilidade JSON `outputStyles`, diretórios `stylesDir` em camadas, recarga a quente e fallback do projeto sobre a costura de settings do DSH.
- **Registro de renderers (`output.render.*`)** — `ctx.outputRenderers` permite a qualquer plugin registrar um presenter puro, aplicado pela cascata `output.render/before`; renderers integrados `concise` e `step-by-step`.
- **Regras por sessão/por ferramenta** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nomeiam o renderer para solicitações coincidentes; editáveis pela seção de settings `output-style-rules`.
- **`/export`** — renderiza a sessão atual para Markdown ou HTML saneado pela pipeline de render; cada render mantém o texto original ao lado do renderizado.

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

Tudo o que o modelo vê é reconstruível a partir do log de sessão — sem novo tipo de evento de sessão, sem alterações no agent-loop. O nome do estilo vem de `command/run`, o texto exato injetado de `request/header`, e o marcador de procedência `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja no registro do domínio. Os estilos se aplicam apenas à conversa principal; sessões de subagente mantêm seus próprios prompts (como no Claude Code).

## Install & uninstall

- **canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` — o script `prepare` compila apenas com dependências de produção.
- **canal npm** (versões publicadas): `dsh plugin --profile web add dsh-output-styles`.
- **canal tarball**: `pnpm pack` neste repo, depois `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-output-styles`.

## Configuration

Todos os parâmetros são campos Schemastery `Config` (alteráveis pelo cordis.yml). Valores inválidos falham a carga.

| Key | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | Diretórios da biblioteca, resolvidos contra o cwd; entradas posteriores sobrescrevem as anteriores. `[]` = somente os `styles/` integrados |
| `maxStyleChars` | `4000` | Orçamento do corpo do estilo (≥ 1); corpos mais longos são truncados com um marcador |
| `defaultStyle` | `''` | Estilo para sessões que nunca escolheram um (e sem padrão em settings); `''` = sem estilo |
| `compatJson` | `true` | Carregar entradas JSON `outputStyles` do Claude Code (objetos avulsos ou arrays) |
| `sectionOrder` | `90` | Ordem da seção injetada (0 = persona, 100–199 = guia de ferramentas) |
| `truncationMarker` | `"\n\n[style truncated]"` | Marcador anexado no ponto de truncamento |
| `includeBuiltins` | `true` | Incluir os `styles/` do pacote como camada de menor prioridade |
| `watchStyles` | `true` | Recarregar a biblioteca quando um arquivo de estilo muda em disco |
| `rules` | `[]` | Regras de render por sessão/ferramenta: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | Registrar o comando `/export` (exportação de sessão Markdown/HTML, ciente do renderer) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | Lista estilos, alterna ou restaura o padrão do projeto |
| `/export` | command | Renderiza a sessão atual para Markdown ou HTML saneado |
| `output_style` | storage domain | Escolha de estilo por sessão, indexada por sessionId |
| `systemPrompt.section()` | contribution | Injeta o corpo do estilo atual a cada montagem |
| `output.render.*` | renderer registry | `ctx.outputRenderers` + a cascata `output.render/before` |
| `style` | projection | `{ options, currentValue }` dobrado a partir de comandos assentados |
| Web picker | client entry | `dsh-output-styles/client` decora `/style` com um seletor pop-up |

## Command reference

| Input | Outcome |
|---|---|
| `/style` | Lista a seleção atual + uma linha por estilo (nome — descrição) |
| `/style concise` | Alterna (escrita durável), `switched to concise` |
| `/style Diagrams first` | Nomes com várias palavras são o restante inteiro |
| `/style off` | Restaura o padrão do projeto (default de settings, depois `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |
| `/export` | Renderiza a sessão atual para Markdown pela pipeline de render |
| `/export html` | Renderiza para HTML saneado |
| `/export --renderer=concise` | Renderiza forçando um renderer (regras ignoradas) |

## Style library

Um arquivo Markdown por estilo; frontmatter para metadados, corpo = a diretiva do modelo. `name` toma por padrão o nome do arquivo e pode conter espaços (`Diagrams first`).

| Field | Default | Meaning |
|---|---|---|
| `name` | nome do arquivo | Alvo da alternância; letras, dígitos, espaços e hífens (`off` é reservado) |
| `description` | — (obrigatório) | Uma frase exibida nas listagens e no seletor |
| `whenToUse` | — | Orientação opcional anexada às listagens |
| `keep-coding-instructions` | `false` | Manter o prompt do harness quando `true`; substituí-lo quando `false` (semântica Claude Code) |
| `force-for-plugin` | `false` | Aplicar incondicionalmente, sobrescrevendo qualquer seleção de sessão; `force` é um alias, no máximo um estilo pode defini-lo |

Com `compatJson: true`, entradas JSON `outputStyles` do Claude Code (`{ name, description, prompt }`) carregam ao lado dos estilos Markdown; entradas não analisáveis são omitidas com um aviso.

## Renderer protocol

O protocolo `output.render.*` transforma a apresentação em um ponto de extensão. Um renderer é um **presenter puro** — `presenter(text, context)` mapeia argumentos para dados de exibição, nunca toca o DOM — emparelhado por nome de ferramenta e tipo de conteúdo, ordenado por prioridade.

- **Waterfall primeiro**: toda solicitação de render passa por `output.render/before` (`{ text, context }`); os listeners devem chamar `next()`.
- **Rules**: `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nomeia o renderer para solicitações coincidentes; empates se resolvem por `priority` e depois pela ordem da regra.
- **Built-ins**: `concise` (compactação de espaços + truncamento por orçamento) e `step-by-step` (numeração de passos consistente).
- **Auditabilidade**: cada resultado de render carrega `{ original, rendered, rendererId, changed }`; o texto renderizado é o que aparece, o original permanece reconstruível a partir do log de sessão.

## Web picker

A entrada `dsh.client` decora a invocação nua do comando `/style` com um seletor pop-up: uma linha "off" mais uma linha por estilo da biblioteca (`description · whenToUse`), com a linha ativa marcada. Escolher envia `/style <name>` pelo Remote de comandos, de modo que cada alternância mantém o ciclo de vida durável do comando host. O seletor segue o par de idiomas `zh`/`en` da Web UI.

## Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| Arquivos de estilo | `.claude/output-styles` em níveis usuário/projeto/gerenciado | diretórios `stylesDir` + `styles/` integrados, vence o diretório posterior |
| Estilos personalizados | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | Mesmos campos (`force-for-plugin` aceito textualmente, `force` como alias) + `whenToUse` |
| JSON legado | array `outputStyles` em `settings.json` | Carregado textualmente (`compatJson: true`) |
| Quando entra em vigor | Após `/clear` ou uma sessão nova | Imediatamente — o prompt do sistema se remonta por solicitação |
| Subagentes | Estilos não se aplicam | Igual — sessões de subagente mantêm seus próprios prompts |
| Alternância | menu `/config` ou ajuste `outputStyle` (o comando `/output-style` foi removido na v2.1.91) | comando `/style` + Web picker + settings `output-style.style` |

## Conflict check

Filtrado contra o ecossistema DSH antes do desenvolvimento (instantânea 2026-08): nenhum repositório `style`/`output-style` sob [topic:dsh-plugin](https://github.com/topics/dsh-plugin), nenhuma categoria de output-style nas quatro principais [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), e nenhuma entrada no [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop). Os vizinhos mais próximos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) e [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos de saída diferidos explicitamente para v0.2+) — são adjacentes, não conflitantes.

## Permissions & data

- **Permissions**: o manifesto de workshop declara `fs:read`, `fs:watch`, `storage:read`, `storage:write` e `settings:read`.
- **Data**: a escolha de estilo vive no domínio de armazenamento `output_style` (indexada por sessionId); nenhum outro estado é persistido, sem solicitações de rede.
- **Session log**: o nome do estilo vem de `command/run`, o texto exato injetado de `request/header`; o marcador de procedência `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja no registro do domínio.

## Security boundaries

- **Somente serviços públicos.** Contribui `systemPrompt`, comandos, armazenamento e settings; sem alterações em engine / agent-loop / apiproxy / UI oficial.
- **Visível para o modelo ⟺ registrado.** Tudo o que o modelo vê é reconstruível a partir do log de sessão — sem novo tipo de evento de sessão, sem alterações no agent-loop.
- **Original sempre conservado.** Cada render (e `/export`) mantém o texto original ao lado do renderizado; a exportação HTML usa HTML saneado.

## Known limitations

- **Somente conversa principal.** Os estilos se aplicam à conversa principal; sessões de subagente mantêm seus próprios prompts (como no Claude Code).
- **Truncamento.** Corpos de estilo mais longos que `maxStyleChars` são truncados com um marcador.
- **Arquivos omitidos.** Um arquivo de estilo defeituoso é omitido com um aviso e nunca quebra o profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos os projetos tsc
pnpm test            # vitest — 107 tests
pnpm run verify      # typecheck + tests + self-contained (a porta de prepublishOnly)
pnpm run build       # artefatos lib/ (bundles host + client)
pnpm pack            # tarball para dsh plugin add
```

Lançamentos: empurrar uma etiqueta `v*` cujo sufixo coincide com a versão de `package.json` dispara o workflow Publish — verificação completa e depois publicação no npm com procedência.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor e mantenedor: arquitetura do plugin, biblioteca de estilos, instalação de bundle, Web picker, documentação em cinco idiomas e ferramentas de CI/lançamento.

## PerryLink DSH Plugin Family

Este projeto é um dos [15 plugins do DeepSeek Harness](https://github.com/PerryLink) mantidos por [PerryLink](https://github.com/PerryLink). Se este te ajuda, os demais provavelmente também:

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents with a Web UI sidebar, messaging and interrupt |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions and rename over language servers |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code-style declarative allow/deny/ask permission rules with audit |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed by default |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | Security-audit skill pack: secret scan, dependency and supply-chain review |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| [dsh-composer-history](https://github.com/PerryLink/dsh-composer-history) | Terminal-style input history for the web composer: arrows, Ctrl+R search |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issues integration for DSH, every write gated by approval |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
