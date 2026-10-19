<div align="center">

# 🎨 dsh-output-styles
- **1024 स्टोर चैनल**: एक बार `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add dsh-output-styles` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

**DeepSeek Harness के लिए Claude Code का `outputStyles`**: मॉडल की आउटपुट शैली को रनटाइम पर, प्रति-सत्र, स्थायी रूप से बदलें।

*`/style concise` — और अब से हर उत्तर संक्षिप्त। `/style off` — वापस परियोजना के डिफ़ॉल्ट पर।*

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-output-styles?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-output-styles?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-output-styles
```


</div>

---


**📖 इकोसिस्टम नॉलेज बेस** — मापे गए आँकड़े, मार्केटिंग नहीं: [डेवलपमेंट गाइड · चयन डेटा · रखरखाव मानदंड](https://perrylink.github.io/dsh-plugin-guide/)।

<!-- star-cta -->
## Install & uninstall

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add github:PerryLink/dsh-output-styles` — `prepare` स्क्रिप्ट केवल उत्पादन निर्भरताओं से बनाती है।
- **npm चैनल** (प्रकाशित रिलीज़): `dsh plugin --profile web add dsh-output-styles`.
- **tarball चैनल**: इस रेपो में `pnpm pack`, फिर `dsh plugin --profile web add ./dsh-output-styles-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-output-styles`.

## ⭐ 如果它帮到了你

यह प्लगइन [DSH प्लगइन परिवार](https://github.com/PerryLink) का हिस्सा है (95 प्लगइन, सभी Apache-2.0)। अगर यह उपयोगी लगे, तो **एक स्टार दें** — इससे कोई सुविधा अनलॉक नहीं होती, पर अगला व्यक्ति इसे खोज में आसानी से पा लेता है।

*English:* part of a 95 plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-output-styles?

`/style concise` — और अब से हर उत्तर संक्षिप्त। `/style off` — वापस परियोजना के डिफ़ॉल्ट पर।

![dsh-output-styles का टर्मिनल डेमो: dsh-output-styles — /style lists, then switches at runtime](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-hero.png)

![Animated terminal demo of dsh-output-styles](https://raw.githubusercontent.com/PerryLink/dsh-output-styles/main/docs/assets/dsh-output-styles-demo.gif)

*वही रन, एनिमेटेड।*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-rc.2` (2026-09-09 को अनुकूलित): सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है। 2026-09-11 को dsh-v0.2.1-rc.2 checkout के विरुद्ध सत्यापित (पूर्ण गेट श्रृंखला + प्रोफ़ाइल इंस्टॉल स्मोक)। |
| Node | `^22.19.0 || >=24.0.0` |
| Platforms | सभी (host + वेब क्लाइंट) |
| Model | कोई भी (सिस्टम-प्रॉम्प्ट इंजेक्शन) |

## What you get

`dsh-output-styles` DeepSeek Harness के लिए Claude Code के `outputStyles` का समकक्ष है: एक `/style` कमांड जो रनटाइम पर मॉडल की आउटपुट शैली बदलता है, प्रति-सत्र स्थायी होता है और हर प्रॉम्प्ट संयोजन पर इंजेक्ट होता है।

- **शैली पुस्तकालय** — प्रति शैली एक Markdown फ़ाइल (`styles/*.md`); मेटाडेटा के लिए frontmatter, मुख्य भाग = मॉडल निर्देश। छह अंतर्निहित (`concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`), जिनमें Claude Code-समतुल्य `proactive` और `learning` शामिल हैं।
- **`/style` कमांड** — बिना तर्क शैलियों (विवरण सहित) और वर्तमान चयन को सूचीबद्ध करता है; `/style <name>` बदलता है; `/style off` परियोजना डिफ़ॉल्ट बहाल करता है।
- **सत्र-स्कोप्ड स्थायित्व** — चयन `output_style` स्टोरेज डोमेन में रहता है, sessionId से अनुक्रमित, और पुनःआरंभ के बाद भी बना रहता है।
- **सिस्टम-प्रॉम्प्ट इंजेक्शन** — एक `systemPrompt.section()` योगदान (क्रम `sectionOrder`) हर संयोजन पर वर्तमान सत्र की शैली का मुख्य भाग इंजेक्ट करता है, एक विन्यास-योग्य बजट पर काटा गया।
- **Claude Code समानता** — `keep-coding-instructions`, `force-for-plugin` (उपनाम `force`), `outputStyles` JSON संगतता, स्तरित `stylesDir` निर्देशिकाएँ, हॉट रीलोड और Web के **Plugins** पेज से लाइव-संपादन-योग्य परियोजना-डिफ़ॉल्ट फ़ॉलबैक।
- **रेंडरर रजिस्ट्री (`output.render.*`)** — `ctx.outputRenderers` किसी भी प्लगइन को एक शुद्ध presenter पंजीकृत करने देता है, जो `output.render/before` वॉटरफ़ॉल से लागू होता है; अंतर्निहित रेंडरर `concise` और `step-by-step`।
- **प्रति-सत्र/प्रति-टूल नियम** — `rules: [{ match: { tool: 'bash' }, style: 'concise' }]` मिलान वाले अनुरोधों के लिए रेंडरर नामित करते हैं; Web के **Plugins** पेज से लाइव-संपादन-योग्य।
- **`/transcript`** — रेंडर पाइपलाइन से वर्तमान सत्र को Markdown या सैनिटाइज़्ड HTML में प्रस्तुत करता है; `--save <path>` उपयोगकर्ता की स्वीकृति के बाद सैनिटाइज़्ड दस्तावेज़ को उस workspace पथ पर लिखता है। हर रेंडर मूल पाठ को रेंडर किए गए के साथ रखता है।

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

मॉडल जो देखता है वह सब सत्र लॉग से पुनर्निर्माण-योग्य है — कोई नया सत्र घटना प्रकार नहीं, कोई agent-loop बदलाव नहीं। शैली नाम `command/run` से आता है, सटीक इंजेक्ट किया गया पाठ `system/message` से, और स्रोत मार्कर `{ kind: 'dsh-output-styles' }` डोमेन रिकॉर्ड में चलता है। शैलियाँ केवल मुख्य वार्तालाप पर लागू होती हैं; उप-एजेंट सत्र अपने प्रॉम्प्ट रखते हैं (Claude Code की तरह)।

## Configuration

सभी ट्यूनेबल Schemastery `Config` फ़ील्ड हैं (cordis.yml से बदले जा सकते हैं)। अमान्य मान लोड को विफल करते हैं।

`defaultStyle` और `rules` को `volatile()` घोषित किया गया है, इसलिए settings forms सीम को संयोजित करने वाले host पर वे **लाइव, Web-संपादन-योग्य फ़ील्ड** हैं: उन्हें Web UI के **Plugins → dsh-output-styles** में संपादित करें और चल रहा प्लगइन बिना रीमाउंट के नया मान अपना लेता है। अन्य सभी फ़ील्ड केवल composition तक सीमित रहते हैं और उनके लिए रीलोड चाहिए। कमिट किया गया मान लागू करने से पहले मान्य किया जाता है — अमान्य होने पर वह अस्वीकार कर दिया जाता है और चल रहे मान अपरिवर्तित रहते हैं।

| Key | Default | वेब-संपादन योग्य | Meaning |
|---|---|---|---|
| `stylesDir` | `[]` | नहीं | शैली-पुस्तकालय निर्देशिकाएँ, cwd के सापेक्ष; बाद की प्रविष्टियाँ पहले वालों को ओवरराइड करती हैं। `[]` = केवल अंतर्निहित `styles/` |
| `maxStyleChars` | `4000` | नहीं | शैली-मुख्य बजट (≥ 1); लंबे भाग एक मार्कर से काटे जाते हैं |
| `defaultStyle` | `''` | **हाँ** | उन सत्रों की शैली जिन्होंने कभी चयन नहीं किया; `''` = कोई शैली नहीं। लाइव पुस्तकालय में न मौजूद नाम इंजेक्ट करने के बजाय अस्वीकार कर दिया जाता है |
| `compatJson` | `true` | नहीं | Claude Code `outputStyles` JSON प्रविष्टियाँ लोड करें (एकल ऑब्जेक्ट या ऐरे) |
| `sectionOrder` | `90` | नहीं | इंजेक्ट किए गए अनुभाग का क्रम (0 = persona, 100–199 = टूल मार्गदर्शन) |
| `truncationMarker` | `"\n\n[style truncated]"` | नहीं | काटने के बिंदु पर जोड़ा गया मार्कर |
| `includeBuiltins` | `true` | नहीं | पैकेज के अंतर्निहित `styles/` को निम्नतम-प्राथमिकता परत के रूप में शामिल करें |
| `watchStyles` | `true` | नहीं | डिस्क पर शैली फ़ाइल बदलने पर पुस्तकालय फिर से लोड करें |
| `rules` | `[]` | **हाँ** | प्रति-सत्र/प्रति-टूल रेंडर नियम: `[{ match: { tool?, contentType?, session? }, style, priority? }]` |
| `enableExport` | `true` | नहीं | `/transcript` कमांड पंजीकृत करें (Markdown/HTML सत्र निर्यात, रेंडरर-जागरूक; `--save` स्वीकृति से लिखता है) |
| `respectCoreOutputStyles` | `true` | नहीं | कोर `outputStyles` सेवा का पता चलने पर इस प्लगइन का prompt इंजेक्शन छोड़ें (hot-switch / rules / export बनाए रखें) |

**0.1.6 या पुराने से माइग्रेशन।** उन संस्करणों में प्लगइन के अपने दो settings अनुभाग थे — `output-style` (`style`) और `output-style-rules` (`rules`)। 0.1.7 host ने जिस API पर वे बने थे उसे हटा दिया, इसलिए दोनों अनुभाग अब नहीं हैं। वहाँ रखा कोई भी मान संबंधित `Config` फ़ील्ड में ले जाएँ — `output-style.style` → `defaultStyle`, `output-style-rules.rules` → `rules` — अपने profile patch (`cordis.yml`) में, या उसे Plugins पेज पर सेट करें। `/style` से किए गए प्रति-सत्र चयन अप्रभावित रहते हैं: वे `output_style` storage डोमेन में रहते हैं।

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `/style` | command | शैलियाँ सूचीबद्ध करें, बदलें या परियोजना डिफ़ॉल्ट बहाल करें |
| `/transcript` | command | वर्तमान सत्र को Markdown या सैनिटाइज़्ड HTML में प्रस्तुत करें; `--save` स्वीकृति से लिखता है |
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
| `/transcript` | रेंडर पाइपलाइन से वर्तमान सत्र को Markdown में प्रस्तुत करें |
| `/transcript md` | Markdown में प्रस्तुत करें (`md`, `markdown` का संक्षिप्त रूप है) |
| `/transcript html` | सैनिटाइज़्ड HTML में प्रस्तुत करें |
| `/transcript --renderer=concise` | एक रेंडरर बाध्य करके प्रस्तुत करें (नियम छोड़े गए) |
| `/transcript md --save report.md` | प्रस्तुत करें, फिर स्वीकृति के बाद सैनिटाइज़्ड दस्तावेज़ को `report.md` में लिखें |

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
| बदलना | `/config` मेनू या `outputStyle` सेटिंग (`/output-style` कमांड v2.1.91 में हटाया गया) | `/style` कमांड + Web picker + Web के Plugins पेज पर `defaultStyle` फ़ील्ड |

## Conflict check

विकास से पहले DSH पारिस्थितिकी के विरुद्ध जाँचा गया (2026-08 स्नैपशॉट): [topic:dsh-plugin](https://github.com/topics/dsh-plugin) के अंतर्गत कोई `style`/`output-style` रिपॉज़िटरी नहीं, चार प्रमुख [awesome lists](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) में कोई output-style श्रेणी नहीं, और [dsh-hub catalog](https://github.com/omdsh-dev/dsh-hub-workshop) में कोई प्रविष्टि नहीं। निकटतम पड़ोसी — [dsh-soul-md](https://github.com/Scorp1o117/dsh-soul-md) (persona) और [dsh-claude-marketplace](https://github.com/ben7am1n/dsh-claude-marketplace) (आउटपुट शैलियाँ स्पष्ट रूप से v0.2+ तक टाली गईं) — सन्निकट हैं, संघर्षपूर्ण नहीं।

## Permissions & data

- **Permissions**: workshop मैनिफ़ेस्ट `fs:read`, `fs:write`, `fs:watch`, `storage:read`, `storage:write` और `settings:read` घोषित करता है।
- **Data**: शैली चयन `output_style` स्टोरेज डोमेन में रहता है (sessionId से अनुक्रमित); कोई अन्य स्थिति स्थायी नहीं, कोई नेटवर्क अनुरोध नहीं।
- **Session log**: शैली नाम `command/run` से आता है, सटीक इंजेक्ट किया गया पाठ `system/message` से; स्रोत मार्कर `{ kind: 'dsh-output-styles' }` डोमेन रिकॉर्ड में चलता है।

## Security boundaries

- **केवल सार्वजनिक सेवाएँ।** `systemPrompt`, कमांड, स्टोरेज और settings योगदान करता है; engine / agent-loop / apiproxy / आधिकारिक UI में कोई बदलाव नहीं।
- **मॉडल-दृश्य ⟺ लॉग किया गया।** मॉडल जो देखता है वह सब सत्र लॉग से पुनर्निर्माण-योग्य है — कोई नया सत्र घटना प्रकार नहीं, कोई agent-loop बदलाव नहीं।
- **मूल हमेशा रखा गया।** हर रेंडर (और `/transcript`) मूल पाठ को रेंडर किए गए के साथ रखता है; HTML निर्यात के लिए सैनिटाइज़्ड HTML उपयोग होता है।
- **डिस्क लेखन गेटेड।** `/transcript --save` केवल स्वीकृति सेवा की अनुमति के बाद लिखता है, और लिखा गया कंटेंट पहले `sanitizeText` शुद्ध फ़ंक्शन से गुज़रता है; स्वीकृति या fs सेवा के बिना कुछ भी नहीं लिखा जाता (fail-closed)।

## Known limitations

- **कोर के साथ सहअस्तित्व।** यदि कोई फ़र्स्ट-पार्टी `outputStyles` क्षमता आती है, तो यह प्लगइन उसकी `outputStyles` सेवा पहचानकर इंक्रीमेंटल सतह (hot-switch, rules, `/transcript`) पर डिग्रेड हो जाता है और prompt इंजेक्शन कोर को छोड़ देता है — देखें [`docs/COEXISTENCE.md`](docs/COEXISTENCE.md) तथा निर्यातित `detectCoreOutputStyles` / `coexistenceReport`. **डिग्रेडेड मोड वहाँ लिखा जाता है जहाँ आप उसे देख सकें**: हर `/style <शैली>` और `/style off` के उत्तर में `degraded coexistence mode` नोट आता है, और `style` सेशन projection `promptInjection: 'enabled' | 'disabled'` देता है, इसलिए कोई सतह शैली को लागू बताकर भ्रम नहीं फैलाती। (0.7.0 से पहले इसका एकमात्र निशान एक `ctx.logger.info` पंक्ति थी, जो सेशन ट्रांसक्रिप्ट तक कभी नहीं पहुँचती।)
- **केवल मुख्य वार्तालाप।** शैलियाँ मुख्य वार्तालाप पर लागू होती हैं; उप-एजेंट सत्र अपने प्रॉम्प्ट रखते हैं (Claude Code की तरह)।
- **कटाव।** `maxStyleChars` से लंबे शैली मुख्य भाग एक मार्कर से काटे जाते हैं।
- **छोड़ी गई फ़ाइलें।** एक ख़राब शैली फ़ाइल चेतावनी से छोड़ दी जाती है और profile को कभी नहीं तोड़ती।

## Development

```sh
pnpm install
pnpm run typecheck   # दोनों tsc परियोजनाएँ
pnpm test            # vitest — 156 tests
pnpm run verify      # typecheck + tests + self-contained (prepublishOnly द्वार)
pnpm run build       # lib/ कलाकृतियाँ (host + client बंडल)
pnpm pack            # dsh plugin add के लिए tarball
```

रिलीज़: `package.json` संस्करण से मेल खाते प्रत्यय वाला `v*` टैग पुश करने पर Publish workflow चलता है — पूर्ण सत्यापन, फिर provenance सहित npm प्रकाशन।

## Interoperability with other DSH plugins

**DSH `0.2.0-rc.2`** (वह रनटाइम जिसके लिए यह README प्रकाशित है) और 2026-10-05 को सर्वे किए गए उच्च-स्टार प्लगइन सेट के विरुद्ध सत्यापित।

यह प्लगइन अन्य प्लगइनों में **हस्तक्षेप नहीं करता**, उन उच्च-स्टार प्लगइनों सहित जो व्यापक रूप से इंस्टॉल हैं:

- **कोई टूल-नाम टकराव नहीं।** सभी टूल नेमस्पेस युक्त हैं; कोई भी ऐसा नंगा नाम नहीं लेता जो पहले से किसी अंतर्निहित टूल या अन्य प्लगइन का हो।
- **कोई सर्विस-की टकराव नहीं।** यह केवल `outputRenderers` प्रदान करता है; यह key न अंतर्निहित सीम है और न किसी सर्वे किए गए उच्च-स्टार प्लगइन द्वारा प्रदान की जाती है।
- **कोई स्लॉट टकराव नहीं।** यह कोई क्लाइंट slot key पंजीकृत नहीं करता, इसलिए `shadows-shipped-ui` सीट के लिए प्रतिस्पर्धा नहीं करता।
- **कोई HTTP रूट टकराव नहीं।** यह कोई `webServer` प्रीफ़िक्स पंजीकृत नहीं करता।
- **कोई patch-लेयर टकराव नहीं।** बंडल patch केवल अपनी पंक्ति `insert` करता है; कभी किसी अंतर्निहित पंक्ति का `config` ओवरराइड नहीं करता।
- **कोई वैश्विक परिवर्तन नहीं।** यह प्रोटोटाइप नहीं बदलता, `process.env` नहीं लिखता, और वैश्विक fetch dispatcher प्रतिस्थापित नहीं करता।

**साझा ईवेंट लिसनर रचना से ही अहस्तक्षेपी हैं।** यह क्रम-संवेदनशील ईवेंट `system-prompt/assemble` को `ctx.on()` से देखता है — Cordis का **ब्रॉडकास्ट** पंजीकरण, जहाँ हर लिसनर चलता है और कोई किसी दूसरे को वंचित नहीं कर सकता। **यहाँ प्रत्येक लिसनर `next()` से डेलिगेट करता है**, इसलिए श्रृंखला कभी शॉर्ट-सर्किट नहीं होती:
  - `system-prompt/assemble` — also used by `dsh-routing-suite` (7000★, 13 listeners).

स्थैतिक प्रमाण: इस रिपॉज़िटरी पर `dsh-plugin-doctor` के K10–K13 सभी `pass` हैं।

## Topics

`deepseek-harness`, `dsh`, `dsh-plugin`, `output-style`, `output-styles`, `claude-code`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — लेखक और अनुरक्षक: प्लगइन वास्तुकला, शैली पुस्तकालय, बंडल स्थापना, Web picker, पाँच-भाषा दस्तावेज़ और CI/रिलीज़ टूलिंग।

## PerryLink DSH Plugin Family

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के DeepSeek Harness प्लगइन परिवार का हिस्सा है। पूरी सूची नीचे संक्षिप्त रखी गई है ताकि हर README की पहली स्क्रीन छोटी रहे; हर पंक्ति और उसकी स्थिति देखने के लिए इसे खोलें।

<details>
<summary>सभी प्लगइन खोलें</summary>

| प्लगइन | स्थिति |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** |  |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |

</details>

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।
