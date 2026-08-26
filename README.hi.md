<div align="center">

# 🎨 dsh-output-styles

**DeepSeek Harness के लिए Claude Code का `outputStyles`**: मॉडल की आउटपुट शैली को रनटाइम पर, प्रति-सत्र, स्थायी रूप से बदलें।

*`/style concise` — और अब से हर उत्तर संक्षिप्त। `/style off` — वापस परियोजना के डिफ़ॉल्ट पर।*

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
| Harness | DeepSeek Harness `0.1.1-rc.2` |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | सभी (host + वेब क्लाइंट) |
| Model | कोई भी (सिस्टम-प्रॉम्प्ट इंजेक्शन) |

## What you get

`dsh-output-styles` DeepSeek Harness के लिए Claude Code के `outputStyles` का समकक्ष है: एक `/style` कमांड जो रनटाइम पर मॉडल की आउटपुट शैली बदलता है, प्रति-सत्र स्थायी होता है और हर प्रॉम्प्ट संयोजन पर इंजेक्ट होता है।

- **शैली पुस्तकालय** — प्रति शैली एक Markdown फ़ाइल (`styles/*.md`); मेटाडेटा के लिए frontmatter, मुख्य भाग = मॉडल निर्देश। छह अंतर्निहित (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), जिनमें Claude Code-समतुल्य `proactive` और `learning` शामिल हैं।
- **`/style` कमांड** — बिना तर्क शैलियों (विवरण सहित) और वर्तमान चयन को सूचीबद्ध करता है; `/style <name>` बदलता है; `/style off` परियोजना डिफ़ॉल्ट बहाल करता है।
- **सत्र-स्कोप्ड स्थायित्व** — चयन `output_style` स्टोरेज डोमेन में रहता है, sessionId से अनुक्रमित, और पुनःआरंभ के बाद भी बना रहता है।
- **सिस्टम-प्रॉम्प्ट इंजेक्शन** — एक `systemPrompt.section()` योगदान (क्रम `sectionOrder`) हर संयोजन पर वर्तमान सत्र की शैली का मुख्य भाग इंजेक्ट करता है, एक विन्यास-योग्य बजट पर काटा गया।
- **Claude Code समानता** — `keep-coding-instructions`, `force-for-plugin` (उपनाम `force`), `outputStyles` JSON संगतता, स्तरित `stylesDir` निर्देशिकाएँ, हॉट रीलोड और DSH settings सीम पर परियोजना-डिफ़ॉल्ट फ़ॉलबैक।
- **रेंडरर रजिस्ट्री (`output.render.*`)** — `ctx.outputRenderers` किसी भी प्लगइन को एक शुद्ध presenter पंजीकृत करने देता है, जो `output.render/before` वॉटरफ़ॉल से लागू होता है; अंतर्निहित रेंडरर `concise` और `step-by-step`।
- **प्रति-सत्र/प्रति-टूल नियम** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` मिलान वाले अनुरोधों के लिए रेंडरर नामित करते हैं; `output-style-rules` settings अनुभाग से संपादन-योग्य।
- **`/export`** — रेंडर पाइपलाइन से वर्तमान सत्र को Markdown या सैनिटाइज़्ड HTML में प्रस्तुत करता है; `--save <path>` उपयोगकर्ता की स्वीकृति के बाद सैनिटाइज़्ड दस्तावेज़ को उस workspace पथ पर लिखता है। हर रेंडर मूल पाठ को रेंडर किए गए के साथ रखता है।

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

मॉडल जो देखता है वह सब सत्र लॉग से पुनर्निर्माण-योग्य है — कोई नया सत्र घटना प्रकार नहीं, कोई agent-loop बदलाव नहीं। शैली नाम `command/run` से आता है, सटीक इंजेक्ट किया गया पाठ `request/header` से, और स्रोत मार्कर `{ kind: 'plugin', plugin: 'dsh-output-styles' }` डोमेन रिकॉर्ड में चलता है। शैलियाँ केवल मुख्य वार्तालाप पर लागू होती हैं; उप-एजेंट सत्र अपने प्रॉम्प्ट रखते हैं (Claude Code की तरह)।

## Install & uninstall

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add "github:PerryLink/dsh-output-styles#main"` — `prepare` स्क्रिप्ट केवल उत्पादन निर्भरताओं से बनाती है।
- **npm चैनल** (प्रकाशित रिलीज़): `dsh plugin --profile web add dsh-output-styles`.
- **tarball चैनल**: इस रेपो में `pnpm pack`, फिर `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-output-styles`.

## Configuration

सभी ट्यूनेबल Schemastery `Config` फ़ील्ड हैं (cordis.yml से बदले जा सकते हैं)। अमान्य मान लोड को विफल करते हैं।

| Key | Default | Meaning |
|---|---|---|
| `stylesDir` | `[]` | शैली-पुस्तकालय निर्देशिकाएँ, cwd के सापेक्ष; बाद की प्रविष्टियाँ पहले वालों को ओवरराइड करती हैं। `[]` = केवल अंतर्निहित `styles/` |
| `maxStyleChars` | `4000` | शैली-मुख्य बजट (≥ 1); लंबे भाग एक मार्कर से काटे जाते हैं |
| `defaultStyle` | `''` | उन सत्रों की शैली जिन्होंने कभी चयन नहीं किया (और कोई settings डिफ़ॉल्ट नहीं); `''` = कोई शैली नहीं |
| `compatJson` | `true` | Claude Code `outputStyles` JSON प्रविष्टियाँ लोड करें (एकल ऑब्जेक्ट या ऐरे) |
| `sectionOrder` | `90` | इंजेक्ट किए गए अनुभाग का क्रम (0 = persona, 100–199 = टूल मार्गदर्शन) |
| `truncationMarker` | `"\n\n[style truncated]"` | काटने के बिंदु पर जोड़ा गया मार्कर |
| `includeBuiltins` | `true` | पैकेज के अंतर्निहित `styles/` को निम्नतम-प्राथमिकता परत के रूप में शामिल करें |
| `watchStyles` | `true` | डिस्क पर शैली फ़ाइल बदलने पर पुस्तकालय फिर से लोड करें |
| `rules` | `[]` | प्रति-सत्र/प्रति-टूल रेंडर नियम: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | `/export` कमांड पंजीकृत करें (Markdown/HTML सत्र निर्यात, रेंडरर-जागरूक; `--save` स्वीकृति से लिखता है) |
| `respectCoreOutputStyles` | `true` | कोर `outputStyles` सेवा का पता चलने पर इस प्लगइन का prompt इंजेक्शन छोड़ें (hot-switch / rules / export बनाए रखें) |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | शैलियाँ सूचीबद्ध करें, बदलें या परियोजना डिफ़ॉल्ट बहाल करें |
| `/export` | command | वर्तमान सत्र को Markdown या सैनिटाइज़्ड HTML में प्रस्तुत करें; `--save` स्वीकृति से लिखता है |
| `output_style` | storage domain | sessionId से अनुक्रमित सत्र-स्कोप्ड शैली चयन |
| `systemPrompt.section()` | contribution | हर संयोजन पर वर्तमान शैली का मुख्य भाग इंजेक्ट करता है |
| `output.render.*` | renderer registry | `ctx.outputRenderers` + `output.render/before` वॉटरफ़ॉल |
| `style` | projection | स्थिर कमांडों से मुड़ा हुआ `{ options, currentValue }` |
| Web picker | client entry | `dsh-output-styles/client` `/style` को पॉप-अप चयनकर्ता से सजाता है |

## Command reference

| Input | Outcome |
|---|---|
| `/style` | वर्तमान चयन + प्रति शैली एक पंक्ति (नाम — विवरण) सूचीबद्ध करें |
| `/style concise` | बदलें (स्थायी लेखन), `switched to concise` |
| `/style Diagrams first` | बहु-शब्द नाम पूरा शेष भाग होते हैं |
| `/style off` | परियोजना डिफ़ॉल्ट बहाल करें (settings डिफ़ॉल्ट, फिर `defaultStyle`) |
| `/style nope` | `error: unknown output style "nope" (available: …)` |
| `/export` | रेंडर पाइपलाइन से वर्तमान सत्र को Markdown में प्रस्तुत करें |
| `/export md` | Markdown में प्रस्तुत करें (`md`, `markdown` का संक्षिप्त रूप है) |
| `/export html` | सैनिटाइज़्ड HTML में प्रस्तुत करें |
| `/export --renderer=concise` | एक रेंडरर बाध्य करके प्रस्तुत करें (नियम छोड़े गए) |
| `/export md --save report.md` | प्रस्तुत करें, फिर स्वीकृति के बाद सैनिटाइज़्ड दस्तावेज़ को `report.md` में लिखें |

## Style library

प्रति शैली एक Markdown फ़ाइल; frontmatter मेटाडेटा के लिए, मुख्य भाग = मॉडल निर्देश। `name` डिफ़ॉल्ट रूप से फ़ाइल नाम लेता है और रिक्त स्थान रख सकता है (`Diagrams first`)।

| Field | Default | Meaning |
|---|---|---|
| `name` | फ़ाइल नाम | बदलाव का लक्ष्य; अक्षर, अंक, रिक्त स्थान और हाइफ़न (`off` आरक्षित है) |
| `description` | — (आवश्यक) | सूचियों और चयनकर्ता में दिखाया गया एक वाक्य |
| `whenToUse` | — | सूचियों में जोड़ा गया वैकल्पिक मार्गदर्शन |
| `keep-coding-instructions` | `false` | `true` होने पर harness प्रॉम्प्ट रखें; `false` होने पर उसे बदल दें (Claude Code अर्थविज्ञान) |
| `force-for-plugin` | `false` | बिना शर्त लागू करें, किसी भी सत्र चयन को ओवरराइड करते हुए; `force` एक उपनाम है, अधिकतम एक शैली इसे सेट कर सकती है |

`compatJson: true` होने पर, Claude Code `outputStyles` JSON प्रविष्टियाँ (`{ name, description, prompt }`) Markdown शैलियों के साथ लोड होती हैं; पार्स न होने वाली प्रविष्टियाँ एक चेतावनी से छोड़ दी जाती हैं।

## Renderer protocol

`output.render.*` प्रोटोकॉल प्रस्तुति को एक विस्तार बिंदु में बदल देता है। एक रेंडरर एक **शुद्ध presenter** है — `presenter(text, context)` तर्कों को प्रदर्शन डेटा में मैप करता है, DOM को कभी नहीं छूता — टूल नाम और सामग्री प्रकार से मिलान, प्राथमिकता से क्रमबद्ध।

- **Waterfall पहले**: हर रेंडर अनुरोध `output.render/before` (`{ text, context }`) से गुज़रता है; listeners को `next()` कॉल करना चाहिए।
- **Rules**: `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` मिलान वाले अनुरोधों के लिए रेंडरर नामित करता है; बराबरी `priority` से और फिर नियम क्रम से टूटती है।
- **Built-ins**: `concise` (व्हाइटस्पेस संघनन + बजट कटाव) और `step-by-step` (सुसंगत चरण क्रमांकन)।
- **Auditability**: हर रेंडर परिणाम `{ original, rendered, rendererId, changed }` रखता है; रेंडर किया गया पाठ जो दिखता है, मूल सत्र लॉग से पुनर्निर्माण-योग्य रहता है।

## Web picker

`dsh.client` प्रविष्टि host `/style` कमांड के नंगे आह्वान को एक पॉप-अप चयनकर्ता से सजाती है: एक "off" पंक्ति + प्रति पुस्तकालय शैली एक पंक्ति (`description · whenToUse`), सक्रिय पंक्ति चिह्नित। चुनना कमांड Remote के माध्यम से `/style <name>` सबमिट करता है, इसलिए हर बदलाव host का स्थायी कमांड जीवनचक्र बनाए रखता है। चयनकर्ता Web UI के `zh`/`en` भाषा युग्म का अनुसरण करता है।

## Differences from Claude Code

| | Claude Code | dsh-output-styles |
|---|---|---|
| शैली फ़ाइलें | उपयोगकर्ता/परियोजना/प्रबंधित स्तरों पर `.claude/output-styles` | `stylesDir` निर्देशिकाएँ + अंतर्निहित `styles/`, बाद वाली निर्देशिका जीतती है |
| कस्टम शैलियाँ | Markdown, frontmatter `name`/`description`/`keep-coding-instructions`/`force-for-plugin` | समान फ़ील्ड (`force-for-plugin` शब्दशः स्वीकृत, `force` उपनाम) + `whenToUse` |
| लीगेसी JSON | `settings.json` में `outputStyles` ऐरे | शब्दशः लोड (`compatJson: true`) |
| प्रभावी होने का समय | `/clear` के बाद या नया सत्र | तुरंत — सिस्टम प्रॉम्प्ट प्रति-अनुरोध पुनः संयोजित होता है |
| उप-एजेंट | शैलियाँ लागू नहीं होतीं | समान — उप-एजेंट सत्र अपने प्रॉम्प्ट रखते हैं |
| बदलना | `/config` मेनू या `outputStyle` सेटिंग (`/output-style` कमांड v2.1.91 में हटाया गया) | `/style` कमांड + Web picker + settings `output-style.style` |

## Conflict check

विकास से पहले DSH पारिस्थितिकी के विरुद्ध जाँचा गया (2026-08 स्नैपशॉट): [topic:dsh-plugin](https://github.com/topics/dsh-plugin) के अंतर्गत कोई `style`/`output-style` रिपॉज़िटरी नहीं, चार प्रमुख [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) में कोई output-style श्रेणी नहीं, और [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop) में कोई प्रविष्टि नहीं। निकटतम पड़ोसी — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) और [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (आउटपुट शैलियाँ स्पष्ट रूप से v0.2+ तक टाली गईं) — सन्निकट हैं, संघर्षपूर्ण नहीं।

## Permissions & data

- **Permissions**: workshop मैनिफ़ेस्ट `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` और `settings:read` घोषित करता है।
- **Data**: शैली चयन `output_style` स्टोरेज डोमेन में रहता है (sessionId से अनुक्रमित); कोई अन्य स्थिति स्थायी नहीं, कोई नेटवर्क अनुरोध नहीं।
- **Session log**: शैली नाम `command/run` से आता है, सटीक इंजेक्ट किया गया पाठ `request/header` से; स्रोत मार्कर `{ kind: 'plugin', plugin: 'dsh-output-styles' }` डोमेन रिकॉर्ड में चलता है।

## Security boundaries

- **केवल सार्वजनिक सेवाएँ।** `systemPrompt`, कमांड, स्टोरेज और settings योगदान करता है; engine / agent-loop / apiproxy / आधिकारिक UI में कोई बदलाव नहीं।
- **मॉडल-दृश्य ⟺ लॉग किया गया।** मॉडल जो देखता है वह सब सत्र लॉग से पुनर्निर्माण-योग्य है — कोई नया सत्र घटना प्रकार नहीं, कोई agent-loop बदलाव नहीं।
- **मूल हमेशा रखा गया।** हर रेंडर (और `/export`) मूल पाठ को रेंडर किए गए के साथ रखता है; HTML निर्यात के लिए सैनिटाइज़्ड HTML उपयोग होता है।
- **डिस्क लेखन गेटेड।** `/export --save` केवल स्वीकृति सेवा की अनुमति के बाद लिखता है, और लिखा गया कंटेंट पहले `sanitizeText` शुद्ध फ़ंक्शन से गुज़रता है; स्वीकृति या fs सेवा के बिना कुछ भी नहीं लिखा जाता (fail-closed)।

## Known limitations

- **केवल मुख्य वार्तालाप।** शैलियाँ मुख्य वार्तालाप पर लागू होती हैं; उप-एजेंट सत्र अपने प्रॉम्प्ट रखते हैं (Claude Code की तरह)।
- **कटाव।** `maxStyleChars` से लंबे शैली मुख्य भाग एक मार्कर से काटे जाते हैं।
- **छोड़ी गई फ़ाइलें।** एक ख़राब शैली फ़ाइल चेतावनी से छोड़ दी जाती है और profile को कभी नहीं तोड़ती।

## Development

```sh
pnpm install
pnpm run typecheck   # दोनों tsc परियोजनाएँ
pnpm test            # vitest — 127 tests
pnpm run verify      # typecheck + tests + self-contained (prepublishOnly द्वार)
pnpm run build       # lib/ कलाकृतियाँ (host + client बंडल)
pnpm pack            # dsh plugin add के लिए tarball
```

रिलीज़: `package.json` संस्करण से मेल खाते प्रत्यय वाला `v*` टैग पुश करने पर Publish workflow चलता है — पूर्ण सत्यापन, फिर provenance सहित npm प्रकाशन।

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — लेखक और अनुरक्षक: प्लगइन वास्तुकला, शैली पुस्तकालय, बंडल स्थापना, Web picker, पाँच-भाषा दस्तावेज़ और CI/रिलीज़ टूलिंग।

## PerryLink DSH Plugin Family

यह परियोजना [PerryLink](https://github.com/PerryLink) द्वारा अनुरक्षित [15 DeepSeek Harness प्लगइन](https://github.com/PerryLink) में से एक है। यदि यह आपकी मदद करता है, तो बाकी भी संभवतः करेंगे:

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
