// Verification helper: load the two newest real session logs through the
// harness's own persistence packages and print the model-visible style
// evidence (request/header system text + the durable selection record).
import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import * as persistenceJsonl from '@deepseek-ai/dsh-session-persistence-jsonl'

const require = createRequire(import.meta.url)
const sessionsRoot = join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.dsh', 'sessions')
const storageRoot = join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.dsh', 'storages')

const ctx = new Context()
await ctx.plugin(SessionStore)
await ctx.plugin(persistenceJsonl.default ?? persistenceJsonl, { root: sessionsRoot })

const headers = await ctx.sessionPersistence.list()
headers.sort((a, b) => b.createdAt - a.createdAt)

for (const header of headers.slice(0, 2)) {
  const inspection = await ctx.sessionPersistence.inspect(header.id)
  const events = inspection.events
  const requestHeaders = events.filter(event => event.type === 'request/header')
  const last = requestHeaders.at(-1)
  const system = last?.type === 'request/header' ? last.data.header.system ?? '' : ''
  console.log(`== session ${header.id} (${events.length} events, ${requestHeaders.length} request/header) ==`)
  console.log(`request/header logged before dispatch: ${last !== undefined}`)
  console.log(`style heading in logged system prompt: ${system.includes('# Output style: concise')}`)
  console.log(`style body in logged system prompt: ${system.includes('保持简洁')}`)
  if (system.includes('# Output style:')) {
    const start = system.indexOf('# Output style:')
    console.log(`--- system prompt style excerpt ---\n${system.slice(start, start + 240)}`)
  }
}

// Durable selection record check: the output_style domain unit file under
// $DSH_HOME/storages is a human-readable JSON whole-file per unit.
try {
  for (const entry of readdirSync(storageRoot)) {
    if (entry !== 'output_style') continue
    for (const file of readdirSync(join(storageRoot, entry))) {
      const unit = JSON.parse(readFileSync(join(storageRoot, entry, file), 'utf8'))
      console.log(`== storage unit ${entry}/${file} ==`)
      console.log(JSON.stringify(unit, null, 2).slice(0, 800))
    }
  }
} catch (error) {
  console.log(`storage root read skipped: ${error.message}`)
}
void require
