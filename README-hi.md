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

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के **87 सक्रिय रूप से अनुरक्षित** DeepSeek Harness प्लगइन में से एक है। पूरा परिवार **95** प्लगइन है — **5 फ़्रोज़न**, **3 सेवानिवृत्त** — और नीचे संक्षिप्त रखा गया है ताकि हर README की पहली स्क्रीन छोटी रहे। हर पंक्ति देखने के लिए इसे खोलें; कारण स्थिति कॉलम में है।

<details>
<summary>सभी 95 प्लगइन खोलें</summary>

| प्लगइन | एक पंक्ति | स्थिति |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

## License

[Apache License 2.0](LICENSE) © 2026 dsh-output-styles contributors

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।
