#!/usr/bin/env python3
"""README artwork for dsh-output-styles (docs/assets/).

Outputs (idempotent overwrite):
  dsh-output-styles-hero-{zh,en}-{light,dark}.webp   1440x576   Pillow hero
  dsh-output-styles-flow-v5-{light,dark}.svg         1100x660   hand-written SVG

Both drawings follow the code, not the prose.

  * Library — one `*.md` per style: YAML frontmatter (`name`, `description`,
    `whenToUse`, `keep-coding-instructions`, `force-for-plugin`) plus the
    body that becomes the model directive; directories resolve in priority
    order (a later `stylesDir` overrides an earlier one, the bundled
    `styles/` participates as the lowest layer) and Claude Code
    `outputStyles` JSON is loaded beside them (`compatJson`); file changes
    re-swap the library (`watchStyles`) — src/style-library.ts.
  * Selection — `/style <name>` validates against the live library and
    writes `{ style, source }` into the `output_style` storage domain keyed
    by sessionId (the write settles only after the backend acked, so it
    survives a restart); `/style off` deletes it and the project default
    applies again — src/runtime.ts select()/turnOff().
  * Prompt channel — effectiveStyle() resolves forced style > session
    selection > `defaultStyle` > none, then systemPrompt.section() at
    `sectionOrder` 90 injects `# Output style: <name>` plus the body
    truncated at `maxStyleChars`; a `keep-coding-instructions: false` style
    replaces the whole prompt through the `system-prompt/assemble`
    waterfall. The injected text is exactly what the harness records as
    `system/message` — src/runtime.ts promptText().
  * Render channel — `output.render.*`: the `output.render/before`
    waterfall runs first (every listener must call `next()`), then the rule
    table (match on tool / contentType / session, highest priority first,
    first hit applies one renderer alone, otherwise every matching
    presenter composes in priority order), then pure presenters (built in:
    `concise`, `step-by-step`) returning
    `RenderedText { original, rendered, rendererId, changed }` —
    src/renderers.ts.
  * Export — `/transcript [md|html]` renders the session surface through
    that pipeline; `--renderer=<id>` forces one presenter and skips the
    rules; `--save <path>` sanitizes the document and writes it only after
    the approval service grants it (fail-closed) — src/export.ts.
  * Audit — `command/run` carries the verbatim input, `system/message` the
    exact injected text, and every render keeps `original` beside
    `rendered`, so the session log reconstructs what the model saw. A
    detected core `outputStyles` capability degrades coexistence: the
    injection is skipped (`promptInjection: 'disabled'` in the `style`
    projection) while hot-switch, rules and `/transcript` stay —
    src/coexist.ts, src/runtime.ts.

Hero (1440x576): the assembled system prompt drawn as a section stack
(`persona` order 0 / `output style` order 90 / tool guidance 100-199) with
the style band highlighted, beside the style-library rail and the real
`/style` exchange. It is the product moment, not the pipeline.

Structure diagram (flow-v5, 1100x660): two swimlanes over one shared style
library — prompt injection (selection -> priority ladder -> section at
order 90 -> model request) and render/export (transcript -> waterfall ->
rule table -> presenter -> RenderedText) — closing on a session-log audit
baseline. Deliberately not a row of five equal boxes with arrows. Its text
is command/config tokens in English only, so all five README languages
share the same pair.

Run:  python scripts/gen-readme-assets.py
Requires: Pillow + numpy, and Microsoft YaHei / Consolas / Segoe UI (the
script aborts loudly rather than render Chinese as tofu).
"""
from __future__ import annotations

import os
from html import escape

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")

HERO_W, HERO_H = 1440, 576
FLOW_W, FLOW_H = 1100, 660

# --- fonts ---------------------------------------------------------------
FONT_DIRS = [
    os.environ.get("DSH_README_FONT_DIR", ""),
    r"C:\Windows\Fonts",
    "/usr/share/fonts/truetype/msttcorefonts",
    "/usr/share/fonts/truetype/microsoft",
    "/System/Library/Fonts",
    os.path.expanduser("~/.fonts"),
]


def font_file(*names: str) -> str:
    for folder in FONT_DIRS:
        if not folder:
            continue
        for name in names:
            path = os.path.join(folder, name)
            if os.path.exists(path):
                return path
    raise SystemExit(
        f"FATAL: missing font {names[0]}; set DSH_README_FONT_DIR "
        "(msyh.ttc / msyhbd.ttc / consola.ttf / segoeui.ttf are required)")


FONT_FILES = {
    "cjk": font_file("msyh.ttc", "MicrosoftYaHei.ttf"),
    "cjk_bold": font_file("msyhbd.ttc", "MicrosoftYaHei-Bold.ttf"),
    "mono": font_file("consola.ttf", "Consolas.ttf"),
    "mono_bold": font_file("consolab.ttf", "Consolas-Bold.ttf"),
    "en": font_file("segoeui.ttf", "SegoeUI.ttf"),
    "en_bold": font_file("segoeuib.ttf", "SegoeUI-Bold.ttf"),
}

_FONTS: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def F(kind: str, size: int) -> ImageFont.FreeTypeFont:
    key = (kind, size)
    if key not in _FONTS:
        _FONTS[key] = ImageFont.truetype(FONT_FILES[kind], size)
    return _FONTS[key]


# --- palette -------------------------------------------------------------
FAMILY_LIGHT = "#4B67B4"
FAMILY_DARK = "#8496f5"

SKIN = {
    "light": dict(
        bg0="#f9f6fd", bg1="#e4eaf8",
        ink="#1b2233", sub="#525d75", faint="#7c869c",
        card="#ffffff", card_alt="#f3f6fd", line="#dbe2f3",
        accent=FAMILY_LIGHT, accent_ink="#33488d", accent_soft="#e9edfa",
        accent_line="#c9d4ee", on_accent="#ffffff", pill="#e3e9f9",
        band_sub="#e6ebfb", band_pill="#6a80c4", band_pill_text="#ffffff",
        glow1="#cfd9f6", glow2="#dcd6f4", glow3="#e8e3fb",
        shadow=(36, 48, 90, 26), hairline="#d5dcee",
        lane_fill="#f1f5fd", lane_line="#d3dcf1",
    ),
    "dark": dict(
        bg0="#131a2a", bg1="#0c1016",
        ink="#eef2fb", sub="#a7b1c8", faint="#77829c",
        card="#18202f", card_alt="#202a3d", line="#2b3550",
        accent=FAMILY_DARK, accent_ink="#b9c4ff", accent_soft="#212b45",
        accent_line="#38456b", on_accent="#0f1526", pill="#27324b",
        band_sub="#26304f", band_pill="#9aa9f8", band_pill_text="#10162a",
        glow1="#1d2740", glow2="#221f3a", glow3="#1a2438",
        shadow=(0, 0, 0, 70), hairline="#28324b",
        lane_fill="#161e2d", lane_line="#2f3c5d",
    ),
}


# ---------------------------------------------------------------------------
# Pillow helpers
# ---------------------------------------------------------------------------
def vertical_gradient(w: int, h: int, top: str, bottom: str) -> Image.Image:
    t = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None, None]
    a = np.array([int(top[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    b = np.array([int(bottom[i:i + 2], 16) for i in (1, 3, 5)],
                 dtype=np.float32)
    arr = np.broadcast_to(a * (1 - t) + b * t, (h, w, 3))
    return Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")


def glow(img: Image.Image, cx: int, cy: int, r: int, color: str,
         alpha: int) -> Image.Image:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))
    ImageDraw.Draw(layer).ellipse((cx - r, cy - r, cx + r, cy + r),
                                  fill=rgb + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.55))
    return Image.alpha_composite(img, layer)


def T(d: ImageDraw.ImageDraw, xy: tuple[float, float], s: str,
      font: ImageFont.FreeTypeFont, fill: str, anchor: str = "ls") -> None:
    d.text(xy, s, font=font, fill=fill, anchor=anchor)


def fitted_width(d: ImageDraw.ImageDraw, s: str, kind: str, size: int,
                 max_w: float, floor: int = 9) -> ImageFont.FreeTypeFont:
    """Largest font at or below `size` whose rendering fits `max_w`."""
    while size > floor and d.textlength(s, font=F(kind, size)) > max_w:
        size -= 1
    return F(kind, size)


# ---------------------------------------------------------------------------
# Hero — the assembled system prompt, the library rail, the real exchange
# ---------------------------------------------------------------------------
HERO_TEXT = {
    "zh": dict(
        kicker="DSH 插件 · 输出风格切换",
        value1="一次 /style concise，之后每条回复都简洁",
        value2="选择按会话持久化，重启不丢，组装时注入",
        subtitle="六种内置风格 · 提示词按 order 90 注入 · /transcript 渲染导出",
        meta1="Apache-2.0 · DSH ≥0.2.1 <0.3.0",
        meta2="Node ^22.19 || >=24.9 · 无网络请求 · 仅主会话",
        card_a="系统提示组装",
        band1="身份 · 项目约定",
        band2="Terse, direct answers — no preamble.",
        band3="工具使用指引",
        card_a_foot="maxStyleChars 4000 · keep-coding-instructions: false → 整份替换",
        card_b="风格库 · 六种内置",
        card_b_foot="/style concise  →  switched to concise",
    ),
    "en": dict(
        kicker="DSH PLUGIN · OUTPUT STYLES",
        value1="One /style concise, then every reply is terse",
        value2="Per-session choice, kept across restarts",
        subtitle="Six built-in styles · order-90 prompt section",
        meta1="Apache-2.0 · DSH >=0.2.1 <0.3.0",
        meta2="Node ^22.19 || >=24.9 · no network · main session only",
        card_a="Prompt assembly",
        band1="identity · project facts",
        band2="Terse, direct answers — no preamble.",
        band3="tool usage guidance",
        card_a_foot="maxStyleChars 4000 · keep-coding-instructions: false → replaces the prompt",
        card_b="Style library · six built-ins",
        card_b_foot="/style concise  →  switched to concise",
    ),
}

BANDS = [("0", "persona"), ("90", "output style: concise"),
         ("100–199", "tool guidance")]

STYLE_NAMES = ["concise", "explanatory", "formal",
               "learning", "proactive", "step-by-step"]


def hero(lang: str, skin_name: str) -> Image.Image:
    s = SKIN[skin_name]
    t = HERO_TEXT[lang]
    zh = lang == "zh"
    ui_bold = "cjk_bold" if zh else "en_bold"
    ui = "cjk" if zh else "en"
    mono = "mono"

    img = vertical_gradient(HERO_W, HERO_H, s["bg0"], s["bg1"])
    img = glow(img, 1210, 40, 320, s["glow1"], 82)
    img = glow(img, 1360, 540, 260, s["glow2"], 70)
    img = glow(img, 640, 610, 300, s["glow3"], 46)

    cards = [((856, 76, 1384, 380), 22), ((856, 396, 1384, 558), 22)]

    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for box, r in cards:
        sd.rounded_rectangle((box[0], box[1] + 10, box[2], box[3] + 14),
                             radius=r, fill=s["shadow"])
    img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(18)))

    d = ImageDraw.Draw(img)
    for box, r in cards:
        d.rounded_rectangle(box, radius=r, fill=s["card"], outline=s["line"],
                            width=1)

    # ---- left column -----------------------------------------------------
    kf = F(ui_bold if zh else "mono_bold", 19 if zh else 18)
    kw = d.textlength(t["kicker"], font=kf)
    d.rounded_rectangle((64, 48, 64 + 40 + kw + 20, 86), radius=19,
                        fill=s["accent_soft"], outline=s["accent_line"],
                        width=1)
    d.ellipse((82, 63, 92, 73), fill=s["accent"])
    T(d, (104, 67), t["kicker"], kf, s["accent_ink"], "lm")

    T(d, (64, 102), "dsh-output-styles", F("en_bold", 84), s["ink"], "lt")

    v1 = fitted_width(d, t["value1"], ui_bold, 30, 736, floor=20)
    v2 = fitted_width(d, t["value2"], ui_bold, 30, 736, floor=20)
    T(d, (64, 256), t["value1"], v1, s["ink"])
    T(d, (64, 306), t["value2"], v2, s["ink"])

    sub = fitted_width(d, t["subtitle"], ui, 25, 736, floor=18)
    T(d, (64, 352), t["subtitle"], sub, s["sub"])

    meta1 = fitted_width(d, t["meta1"], ui if zh else mono, 20, 700, floor=14)
    meta2 = fitted_width(d, t["meta2"], ui if zh else mono, 20, 720, floor=14)
    T(d, (64, 394), t["meta1"], meta1, s["faint"])
    T(d, (64, 420), t["meta2"], meta2, s["faint"])

    d.line((64, 460, 800, 460), fill=s["hairline"], width=1)
    d.ellipse((64, 493, 74, 503), fill=s["accent"])
    T(d, (86, 498), "PerryLink · github.com/PerryLink/dsh-output-styles",
      F(ui if zh else mono, 20), s["sub"])

    # ---- card A: prompt assembly stack ----------------------------------
    T(d, (882, 112), t["card_a"], F(ui_bold, 19), s["ink"], "lm")
    T(d, (1360, 112), "systemPrompt", F(mono, 12), s["faint"], "rm")

    for i, (order, name) in enumerate(BANDS):
        y = 134 + i * 72
        active = i == 1
        d.rounded_rectangle((882, y, 1358, y + 62), radius=16,
                            fill=s["accent"] if active else s["card_alt"])
        d.rounded_rectangle((892, y + 19, 956, y + 43), radius=12,
                            fill=s["band_pill"] if active else s["pill"])
        T(d, (924, y + 31), order, F(mono, 12),
          s["band_pill_text"] if active else s["faint"], "mm")
        T(d, (972, y + 24), name, F("en_bold", 18),
          s["on_accent"] if active else s["ink"], "lm")
        subline = (t["band1"], t["band2"], t["band3"])[i]
        sub_font = fitted_width(d, subline, ui, 13, 372, floor=10)
        T(d, (972, y + 47), subline, sub_font,
          s["band_sub"] if active else s["sub"], "lm")

    T(d, (882, 362), t["card_a_foot"], F(ui if zh else mono, 11), s["faint"], "lm")

    # ---- card B: the library rail ---------------------------------------
    T(d, (882, 424), t["card_b"], F(ui_bold, 18), s["ink"], "lm")
    T(d, (1360, 424), "styles/*.md", F(mono, 12), s["faint"], "rm")
    for i, name in enumerate(STYLE_NAMES):
        col, row = i % 3, i // 3
        x = 882 + col * 160
        y = 440 + row * 42
        active = i == 0
        d.rounded_rectangle((x, y, x + 148, y + 34), radius=17,
                            fill=s["accent"] if active else s["card_alt"],
                            outline=None if active else s["line"], width=1)
        T(d, (x + 74, y + 17), name, F(mono, 14 if len(name) < 12 else 13),
          s["on_accent"] if active else s["sub"], "mm")
    T(d, (882, 536), t["card_b_foot"], F(mono, 12), s["faint"], "lm")

    mask = Image.new("L", (HERO_W, HERO_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, HERO_W - 1, HERO_H - 1), radius=26, fill=255)
    img.putalpha(mask)
    return img


# ---------------------------------------------------------------------------
# Flow v5 — two swimlanes over one shared library, one audit baseline
# ---------------------------------------------------------------------------
MONO = "'Consolas','SFMono-Regular',ui-monospace,monospace"
UI = "'Segoe UI','Microsoft YaHei',ui-sans-serif,system-ui,sans-serif"

WIDE = {"·": 0.5, "→": 1.0, "⇒": 1.0, "‖": 1.0, "①": 1.0, "②": 1.0,
        "—": 1.0, "≤": 0.62, "≥": 0.62, "×": 0.65, "✓": 1.0, "…": 1.0,
        "–": 0.62, "＋": 1.0}


def est_width(s: str, size: float, mono: bool) -> float:
    """Conservative text-width estimate (CJK/full-width counts as one em)."""
    total = 0.0
    for ch in s:
        if ord(ch) > 0x2E80:
            total += size
        elif ch in WIDE:
            total += size * WIDE[ch]
        else:
            total += size * (0.60 if mono else 0.55)
    return total


class Svg:
    """Small SVG writer: rounded boxes, baseline text, checked widths."""

    def __init__(self, skin_name: str) -> None:
        self.s = SKIN[skin_name]
        self.skin = skin_name
        self.parts: list[str] = []
        self.checks: list[tuple[str, float, float]] = []

    def rect(self, x: float, y: float, w: float, h: float, r: float,
             fill: str, stroke: str | None = None, sw: float = 1.2,
             dash: str | None = None,
             fill_opacity: float | None = None) -> None:
        attrs = [f'x="{x}"', f'y="{y}"', f'width="{w}"', f'height="{h}"',
                 f'rx="{r}"', f'fill="{fill}"']
        if fill_opacity is not None:
            attrs.append(f'fill-opacity="{fill_opacity}"')
        if stroke:
            attrs += [f'stroke="{stroke}"', f'stroke-width="{sw}"']
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        self.parts.append(f'<rect {" ".join(attrs)}/>')

    def text(self, x: float, y: float, s: str, size: float, fill: str,
             weight: str = "400", mono: bool = True, anchor: str = "start",
             width: float | None = None) -> None:
        if width is not None:
            self.checks.append((s, est_width(s, size, mono), width))
        attrs = [f'x="{x}"', f'y="{y}"', f'fill="{fill}"',
                 f'font-size="{size}"', f'font-weight="{weight}"',
                 f'font-family="{MONO if mono else UI}"']
        if anchor != "start":
            attrs.append(f'text-anchor="{anchor}"')
        self.parts.append(f'<text {" ".join(attrs)}>{escape(s)}</text>')

    def rotated(self, x: float, y: float, s: str, size: float, fill: str,
                angle: float = -90) -> None:
        self.parts.append(
            f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" '
            f'font-family="{MONO}" text-anchor="middle" '
            f'transform="rotate({angle} {x} {y})">{escape(s)}</text>')

    def line(self, x1: float, y1: float, x2: float, y2: float, stroke: str,
             sw: float = 1.2, dash: str | None = None,
             marker: str | None = None) -> None:
        attrs = [f'x1="{x1}"', f'y1="{y1}"', f'x2="{x2}"', f'y2="{y2}"',
                 f'stroke="{stroke}"', f'stroke-width="{sw}"',
                 'stroke-linecap="round"']
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if marker:
            attrs.append(f'marker-end="url(#{marker})"')
        self.parts.append(f'<line {" ".join(attrs)}/>')

    def path(self, cmds: str, stroke: str, sw: float = 1.2,
             dash: str | None = None, marker: str | None = None) -> None:
        attrs = [f'd="{cmds}"', 'fill="none"', f'stroke="{stroke}"',
                 f'stroke-width="{sw}"', 'stroke-linecap="round"',
                 'stroke-linejoin="round"']
        if dash:
            attrs.append(f'stroke-dasharray="{dash}"')
        if marker:
            attrs.append(f'marker-end="url(#{marker})"')
        self.parts.append(f'<path {" ".join(attrs)}/>')

    def circle(self, cx: float, cy: float, r: float, fill: str) -> None:
        self.parts.append(
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>')

    # -- composite pieces -------------------------------------------------
    def card(self, x: float, y: float, w: float, h: float, r: float = 14,
             fill: str | None = None, stroke: str | None = None,
             dash: str | None = None) -> None:
        self.rect(x, y, w, h, r, fill or self.s["card"],
                  stroke or self.s["line"], 1.2, dash)

    def note(self, x: float, y: float, s: str, fill: str | None = None,
             width: float = 244, size: float = 11) -> None:
        self.text(x, y, s, size, fill or self.s["sub"], mono=False,
                  width=width)

    def render(self) -> str:
        s = self.s
        style = (
            f".h1{{font-family:{UI};font-size:29px;font-weight:700;fill:{s['ink']}}}"
            f".sub{{font-family:{UI};font-size:13px;fill:{s['sub']}}}"
        )
        head = [
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{FLOW_W}" '
            f'height="{FLOW_H}" viewBox="0 0 {FLOW_W} {FLOW_H}" role="img" '
            f'aria-label="dsh-output-styles structure: one style library, a '
            f'prompt-injection lane (selection, priority ladder, section at '
            f'order 90, model request) and a render/export lane (transcript, '
            f'output.render/before waterfall, rule table, presenter, '
            f'RenderedText), both closing on a session-log audit baseline">',
            '<title>dsh-output-styles structure</title>',
            '<defs>'
            f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{s["bg0"]}"/>'
            f'<stop offset="1" stop-color="{s["bg1"]}"/></linearGradient>'
            '<filter id="soft" x="-20%" y="-20%" width="140%" height="150%">'
            '<feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#0b1220" '
            f'flood-opacity="{0.10 if self.skin == "light" else 0.34}"/>'
            '</filter>'
            '<marker id="aSub" viewBox="0 0 10 10" refX="8" refY="5" '
            'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M0 0 L10 5 L0 10 z" fill="{s["sub"]}"/></marker>'
            '<marker id="aAcc" viewBox="0 0 10 10" refX="8" refY="5" '
            'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M0 0 L10 5 L0 10 z" fill="{s["accent"]}"/></marker>'
            '</defs>',
            f'<rect width="{FLOW_W}" height="{FLOW_H}" fill="url(#bg)"/>',
            f'<style>{style}</style>',
        ]
        return "\n".join(head + self.parts + ["</svg>"]) + "\n"


def flow(skin_name: str) -> str:
    s = SKIN[skin_name]
    g = Svg(skin_name)
    a, ink, sub, faint = s["accent"], s["ink"], s["sub"], s["faint"]
    soft, line, alt = s["accent_soft"], s["line"], s["card_alt"]

    # ---- header ---------------------------------------------------------
    g.text(40, 50, "DSH PLUGIN · OUTPUT STYLES", 11, faint, "600", True,
           width=360)
    g.text(40, 88, "Pick once, inject every assembly, render every export",
           29, ink, "700", False, width=1020)
    g.text(40, 112, "Six Markdown styles form one library: the selection "
           "becomes a prompt section at order 90; rules and presenters "
           "render exports.", 13, sub, "400", False, width=1020)
    g.line(40, 128, 1060, 128, line, 1)

    # ---- shared style library -------------------------------------------
    g.card(40, 144, 240, 432, 18)
    g.text(58, 172, "STYLE LIBRARY", 11, faint, "600", True, width=196)
    g.note(58, 194, "one definition, both lanes", width=196)

    chip_w, chip_h = 100, 26
    for i, name in enumerate(STYLE_NAMES):
        col, row = i % 2, i // 2
        x = 58 + col * (chip_w + 4)
        y = 210 + row * 32
        active = i == 0
        g.rect(x, y, chip_w, chip_h, 13, a if active else alt,
               None if active else line, 1.1)
        g.text(x + chip_w / 2, y + 17, name, 13,
               s["on_accent"] if active else sub, "600", False, "middle",
               width=chip_w - 8)

    g.line(58, 316, 258, 316, line, 1)
    g.note(58, 338, "load order · later wins", width=196)
    layers = [("stylesDir[n] · yours", "top"),
              ("stylesDir[1] · yours", ""),
              ("styles/ · bundled", "low")]
    for i, (label, tag) in enumerate(layers):
        y = 350 + i * 28
        g.rect(58, y, 200, 24, 8, soft if i == 0 else alt, line, 1.1)
        g.text(68, y + 16, label, 11, ink if i == 0 else sub, "400", True,
               width=140)
        if tag:
            g.text(248, y + 16, tag, 10.5, faint, "400", True, "end")
    g.note(58, 452, "+ outputStyles JSON · compatJson", width=202)
    g.line(58, 466, 258, 466, line, 1)
    for i, label in enumerate(["name · description", "whenToUse",
                               "keep-coding-instructions",
                               "force-for-plugin ≤ 1",
                               "watchStyles · hot reload"]):
        g.text(58, 486 + i * 18, label, 11, faint, "400", True, width=196)

    # distribution bus: the one library feeds both lanes
    g.line(286, 202, 286, 446, s["accent_line"], 1.4, "3 4")
    g.line(280, 202, 288, 202, s["accent_line"], 1.4, "3 4")
    g.line(280, 446, 288, 446, s["accent_line"], 1.4, "3 4")
    g.circle(286, 202, 3, a)
    g.circle(286, 446, 3, a)

    # ---- lane 1: prompt injection ---------------------------------------
    g.rect(288, 144, 772, 236, 18, s["lane_fill"], s["lane_line"], 1.3)
    g.rect(296, 152, 4, 14, 2, a)
    g.text(308, 166, "PROMPT CHANNEL", 11, faint, "600", True, width=200)
    g.text(1060, 166, "systemPrompt.section() · order 90", 11, faint, "400",
           True, "end")

    # S1 — command and the durable selection
    g.card(296, 178, 172, 48)
    g.text(312, 199, "/style <name>", 13, ink, "600", True, width=146)
    g.note(312, 217, "durable write", width=146)
    g.line(382, 226, 382, 244, sub, 1.3, marker="aSub")
    g.card(296, 244, 172, 48)
    g.text(312, 265, "output_style", 13, ink, "600", True, width=146)
    g.note(312, 283, "keyed by sessionId", width=146)
    g.text(296, 312, "survives restart", 11, faint, "400", False, width=172)
    g.text(296, 330, "command/run logs input", 11, faint, "400", False,
           width=172)

    # S2 — the resolution ladder and its injection point
    g.card(490, 178, 276, 120)
    g.note(506, 200, "effectiveStyle() · first match wins", width=244)
    ladder = [("force-for-plugin", "forced"), ("session selection", "selected"),
              ("defaultStyle", "project")]
    for i, (label, tag) in enumerate(ladder):
        x = 502 + i * 8
        y = 206 + i * 26
        active = i == 1
        g.rect(x, y, 226, 24, 8, a if active else alt,
               None if active else line, 1.1, None if active else "4 3")
        g.text(x + 10, y + 16, label, 13,
               s["on_accent"] if active else sub,
               "600" if active else "400", True, width=150)
        g.text(x + 216, y + 16, tag, 11,
               s["on_accent"] if active else faint, "400", False, "end",
               width=56)
    g.line(628, 298, 628, 306, a, 1.4, marker="aAcc")
    # convergence rail: resolved style -> injected section -> request/record
    g.rect(490, 306, 570, 40, 14, s["card"], line, 1.2)
    g.text(506, 331, "systemPrompt.section()", 13, ink, "600", True,
           width=180)
    g.rect(694, 314, 74, 22, 11, soft, s["accent_line"], 1.2)
    g.text(731, 329, "order 90", 11, s["accent_ink"], "600", True,
           "middle", width=64)
    g.line(778, 326, 800, 326, a, 1.4, marker="aAcc")
    g.text(810, 331, "model request", 13, ink, "700", False, width=96)
    g.text(912, 331, "→ system/message", 11, faint, "400", True, width=118)
    g.text(490, 366, "maxStyleChars 4000 · [style truncated]", 11, faint,
           "400", True, width=276)

    # coexistence caution: this is the one branch that skips the rail
    g.card(790, 178, 270, 92, 12, alt, s["accent_line"], "5 4")
    g.text(806, 200, "degraded coexistence", 11, s["accent_ink"], "600",
           True, width=238)
    g.note(806, 222, "core outputStyles present", width=238)
    g.note(806, 240, "→ injection skipped", width=238)
    g.text(806, 258, "promptInjection: disabled", 11, faint, "400", True,
           width=238)
    g.line(1030, 272, 1030, 302, sub, 1.2, "4 3", "aSub")

    # ---- lane 2: render / export ---------------------------------------
    g.rect(288, 388, 772, 194, 18, s["lane_fill"], s["lane_line"], 1.3)
    g.rect(296, 396, 4, 14, 2, a)
    g.text(308, 410, "RENDER / EXPORT CHANNEL", 11, faint, "600", True,
           width=260)
    g.text(1060, 410, "output.render.* · /transcript · md | html", 11,
           faint, "400", True, "end")

    g.card(296, 418, 172, 48)
    g.text(312, 439, "/transcript", 13, ink, "600", True, width=146)
    g.note(312, 457, "md | html", width=146)
    g.rect(296, 474, 172, 28, 10, alt, line, 1.1, "4 3")
    g.text(382, 492, "--renderer=<id>", 13, sub, "400", True, "middle",
           width=150)
    g.text(296, 526, "skips rules · explicit", 11, faint, "400", False,
           width=172)

    # pipeline card
    g.card(490, 418, 276, 154)
    g.note(506, 436, "output.render.* · rules first hit wins", width=244)
    g.rect(506, 444, 244, 34, 8, alt, line, 1.1)
    g.text(516, 458, "output.render/before", 13, ink, "600", True,
           width=222)
    g.text(516, 471, "every listener must call next()", 11, faint, "400",
           False, width=222)
    g.line(628, 478, 628, 486, sub, 1.2, marker="aSub")
    rows = [("match.tool", "bash"), ("match.contentType", "html"),
            ("match.session", "<sid>")]
    for i, (key, value) in enumerate(rows):
        top = 490 + i * 16
        if i == 0:
            g.rect(506, top, 244, 15, 4, soft)
            g.rect(506, top, 3, 15, 1.5, a)
        g.text(518, top + 11, key, 12, ink if i == 0 else sub, "400", True,
               width=156)
        g.text(740, top + 11, value, 11, ink if i == 0 else faint, "400",
               True, "end", width=64)
    g.rect(506, 542, 244, 24, 8, soft, s["accent_line"], 1.2)
    g.text(516, 558, "presenter(text, ctx)", 13, ink, "600", True,
           width=190)
    g.text(740, 558, "pure", 11, s["accent_ink"], "400", False, "end")

    # result, payload, write gate
    g.path("M750 554 H776 V446 H788", s["accent_line"], 1.3, "5 4", "aAcc")
    g.card(790, 418, 270, 56)
    g.text(806, 444, "{ original, rendered }", 13, ink, "600", True,
           width=238)
    g.note(806, 462, "changed · rendererId", width=238)
    for label, x in (("md", 790), ("html", 878)):
        g.rect(x, 482, 80, 28, 14, alt, line, 1.1)
        g.text(x + 40, 500, label, 13, ink, "600", True, "middle")
    g.path("M918 510 V516", line, 1.2, "3 3", "aSub")
    g.card(790, 516, 270, 44, 10, alt, s["accent_line"], "5 4")
    g.text(806, 535, "--save: sanitizeText → approval", 11, ink, "400",
           True, width=238)
    g.text(806, 552, "missing approval → no write", 11, faint, "400", False,
           width=238)

    # ---- audit baseline -------------------------------------------------
    g.rect(40, 592, 1036, 36, 12, soft, s["accent_line"], 1.2)
    g.circle(62, 610, 4, a)
    g.text(76, 614, "SESSION LOG", 11.5, s["accent_ink"], "600", True,
           width=106)
    g.text(186, 614, "→ model-visible is reconstructable · command/run · "
           "system/message · original kept", 11, sub, "400", True,
           width=660)
    g.text(1056, 614, "{ kind: 'dsh-output-styles' }", 11, faint, "400",
           True, "end")

    for text, est, width in g.checks:
        if est > width + 0.5:
            raise SystemExit(
                f"FATAL: flow text overflows by {est - width:.1f}px "
                f"({est:.1f}>{width}): {text!r}")
    return g.render()


# ---------------------------------------------------------------------------
def main() -> None:
    os.makedirs(OUT, exist_ok=True)

    for lang in ("zh", "en"):
        for skin_name in ("light", "dark"):
            path = os.path.join(
                OUT, f"dsh-output-styles-hero-{lang}-{skin_name}.webp")
            image = hero(lang, skin_name)
            if image.size != (HERO_W, HERO_H):
                raise SystemExit(f"FATAL: {path} is {image.size}")
            image.save(path, "WEBP", quality=92, method=6)
            print(f"wrote {os.path.basename(path)} ({HERO_W}x{HERO_H})")

    for skin_name in ("light", "dark"):
        path = os.path.join(
            OUT, f"dsh-output-styles-flow-v5-{skin_name}.svg")
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(flow(skin_name))
        print(f"wrote {os.path.basename(path)} ({FLOW_W}x{FLOW_H})")

    # Display-size gate: GitHub shows a 1440-wide hero at ~880 CSS px.
    for label, size, floor in (("hero title", 84, 48),
                               ("hero subtitle", 25, 15),
                               ("hero meta", 20, 12)):
        shown = size * 880 / HERO_W
        if shown < floor:
            raise SystemExit(f"FATAL: {label} renders {shown:.1f}px at 880w")
        print(f"check {label}: {shown:.1f}px at 880w (min {floor})")


if __name__ == "__main__":
    main()
