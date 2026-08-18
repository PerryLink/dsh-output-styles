/**
 * Real Loader composition suite (community five-layer model, layer 4): an
 * independent process mounts the Loader over a cordis.yml with the real
 * session/system-prompt/commands/storage service rows + the plugin row,
 * proving the BUILT entry loads under plain Node (A1) and that inject +
 * config resolution + the routed storage backend all work. Also carries the
 * Schemastery negative regression: an invalid config must fail loud for the
 * expected reason.
 *
 * @module dsh-output-styles/test/composition.spec
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const runner = join(repositoryRoot, 'scripts', 'loader-runner.mjs')
const builtEntry = join(repositoryRoot, 'lib', 'index.js')
const builtUrl = pathToFileURL(builtEntry).href

/** One cordis.yml: the storage seam, the prompt/commands services, then the plugin row. */
function configFor(pluginRow: string, storageRoot: string, configLines: string[] = []): string {
  return [
    "- name: '@deepseek-ai/dsh-session'",
    "- name: '@deepseek-ai/dsh-system-prompt'",
    "- name: '@deepseek-ai/dsh-commands'",
    "- name: '@deepseek-ai/dsh-storage'",
    "- name: '@deepseek-ai/dsh-storage-json'",
    '  config:',
    `    root: ${JSON.stringify(storageRoot)}`,
    "- name: '@deepseek-ai/dsh-storage-domain'",
    '  config:',
    '    backend: json',
    `- name: ${JSON.stringify(pluginRow)}`,
    ...(configLines.length > 0 ? ['  config:', ...configLines.map(line => `    ${line}`)] : []),
    '',
  ].join('\n')
}

function runRunner(configPath: string) {
  const result = spawnSync(process.execPath, [runner, configPath], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env },
    timeout: 120_000,
  })
  if (result.error !== undefined) throw result.error
  return { status: result.status, stdout: result.stdout, stderr: result.stderr }
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'dsh-output-styles-loader-'))

beforeAll(() => {
  const build = spawnSync('pnpm', ['run', 'build'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env },
    shell: process.platform === 'win32',
    timeout: 120_000,
  })
  if (build.status !== 0) {
    throw new Error(`build failed (${String(build.status)}):\n${build.stdout}\n${build.stderr}`)
  }
}, 120_000)

afterAll(() => {
  rmSync(temporaryRoot, { recursive: true, force: true })
})

describe('Loader composition', () => {
  it('mounts the built plugin and applies /style concise through the real command service', () => {
    const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-output-styles-store-'))
    const configPath = join(temporaryRoot, 'valid.yml')
    writeFileSync(configPath, configFor(builtUrl, storageRoot))
    const evidence = runRunner(configPath)
    expect(evidence.status, `stderr:\n${evidence.stderr}`).toBe(0)
    expect(evidence.stdout).toContain('DSH_LOADER_RESULT')
    const marker = evidence.stdout.match(/DSH_LOADER_RESULT (.+)$/mu)
    const summary = JSON.parse(marker![1]!)
    expect(summary.command).toBe('style')
    expect(summary.commands).toContain('style')
    expect(summary.styleApplied).toBe(true)
    rmSync(storageRoot, { recursive: true, force: true })
  })

  it('fails loud through the Loader for a Schemastery type error', () => {
    const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-output-styles-store-'))
    const configPath = join(temporaryRoot, 'invalid-type.yml')
    writeFileSync(configPath, configFor(builtUrl, storageRoot, ["watchStyles: 'yes'"]))
    const evidence = runRunner(configPath)
    expect(evidence.status).not.toBe(0)
    expect(evidence.stderr).toMatch(/expected boolean/u)
    rmSync(storageRoot, { recursive: true, force: true })
  })
})
