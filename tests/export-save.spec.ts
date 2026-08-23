import { describe, expect, it } from 'vitest'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { parseExportInput, saveExportFile, type ExportApproval } from '../src/runtime.ts'
import { createStyleHarness, FakeApproval, FakeFileSystem } from './harness.ts'

describe('parseExportInput --save', () => {
  it('accepts md as a markdown alias and parses every --save form', () => {
    expect(parseExportInput('md')).toEqual({ kind: 'ok', format: 'markdown' })
    expect(parseExportInput('md --save out.md')).toEqual({ kind: 'ok', format: 'markdown', save: 'out.md' })
    expect(parseExportInput('html --save=out.html')).toEqual({ kind: 'ok', format: 'html', save: 'out.html' })
    expect(parseExportInput('markdown --renderer=concise --save out.md')).toEqual({ kind: 'ok', format: 'markdown', renderer: 'concise', save: 'out.md' })
  })

  it('rejects a bare --save without a path', () => {
    expect(parseExportInput('--save')).toEqual({ kind: 'error' })
    expect(parseExportInput('markdown --save')).toEqual({ kind: 'error' })
  })
})

describe('saveExportFile fail-closed matrix', () => {
  it('denies when no approval service is composed', async () => {
    const result = await saveExportFile(new FakeFileSystem(), undefined, {}, 'out.md', 'content')
    expect(result).toMatchObject({ kind: 'error', code: 'approval-unavailable' })
  })

  it('denies on rejected, cancelled, and unavailable outcomes', async () => {
    for (const [outcome, code] of [['rejected', 'approval-denied'], ['cancelled', 'approval-cancelled'], ['unavailable', 'approval-unavailable']] as const) {
      const result = await saveExportFile(new FakeFileSystem(), new FakeApproval(outcome), {}, 'out.md', 'content')
      expect(result).toMatchObject({ kind: 'error', code })
    }
  })

  it('fails closed when the approval channel throws', async () => {
    const throwing: ExportApproval = {
      async request() {
        throw new Error('outside an open turn')
      },
    }
    const result = await saveExportFile(new FakeFileSystem(), throwing, {}, 'out.md', 'content')
    expect(result).toMatchObject({ kind: 'error', code: 'approval-unavailable' })
  })

  it('fails loudly when approval grants but no fs service is composed', async () => {
    const result = await saveExportFile(undefined, new FakeApproval('allowed-once'), {}, 'out.md', 'content')
    expect(result).toMatchObject({ kind: 'error', code: 'fs-unavailable' })
  })

  it('writes the exact caller-supplied content after approval', async () => {
    const fs = new FakeFileSystem()
    const result = await saveExportFile(fs, new FakeApproval('allowed-once'), {}, 'out.md', 'escaped <content>')
    expect(result).toMatchObject({ kind: 'written', path: 'out.md' })
    expect(fs.read('out.md')).toBe('escaped <content>')
  })
})

describe('/export --save integration', () => {
  it('keeps the no-argument export as unsanitized output text (backward compatible)', async () => {
    const harness = await createStyleHarness()
    const session = harness.makeSession()
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: '<script>alert("x")</script>' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    const execution = await harness.runExport(session, '/export md')
    expect(execution?.result).toMatchObject({ kind: 'success' })
    expect(execution?.result.text).toContain('## User')
    expect(execution?.result.text).toContain('<script>alert("x")</script>')
    await harness.dispose()
  })

  it('writes the sanitized document only after approval', async () => {
    const fs = new FakeFileSystem()
    const harness = await createStyleHarness({}, undefined, { fs, approval: new FakeApproval('allowed-once') })
    const session = harness.makeSession()
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: '<script>alert("x")</script>' }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    const execution = await harness.runExport(session, '/export md --save out.md')
    expect(execution?.result).toMatchObject({ kind: 'success', text: 'saved markdown export to out.md' })
    const written = fs.read('out.md')
    expect(written).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(written).not.toContain('<script>')
    await harness.dispose()
  })

  it('denies the write when the approval service rejects', async () => {
    const fs = new FakeFileSystem()
    const harness = await createStyleHarness({}, undefined, { fs, approval: new FakeApproval('rejected') })
    const session = harness.makeSession()
    const execution = await harness.runExport(session, '/export md --save out.md')
    expect(execution?.result).toMatchObject({ kind: 'error', text: expect.stringContaining('rejected') })
    expect(fs.written.has('out.md')).toBe(false)
    await harness.dispose()
  })

  it('denies the write when no approval service is composed', async () => {
    const fs = new FakeFileSystem()
    const harness = await createStyleHarness({}, undefined, { fs })
    const session = harness.makeSession()
    const execution = await harness.runExport(session, '/export md --save out.md')
    expect(execution?.result).toMatchObject({ kind: 'error', text: expect.stringContaining('approval service') })
    expect(fs.written.has('out.md')).toBe(false)
    await harness.dispose()
  })

  it('fails loudly when approval grants but no fs service is composed', async () => {
    const harness = await createStyleHarness({}, undefined, { approval: new FakeApproval('allowed-once') })
    const session = harness.makeSession()
    const execution = await harness.runExport(session, '/export md --save out.md')
    expect(execution?.result).toMatchObject({ kind: 'error', text: expect.stringContaining('fs service') })
    await harness.dispose()
  })
})
