<div align="center">

# 🎨 dsh-output-styles
- **Canal 1024 store**: `npm i -g dsh1024` uma vez, depois `dsh1024 plugin --profile web add dsh-output-styles` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

**O `outputStyles` do Claude Code para o DeepSeek Harness**: alterne o estilo de saída do modelo em tempo de execução, por sessão, de forma durável.

*`/style concise` — e a partir de agora toda resposta é concisa. `/style off` — de volta ao padrão do projeto.*

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-output-styles?metric=downloads&lang=pt)](https://dshfind.com/pt/plugins/PerryLink/dsh-output-styles?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-output-styles
```


</div>

---


**📖 Base de conhecimento do ecossistema** — dados medidos, não marketing: [guia de desenvolvimento · dados de seleção · critérios de manutenção](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

- **canal git** (último `main`): `dsh plugin --profile web add github:PerryLink/dsh-output-styles` — o script `prepare` compila apenas com dependências de produção.
- **canal npm** (versões publicadas): `dsh plugin --profile web add dsh-output-styles`.
- **canal tarball**: `pnpm pack` neste repo, depois `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-output-styles`.

## ⭐ 如果它帮到了你

Este plugin faz parte da [família de plugins DSH](https://github.com/PerryLink) (mais de 40, todos Apache-2.0). Se for útil, **deixe uma estrela**: não desbloqueia nada, mas ajuda a próxima pessoa a encontrá-lo.

*English:* part of a 40+ plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-output-styles?

`/style concise` — e a partir de agora toda resposta é concisa. `/style off` — de volta ao padrão do projeto.

![Demonstração de terminal do dsh-output-styles: dsh-output-styles — /style lists, then switches at runtime](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-hero.png)

![Animated terminal demo of dsh-output-styles](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-demo.gif)

*A mesma execução, animada.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-rc.2` (adaptado em 2026-09-09): o envelope de sessão mantém seu campo ignorable apenas para compatibilidade de leitura de logs armazenados - o Session.append ainda não consegue estampá-lo, então o comportamento da porta não muda. Verificado em 2026-09-11 contra o checkout master dsh-v0.1.7-alpha.1 (cadeia de portas completa + smoke de instalação do perfil). |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | Todas (host + cliente web) |
| Model | Qualquer (injeção no prompt do sistema) |

## What you get

O `dsh-output-styles` é o equivalente do `outputStyles` do Claude Code para o DeepSeek Harness: um comando `/style` que alterna o estilo de saída do modelo em tempo de execução, persistido por sessão e injetado a cada montagem do prompt.

- **Biblioteca de estilos** — um arquivo Markdown por estilo (`styles/*.md`); frontmatter para metadados, corpo = a diretiva do modelo. Seis estilos integrados (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), incluindo `proactive` e `learning` com paridade Claude Code.
- **Comando `/style`** — sem argumento lista os estilos (com descrições) e a seleção atual; `/style <name>` alterna; `/style off` restaura o padrão do projeto.
- **Persistência por sessão** — a escolha vive no domínio de armazenamento `output_style`, indexada por sessionId, e sobrevive a reinícios.
- **Injeção no prompt do sistema** — uma contribuição `systemPrompt.section()` (ordem `sectionOrder`) injeta o corpo do estilo atual a cada montagem, truncado em um orçamento configurável.
- **Paridade Claude Code** — `keep-coding-instructions`, `force-for-plugin` (alias `force`), compatibilidade JSON `outputStyles`, diretórios `stylesDir` em camadas, recarga a quente e um fallback do projeto editável ao vivo pela página **Plugins** da Web.
- **Registro de renderers (`output.render.*`)** — `ctx.outputRenderers` permite a qualquer plugin registrar um presenter puro, aplicado pela cascata `output.render/before`; renderers integrados `concise` e `step-by-step`.
- **Regras por sessão/por ferramenta** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` nomeiam o renderer para solicitações coincidentes; editáveis ao vivo pela página **Plugins** da Web.
- **`/transcript`** — renderiza a sessão atual para Markdown ou HTML saneado pela pipeline de render; `--save <path>` escreve o documento saneado nessa rota de workspace após aprovação do usuário. Cada render mantém o texto original ao lado do renderizado.

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

Tudo o que o modelo vê é reconstruível a partir do log de sessão — sem novo tipo de evento de sessão, sem alterações no agent-loop. O nome do estilo vem de `command/run`, o texto exato injetado de `system/message`, e o marcador de procedência `{ kind: 'dsh-output-styles' }` viaja no registro do domínio. Os estilos se aplicam apenas à conversa principal; sessões de subagente mantêm seus próprios prompts (como no Claude Code).

## Configuration

Todos os parâmetros são campos Schemastery `Config` (alteráveis pelo cordis.yml). Valores inválidos falham a carga.

`defaultStyle` e `rules` são declarados `volatile()`, então em um host que compõe a costura de formulários de settings eles são **campos vivos, editáveis na Web**: edite-os em **Plugins → dsh-output-styles** na interface Web e o plugin em execução adota o novo valor sem remontar. Todos os outros campos continuam apenas de composição e exigem uma recarga. Um valor confirmado é validado antes de ser aplicado — se for inválido é rejeitado e os valores em execução não mudam.

| Key | Default | Editável na Web | Meaning |
|---|---|---|---|
| `stylesDir` | `[]` | Não | Diretórios da biblioteca, resolvidos contra o cwd; entradas posteriores sobrescrevem as anteriores. `[]` = somente os `styles/` integrados |
| `maxStyleChars` | `4000` | Não | Orçamento do corpo do estilo (≥ 1); corpos mais longos são truncados com um marcador |
| `defaultStyle` | `''` | **Sim** | Estilo para sessões que nunca escolheram um; `''` = sem estilo. Um nome que não está na biblioteca viva é recusado em vez de injetado |
| `compatJson` | `true` | Não | Carregar entradas JSON `outputStyles` do Claude Code (objetos avulsos ou arrays) |
| `sectionOrder` | `90` | Não | Ordem da seção injetada (0 = persona, 100–199 = guia de ferramentas) |
| `truncationMarker` | `"\n\n[style truncated]"` | Não | Marcador anexado no ponto de truncamento |
| `includeBuiltins` | `true` | Não | Incluir os `styles/` do pacote como camada de menor prioridade |
| `watchStyles` | `true` | Não | Recarregar a biblioteca quando um arquivo de estilo muda em disco |
| `rules` | `[]` | **Sim** | Regras de render por sessão/ferramenta: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | Não | Registrar o comando `/transcript` (exportação de sessão Markdown/HTML, ciente do renderer; `--save` escreve com aprovação) |
| `respectCoreOutputStyles` | `true` | Não | Ao detectar um serviço core `outputStyles`, omitir a injeção de prompt deste plugin (manter hot-switch / rules / export) |

**Migração de 0.1.6 ou anterior.** Essas versões mantinham duas seções de settings próprias do plugin, `output-style` (`style`) e `output-style-rules` (`rules`). O host 0.1.7 removeu a API sobre a qual elas foram construídas, então ambas as seções deixaram de existir. Mova qualquer valor que você tinha ali para o campo `Config` correspondente — `output-style.style` → `defaultStyle`, `output-style-rules.rules` → `rules` — no patch do seu perfil (`cordis.yml`), ou defina-o na página Plugins. As escolhas por sessão feitas com `/style` não são afetadas: elas vivem no domínio de armazenamento `output_style`.

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | Lista estilos, alterna ou restaura o padrão do projeto |
| `/transcript` | command | Renderiza a sessão atual para Markdown ou HTML saneado; `--save` escreve com aprovação |
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
| `/transcript` | Renderiza a sessão atual para Markdown pela pipeline de render |
| `/transcript md` | Renderiza para Markdown (`md` é a forma abreviada de `markdown`) |
| `/transcript html` | Renderiza para HTML saneado |
| `/transcript --renderer=concise` | Renderiza forçando um renderer (regras ignoradas) |
| `/transcript md --save report.md` | Renderiza e então escreve o documento saneado em `report.md` após aprovação |

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
| Alternância | menu `/config` ou ajuste `outputStyle` (o comando `/output-style` foi removido na v2.1.91) | comando `/style` + Web picker + campo `defaultStyle` na página Plugins da Web |

## Conflict check

Filtrado contra o ecossistema DSH antes do desenvolvimento (instantânea 2026-08): nenhum repositório `style`/`output-style` sob [topic:dsh-plugin](https://github.com/topics/dsh-plugin), nenhuma categoria de output-style nas quatro principais [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), e nenhuma entrada no [catálogo dsh-hub](https://github.com/omdsh-dev/dsh-hub-workshop). Os vizinhos mais próximos — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) e [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (estilos de saída diferidos explicitamente para v0.2+) — são adjacentes, não conflitantes.

## Permissions & data

- **Permissions**: o manifesto de workshop declara `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` e `settings:read`.
- **Data**: a escolha de estilo vive no domínio de armazenamento `output_style` (indexada por sessionId); nenhum outro estado é persistido, sem solicitações de rede.
- **Session log**: o nome do estilo vem de `command/run`, o texto exato injetado de `system/message`; o marcador de procedência `{ kind: 'dsh-output-styles' }` viaja no registro do domínio.

## Security boundaries

- **Somente serviços públicos.** Contribui `systemPrompt`, comandos, armazenamento e settings; sem alterações em engine / agent-loop / apiproxy / UI oficial.
- **Visível para o modelo ⟺ registrado.** Tudo o que o modelo vê é reconstruível a partir do log de sessão — sem novo tipo de evento de sessão, sem alterações no agent-loop.
- **Original sempre conservado.** Cada render (e `/transcript`) mantém o texto original ao lado do renderizado; a exportação HTML usa HTML saneado.
- **Escritas em disco controladas.** `/transcript --save` escreve somente após o serviço de aprovação conceder, e o conteúdo escrito passa primeiro pela função pura `sanitizeText`; sem um serviço de aprovação ou fs, nada é escrito (fail-closed).

## Known limitations

- **Coexistência com o core.** Se surgir um recurso `outputStyles` de primeira parte, este plugin detecta o serviço `outputStyles` e degrada para a superfície incremental (hot-switch, rules, `/transcript`), deixando a injeção do prompt para o core — ver [`docs/COEXISTENCE.md`](docs/COEXISTENCE.md) e as funções exportadas `detectCoreOutputStyles` / `coexistenceReport`. **O modo degradado é declarado onde dá para ver**: toda resposta de `/style <estilo>` e `/style off` traz uma nota `degraded coexistence mode`, e a projeção de sessão `style` expõe `promptInjection: 'enabled' | 'disabled'`, então nenhuma superfície insinua que o estilo está em vigor quando não está. (Antes de 0.7.0 o único rastro era uma linha `ctx.logger.info`, que nunca chega à transcrição.)
- **Somente conversa principal.** Os estilos se aplicam à conversa principal; sessões de subagente mantêm seus próprios prompts (como no Claude Code).
- **Truncamento.** Corpos de estilo mais longos que `maxStyleChars` são truncados com um marcador.
- **Arquivos omitidos.** Um arquivo de estilo defeituoso é omitido com um aviso e nunca quebra o profile.

## Development

```sh
pnpm install
pnpm run typecheck   # ambos os projetos tsc
pnpm test            # vitest — 156 tests
pnpm run verify      # typecheck + tests + self-contained (a porta de prepublishOnly)
pnpm run build       # artefatos lib/ (bundles host + client)
pnpm pack            # tarball para dsh plugin add
```

Lançamentos: empurrar uma etiqueta `v*` cujo sufixo coincide com a versão de `package.json` dispara o workflow Publish — verificação completa e depois publicação no npm com procedência.

## Interoperability with other DSH plugins

Verificado contra **DSH `0.2.0-rc.2`** (o runtime para o qual este README é publicado) e o conjunto de plugins com mais estrelas pesquisado em 2026-10-05.

Este plugin **não interfere** em outros plugins, incluindo os de mais estrelas:

- **Sem colisão de nome de ferramenta.** Todas as ferramentas têm namespace; nenhuma ocupa um nome puro já pertencente a uma ferramenta embutida ou a outro plugin.
- **Sem colisão de chave de serviço.** Fornece apenas `outputRenderers`; essa chave não é uma costura embutida nem é fornecida por nenhum plugin de mais estrelas.
- **Sem colisão de slot.** Não registra nenhuma chave de slot de cliente, então não disputa um assento `shadows-shipped-ui`.
- **Sem colisão de rota HTTP.** Não registra nenhum prefixo `webServer`.
- **Sem colisão na camada de patch.** O patch do bundle apenas faz `insert` da própria linha; nunca sobrescreve o `config` de uma linha embutida.
- **Sem mutação global.** Não altera protótipos, não reescreve `process.env` nem substitui o dispatcher global de fetch.

**Listeners de eventos compartilhados não interferem por construção.** Observa os eventos sensíveis à ordem `system-prompt/assemble` com `ctx.on()` — o registro de difusão do Cordis, onde cada listener executa e nenhum pode privar outro do turno. **Todos os listeners aqui delegam via `next()`**, então a cadeia nunca é curto-circuitada:
  - `system-prompt/assemble` — also used by `dsh-routing-suite` (7000★, 13 listeners).

Evidência estática: `dsh-plugin-doctor` K10–K13 retornam `pass` em todas as verificações deste repositório.

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor e mantenedor: arquitetura do plugin, biblioteca de estilos, instalação de bundle, Web picker, documentação em cinco idiomas e ferramentas de CI/lançamento.

## PerryLink DSH Plugin Family

Este projeto é um dos **87 plugins ativamente mantidos** do DeepSeek Harness da [PerryLink](https://github.com/PerryLink). O registro da família tem **95** plugins — **5 congelados**, **3 retirados** — e fica recolhido abaixo para que cada README mantenha uma primeira tela curta. Expanda para ver cada linha, com o motivo na coluna Status.

<details>
<summary>Expandir os 95 plugins</summary>

| Plugin | Uma linha | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver o README do repositório |
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

### Instalar a partir do mercado do DSH Desktop

Todos os plugins PerryLink podem ser explorados no mercado integrado do DSH Desktop: **Market → Sources → add source → colar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ selecionar**. A instalação continua passando pela verificação de identidade npm do mercado e pela sua confirmação.
