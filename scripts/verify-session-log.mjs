// Verification helper: load the two newest real session logs through the
// harness's own persistence packages and print the model-visible style
// evidence (V3 `system/message` prompt text + the durable selection record).
// The pure shape handling lives in session-log-evidence.mjs so it is unit
// tested without reading any real session log.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import SessionStore from '@deepseek-ai/dsh-session'
import * as persistenceJsonl from '@deepseek-ai/dsh-session-persistence-jsonl'
import { normalizeReadResult, sessionEvidence, storageUnitPaths } from './session-log-evidence.mjs'

const sessionsRoot = join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.dsh', 'sessions')
const storageRoot = join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.dsh', 'storages')

const ctx = new Context()
await ctx.plugin(SessionStore)
await ctx.plugin(persistenceJsonl.default ?? persistenceJsonl, { root: sessionsRoot })

const snapshots = await ctx.sessionPersistence.list()
snapshots.sort((a, b) => b.header.createdAt - a.header.createdAt)

for (const snapshot of snapshots.slice(0, 2)) {
  const handle = await ctx.sessionPersistence.open(snapshot.header.id, 'read')
  const readResult = await handle.read()
  await handle.close()
  const events = normalizeReadResult(readResult)
  const evidence = sessionEvidence(events)
  console.log(`== session ${snapshot.header.id} (${evidence.eventCount} events, ${evidence.systemMessageCount} system/message, ${evidence.requestHeaderCount} request/header) ==`)
  console.log(`system prompt logged before dispatch: ${evidence.system !== ''}`)
  console.log(`style heading in logged system prompt: ${evidence.hasStyleHeading}`)
  if (evidence.styleName !== undefined) console.log(`active style name in logged prompt: ${evidence.styleName}`)
  console.log(`style body in logged system prompt: ${evidence.hasStyleBody}`)
  // keep-coding-instructions: false — the style replaces the whole prompt, so
  // the harness identity is absent while a style heading is present.
  console.log(`harness identity alongside style: ${evidence.hasHarnessIdentity}`)
  if (evidence.excerpt !== '') {
    console.log(`--- system prompt style excerpt ---\n${evidence.excerpt}`)
  }
}

// Durable selection record check: the output_style domain unit under
// $DSH_HOME/storages is a human-readable JSON document (single layout: one
// whole-unit file; per-record layout: one file per key).
try {
  for (const unitPath of storageUnitPaths(storageRoot, readdirSync(storageRoot), readdirSync)) {
    const unit = JSON.parse(readFileSync(unitPath, 'utf8'))
    console.log(`== storage unit ${unitPath} ==`)
    console.log(JSON.stringify(unit, null, 2).slice(0, 800))
  }
} catch (error) {
  console.log(`storage root read skipped: ${error.message}`)
}
