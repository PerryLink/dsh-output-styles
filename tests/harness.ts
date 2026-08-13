import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Fiber } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import type { CommandExecution } from '@deepseek-ai/dsh-commands'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import StorageService from '@deepseek-ai/dsh-storage'
import * as storageDomain from '@deepseek-ai/dsh-storage-domain'
import * as storageJson from '@deepseek-ai/dsh-storage-json'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import * as outputStyles from '../src/index.ts'

/** One composed test application: host services from the published rc.6 packages plus this plugin. */
export interface StyleHarness {
  ctx: Context
  /** The plugin's own fiber; disposing it simulates a config hot-reload. */
  pluginFiber: Fiber
  storageRoot: string
  makeSession(id?: string): Session
  agentFor(session: Session): Agent
  /** Execute one `/style` line against a session through the real command registry. */
  runStyle(session: Session, line: string): Promise<CommandExecution | undefined>
  /** Assemble the system prompt for a session and return this plugin's section text. */
  sectionText(session: Session): Promise<string>
  /** Dispose the plugin fiber and clean the storage root. */
  dispose(): Promise<void>
}

/**
 * Compose the host capability seam plus this plugin over a fresh context and
 * a temporary json storage root.
 * @param config - plugin configuration (defaults for omitted fields).
 * @param stylesDir - style library directory; the package default when omitted.
 * @returns the live harness.
 */
export async function createStyleHarness(
  config: outputStyles.Config = {},
  stylesDir?: string,
): Promise<StyleHarness> {
  const ctx = new Context()
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-output-styles-'))
  await ctx.plugin(SessionStore)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(CommandRuntime)
  await ctx.plugin(StorageService)
  await ctx.plugin(storageJson, { root: storageRoot })
  await ctx.plugin(storageDomain, { backend: 'json' })
  await ctx.plugin(SessionProjectionRegistry)
  const pluginFiber = await ctx.plugin(outputStyles, { stylesDir: stylesDir ?? '', ...config })

  const makeSession = (id?: string): Session => ctx.sessions.create(
    id === undefined ? undefined : SessionId(id),
  )
  const agentFor = (session: Session): Agent => ({ session } as unknown as Agent)
  const runStyle = (session: Session, line: string): Promise<CommandExecution | undefined> =>
    ctx.commands.execute(agentFor(session), line, new AbortController().signal)
  const sectionText = async (session: Session): Promise<string> => {
    const assembly = await ctx.systemPrompt.assemble({ agent: agentFor(session) })
    return assembly.sections.find(section => section.name === outputStyles.STYLE_SECTION_NAME)?.text ?? ''
  }

  return {
    ctx,
    pluginFiber,
    storageRoot,
    makeSession,
    agentFor,
    runStyle,
    sectionText,
    async dispose(): Promise<void> {
      try {
        await pluginFiber.dispose()
      } finally {
        rmSync(storageRoot, { recursive: true, force: true, maxRetries: 3 })
      }
    },
  }
}

/** Write a style library into a fresh temporary directory. */
export function makeStyleDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-output-styles-lib-'))
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(join(dir, file), content, 'utf8')
  }
  return dir
}
