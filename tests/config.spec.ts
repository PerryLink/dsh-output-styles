import { describe, expect, it } from 'vitest'
import { resolveConfig, Config } from '../src/config.ts'

describe('Config schema', () => {
  it('fills every default when the composition supplies nothing', () => {
    expect(Config({})).toEqual({
      stylesDir: [],
      maxStyleChars: 4000,
      defaultStyle: '',
      compatJson: true,
      sectionOrder: 90,
      truncationMarker: '\n\n[style truncated]',
      includeBuiltins: true,
      watchStyles: true,
      rules: [],
      enableExport: true,
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

  it('passes a bare string stylesDir through; resolveConfig normalizes it to a list', () => {
    expect(Config({ stylesDir: './my-styles' })).toMatchObject({ stylesDir: './my-styles' })
    const resolved = resolveConfig({ stylesDir: './my-styles' }, 'package/styles')
    expect(resolved.stylesDirs).toHaveLength(2)
    expect(resolved.stylesDirs[1]).toMatch(/[\\/]my-styles$/)
  })
})

describe('resolveConfig', () => {
  it('resolves no custom directories to the bundled library alone', () => {
    const resolved = resolveConfig({}, 'package/styles')
    expect(resolved).toEqual({
      stylesDirs: ['package/styles'],
      maxStyleChars: 4000,
      defaultStyle: '',
      compatJson: true,
      sectionOrder: 90,
      truncationMarker: '\n\n[style truncated]',
      includeBuiltins: true,
      watchStyles: true,
      rules: [],
      enableExport: true,
    })
  })

  it('resolves custom directories against the working directory, lowest priority first', () => {
    const resolved = resolveConfig({ stylesDir: ['./my-styles', '../team-styles'] }, 'package/styles')
    expect(resolved.stylesDirs).toHaveLength(3)
    expect(resolved.stylesDirs[0]).toBe('package/styles')
    expect(resolved.stylesDirs[1]).toMatch(/[\\/]my-styles$/)
    expect(resolved.stylesDirs[2]).toMatch(/[\\/]team-styles$/)
  })

  it('drops the bundled directory when includeBuiltins is false', () => {
    const resolved = resolveConfig({ includeBuiltins: false }, 'package/styles')
    expect(resolved.stylesDirs).toEqual([])
  })

  it('fails loud on a non-finite section order for direct callers', () => {
    expect(() => resolveConfig({ sectionOrder: Number.NaN }, 'styles')).toThrow(/sectionOrder/)
  })
})
