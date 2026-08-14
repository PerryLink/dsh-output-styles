/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'option.off': '关闭（默认）',
  'option.offDetail': '恢复项目默认输出风格',
} satisfies Record<string, string>

/** The style picker namespace key union. */
export type StyleKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'option.off': 'Off (default)',
  'option.offDetail': 'Restore the project default output style',
} satisfies Record<StyleKey, string>
