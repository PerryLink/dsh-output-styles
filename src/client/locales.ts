/**
 * Simplified Chinese dictionary (the key-set source of truth).
 *
 * Only `zh` and `en` are shipped: the DSH Web locale system (dsh-client-locale
 * rc.6) exposes exactly the `zh`/`en` locale pair in its settings row, so
 * further dictionaries would be dead weight the framework can never select.
 * When a future harness release ships more locales, extend this pair.
 */
export const zh = {
  'option.off': '关闭（默认）',
  'option.offDetail': '恢复项目默认输出风格',
  'option.injectionDisabled': '核心 outputStyles 已接管，本插件的提示词注入不可用',
} satisfies Record<string, string>

/** The style picker namespace key union. */
export type StyleKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'option.off': 'Off (default)',
  'option.offDetail': 'Restore the project default output style',
  'option.injectionDisabled': "Core outputStyles is active; this plugin's prompt injection is disabled",
} satisfies Record<StyleKey, string>
