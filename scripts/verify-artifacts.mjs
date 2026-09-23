// Verify the built artifacts after `pnpm run build`: syntax-check the host,
// invariant, and client bundles, import the ESM host faces under plain Node,
// assert the client bundle registers itself the way the browser module system
// requires, and assert the shipped files the plugin's public exports need.
// Guards against TypeScript-only syntax leaking into shipped output, against a
// client artifact that the page's classic <script> cannot register, and against
// a tarball missing the bundle patch.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const required = [
  'lib/index.js',
  'lib/invariant.js',
  'lib/client.js',
  'lib/types/index.d.ts',
  'lib/types/invariant.d.ts',
  'cordis.patch.yml',
]
for (const rel of required) {
  if (!existsSync(path.join(root, rel))) throw new Error(`missing artifact: ${rel}`)
}

// 1. Syntax-check every JS bundle (plain Node parse; no execution).
for (const rel of ['lib/index.js', 'lib/invariant.js', 'lib/client.js']) {
  execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'inherit' })
}

// 2. The ESM host face must import under plain Node (no tsx, no checkout paths).
const index = await import(pathToFileURL(path.join(root, 'lib/index.js')).href)
if (typeof index.apply !== 'function' || index.name !== 'dsh-output-styles') {
  throw new Error('lib/index.js exports an unexpected plugin face')
}

// 3. The invariant companion face must import and expose its installer.
const invariant = await import(pathToFileURL(path.join(root, 'lib/invariant.js')).href)
if (typeof invariant.installInvariant !== 'function' || invariant.PACKAGE_NAME !== 'dsh-output-styles') {
  throw new Error('lib/invariant.js exports an unexpected invariant face')
}

// 4. The client bundle is a CLASSIC script, not an ES module: the Host serves
//    the built bytes verbatim and the page injects them with a plain <script>
//    tag, so the bundle has to register a lazy factory through
//    window.__ModuleLoader__.load({ id, factory }). A top-level `export`
//    statement is a parse error there: the row never registers and Settings →
//    Plugins reports `loaded without registering "dsh-output-styles" via
//    __ModuleLoader__.load`. Evaluate the artifact under classic-script
//    semantics with a recording loader to pin the contract down.
const clientRegistrations = []
vm.runInNewContext(readFileSync(path.join(root, 'lib/client.js'), 'utf8'), {
  window: {
    __ModuleLoader__: {
      load: (registration) => {
        clientRegistrations.push(registration)
      },
    },
  },
})
if (clientRegistrations.length !== 1) {
  throw new Error(
    `lib/client.js must register exactly one __ModuleLoader__ factory, saw ${String(clientRegistrations.length)}`,
  )
}
const [registration] = clientRegistrations
if (registration.id !== 'dsh-output-styles') {
  throw new Error(`lib/client.js registered under "${String(registration.id)}", expected "dsh-output-styles"`)
}
if (typeof registration.factory !== 'function') {
  throw new Error('lib/client.js registered without a factory')
}
const client = registration.factory((request) => {
  throw new Error(`lib/client.js must not require externals, asked for ${String(request)}`)
})
if (typeof client.apply !== 'function' || client.name !== 'dsh-output-styles-client') {
  throw new Error('lib/client.js factory returns an unexpected client face')
}

console.log('artifacts OK: syntax + ESM host imports + classic-script client registration + bundle patch present')
