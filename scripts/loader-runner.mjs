// scripts/loader-runner.mjs — real Loader composition runner for
// dsh-output-styles (community five-layer model, layer 4). An independent
// process boots a real Context, mounts the vendored Loader with the Include
// builtin, reads the given cordis.yml (service rows for session, system
// prompt, commands, and the routed storage backend, then the plugin row),
// and asserts the plugin's contributions through the authoritative registries
// plus one real behavior: /style switches the bundled `concise` style and the
// assembled system prompt carries the style body. This proves the built entry
// loads under plain Node (A1) and that inject + config resolution worked.
//
// Usage: node scripts/loader-runner.mjs <cordis.yml>
// Exit 0 prints DSH_LOADER_RESULT <json>; any load or assertion failure exits
// non-zero with the reason on stderr (used by the invalid-config and
// default-export regression cases).

import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { SessionId } from '@deepseek-ai/dsh-session'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const configArgument = process.argv[2]
if (configArgument === undefined) {
  console.error('usage: loader-runner.mjs <cordis.yml>')
  process.exit(2)
}

const configPath = resolve(configArgument)
const configRequire = createRequire(resolve(import.meta.dirname, '../package.json'))

const ctx = new Context()
try {
  ctx.baseUrl = `${pathToFileURL(dirname(configPath)).href}/`
  await ctx.plugin(Loader)
  ctx.loader.internal = /** @type {any} */ ({
    version: 'v2',
    async import(specifier) {
      if (specifier.startsWith('file:')) return import(specifier)
      if (specifier.startsWith('node:')) return import(specifier)
      const absolute = /^([a-zA-Z]:)?[\\/]/u.test(specifier)
      return import(pathToFileURL(absolute ? specifier : configRequire.resolve(specifier)).href)
    },
  })
  ctx.loader.builtins.include = Include
  await ctx.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await ctx.loader.await()

  // Authoritative registries carry the plugin's contributions.
  const session = ctx.sessions.create(SessionId('dsh-output-styles-loader-runner'))
  const agent = /** @type {any} */ ({ id: session.id, session, options: {} })
  const commandNames = ctx.commands.list(agent).map(entry => entry.name)
  if (!commandNames.includes('style')) {
    throw new Error(`Loader composition: /style command is missing (commands: ${JSON.stringify(commandNames)})`)
  }

  // Real behavior: /style concise switches the bundled style.
  const execution = await ctx.commands.execute(agent, '/style concise', [], new AbortController().signal)
  if (execution?.result?.text !== 'switched to concise') {
    throw new Error(`Loader composition: /style concise returned ${JSON.stringify(execution?.result)}`)
  }

  // The assembled system prompt carries the model-visible style body.
  const assembly = await ctx.systemPrompt.assemble({ agent })
  const section = assembly.sections.find(entry => entry.name === 'output-style:selection')
  if (section === undefined || !section.text.includes('Output style: concise')) {
    throw new Error(`Loader composition: assembled sections missing the concise style (${JSON.stringify(assembly.sections.map(entry => entry.name))})`)
  }

  const summary = {
    service: 'outputRenderers',
    command: 'style',
    commands: commandNames,
    styleSection: section.name,
    styleApplied: section.text.includes('Output style: concise'),
  }
  process.stdout.write(`DSH_LOADER_RESULT ${JSON.stringify(summary)}\n`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
} finally {
  await ctx.fiber.dispose()
}
