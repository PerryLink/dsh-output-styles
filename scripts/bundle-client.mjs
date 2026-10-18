#!/usr/bin/env node
// Wrap the tsdown ESM client face in the host's __ModuleLoader__ factory.
// The host executes lib/client.js as a classic script; a top-level `export`
// is a syntax error, which is the real cause of "installed but no Web UI".
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const file = join(root, 'lib', 'client.js')
let text = readFileSync(file, 'utf8')
if (text.startsWith('window.__ModuleLoader__.load(')) process.exit(0)

const exported = []
text = text.replace(/^export\s+\{([^}]+)\};?\s*$/gm, (_, names) => {
  for (const part of names.split(',')) {
    const [local, as] = part.trim().split(/\s+as\s+/)
    if (local) exported.push([local, as ?? local])
  }
  return ''
})
text = text.replace(/\/\/# sourceMappingURL=.*$/gm, '')
const tail = exported.map(([local, as]) => `\t\texports.${as} = ${local};`).join('\n')
const wrapped = `window.__ModuleLoader__.load({
\tid: "dsh-output-styles",
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${text.trim().split('\n').map(line => line ? '\t\t' + line : '').join('\n')}
${tail}
\t\treturn module.exports;
\t}
});
`
writeFileSync(file, wrapped)
console.log('bundle-client: wrapped lib/client.js')
