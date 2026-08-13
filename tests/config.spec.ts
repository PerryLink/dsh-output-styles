import { describe, expect, it } from 'vitest'
import { resolveConfig, Config } from '../src/config.ts'

describe('Config schema', () => {
  it('fills every default when the composition supplies nothing', () => {
    expect(Config({})).toEqual({
      stylesDir: '',
      maxStyleChars: 4000,
      defaultStyle: '',
      compatJson: true,
      sectionOrder: 90,
      truncationMarker: '\n\n[style truncated]',
    })
  })

  it('fails loud on a non-positive style budget', () => {
    expect(() => Config({ maxStyleChars: 0 })).toThrow()
    expect(() => Config({ maxStyleChars: -5 })).toThrow()
  })

  it('accepts deployment values', () => {
    expect(Config({ maxStyleChars: 8000, defaultStyle: 'concise', compatJson: false })).toMatchObject({
      maxStyleChars: 8000,
      defaultStyle: 'concise',
      compatJson: false,
    })
  })
})

describe('resolveConfig', () => {
  it('resolves the empty stylesDir to the package default directory', () => {
    const resolved = resolveConfig({}, 'package/styles')
    expect(resolved).toEqual({
      stylesDir: 'package/styles',
      maxStyleChars: 4000,
      defaultStyle: '',
      compatJson: true,
      sectionOrder: 90,
      truncationMarker: '\n\n[style truncated]',
    })
  })

  it('resolves an explicit stylesDir against the working directory', () => {
    const resolved = resolveConfig({ stylesDir: './my-styles' }, 'package/styles')
    expect(resolved.stylesDir).toMatch(/[\\/]my-styles$/)
  })

  it('fails loud on a non-finite section order for direct callers', () => {
    expect(() => resolveConfig({ sectionOrder: Number.NaN }, 'styles')).toThrow(/sectionOrder/)
  })
})
