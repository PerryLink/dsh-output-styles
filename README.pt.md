<div align="center">

# 🎨 dsh-output-styles
- **Canal 1024 store**: `npm i -g dsh1024` uma vez, depois `dsh1024 plugin --profile web add dsh-output-styles` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

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
| Harness | DeepSeek Harness `0.1.1-rc.2` 0.1.2-alpha.3 (adaptado em 2026-09-01): o envelope de sessão mantém seu campo ignorable apenas para compatibilidade de leitura de logs armazenados - o Session.append ainda não consegue estampá-lo, então o comportamento da porta não muda. |
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
- **`/export`** — renderiza a sessão atual para Markdown ou HTML saneado pela pipeline de render; `--save <path>` escreve o documento saneado nessa rota de workspace após aprovação do usuário. Cada render mantém o texto original ao lado do renderizado.

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
| `enableExport` | `true` | Registrar o comando `/export` (exportação de sessão Markdown/HTML, ciente do renderer; `--save` escreve com aprovação) |
| `respectCoreOutputStyles` | `true` | Ao detectar um serviço core `outputStyles`, omitir a injeção de prompt deste plugin (manter hot-switch / rules / export) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | Lista estilos, alterna ou restaura o padrão do projeto |
| `/export` | command | Renderiza a sessão atual para Markdown ou HTML saneado; `--save` escreve com aprovação |
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
| `/export md` | Renderiza para Markdown (`md` é a forma abreviada de `markdown`) |
| `/export html` | Renderiza para HTML saneado |
| `/export --renderer=concise` | Renderiza forçando um renderer (regras ignoradas) |
| `/export md --save report.md` | Renderiza e então escreve o documento saneado em `report.md` após aprovação |

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

- **Permissions**: o manifesto de workshop declara `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` e `settings:read`.
- **Data**: a escolha de estilo vive no domínio de armazenamento `output_style` (indexada por sessionId); nenhum outro estado é persistido, sem solicitações de rede.
- **Session log**: o nome do estilo vem de `command/run`, o texto exato injetado de `request/header`; o marcador de procedência `{ kind: 'plugin', plugin: 'dsh-output-styles' }` viaja no registro do domínio.

## Security boundaries

- **Somente serviços públicos.** Contribui `systemPrompt`, comandos, armazenamento e settings; sem alterações em engine / agent-loop / apiproxy / UI oficial.
- **Visível para o modelo ⟺ registrado.** Tudo o que o modelo vê é reconstruível a partir do log de sessão — sem novo tipo de evento de sessão, sem alterações no agent-loop.
- **Original sempre conservado.** Cada render (e `/export`) mantém o texto original ao lado do renderizado; a exportação HTML usa HTML saneado.
- **Escritas em disco controladas.** `/export --save` escreve somente após o serviço de aprovação conceder, e o conteúdo escrito passa primeiro pela função pura `sanitizeText`; sem um serviço de aprovação ou fs, nada é escrito (fail-closed).

## Known limitations

- **Somente conversa principal.** Os estilos se aplicam à conversa principal; sessões de subagente mantêm seus próprios prompts (como no Claude Code).
- **Truncamento.** Corpos de estilo mais longos que `maxStyleChars` são truncados com um marcador.
- **Arquivos omitidos.** Um arquivo de estilo defeituoso é omitido com um aviso e nunca quebra o profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos os projetos tsc
pnpm test            # vitest — 127 tests
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

Este projeto é um dos [33 plugins de DeepSeek Harness](https://github.com/PerryLink) mantidos por [PerryLink](https://github.com/PerryLink). Se este ajuda você, os outros provavelmente também:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | Auto-revisão de segundo modelo na cadeia de aprovação, com falha fechada por padrão | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | Agentes filhos em segundo plano duráveis com barra lateral de UI web, mensagens e interrupção | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | Governança de custos para DeepSeek Harness: orçamentos, carbono e latência em um painel. | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Equivalente ao /rewind do Claude Code: instantâneos, bifurcações de sessão, restauração de uso único | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Migre sessões, memória, habilidades e CLAUDE.md do Claude Code para o DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | Controle de desktop nativo multiplataforma para DeepSeek Harness — Windows primeiro. | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | Histórico de entrada estilo terminal para o compositor web: setas, busca Ctrl+R | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | Verificações de qualidade de datasets e verificação de citações (a ponte numérica opcional consumida aqui) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | Defesa contra injeção de prompt, jailbreak e vazamento de segredos para DeepSeek Harness. | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | Guardião de disciplina de engenharia: sabatina de requisitos, portões de teste, revisão adversária | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | Roteamento unificado de geração de imagens estáticas para DeepSeek Harness. | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | Diagnóstico de desempenho só de leitura para DeepSeek Harness. | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | Relatórios de pesquisa deterministas para fundos mútuos públicos chineses | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | Integração de PR/issues do GitHub para o DSH, cada escrita controlada por aprovação | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | Orquestração de pesquisa setorial que sela as suas entregas através do `ctx.researchReport.assemble` deste plugin | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | Base de conhecimento documental local para DeepSeek Harness. | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | Integração de modelos locais (Ollama) para DeepSeek Harness. | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | Diagnósticos, formatação, autocompletar, ações de código e renomeação LSP sobre servidores de linguagem | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | Middleware de mascaramento de PII: anonimiza no limite do modelo, restaura na camada de exibição | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | Painel de tempo de execução MCP somente leitura: comando /mcp + aba Settings com status, ferramentas e erros | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | Memória entre sessões controlada por aprovação: costura ctx.memory + SQLite + ferramenta de memória | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | Exportador de observabilidade OpenTelemetry e Langfuse para DeepSeek Harness. | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Regras de permissão declarativas allow/deny/ask estilo Claude Code com auditoria | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | Base de conhecimento de desenvolvimento de plugins como habilidade de agente sob demanda | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | Motor de relatórios de pesquisa verificáveis com evidência endereçada por conteúdo | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | Pontuação de qualidade multidimensional para plugins de DeepSeek Harness. | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | Fixe sessões na barra lateral web com ordenação durável | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | Sincronização de sessões entre dispositivos para DeepSeek Harness — um espelho git dedicado do seu armazenamento de sessões. | |
| **[dsh-dsh-skill-pack-security](https://github.com/PerryLink/dsh-dsh-skill-pack-security)** | Pacote de habilidades de auditoria de segurança: varredura de segredos, revisão de dependências e cadeia de suprimentos | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | Loop de sessão com voz para DeepSeek Harness: fale e ouça a resposta. | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | Test drives isolados de instalação e smoke para plugins de DeepSeek Harness. | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | Tradução de parâmetros entre fornecedores e reparo determinístico de JSON para DeepSeek Harness. | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors
