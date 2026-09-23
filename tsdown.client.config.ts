import { defineConfig } from 'tsdown'
import { clientFactoryBanner, clientFactoryFooter } from './tsdown.client.shared.ts'

export default defineConfig({
  entry: {
    client: 'lib/types/client/index.js',
  },
  outDir: 'lib',
  // A classic script that registers a factory with `window.__ModuleLoader__`,
  // not an ES module: see `tsdown.client.shared.ts` for the contract.
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  // The artifact must stay `lib/client.js`: `package.json` maps `./client` to it
  // and the Host resolves that export to find the file it serves. The CJS format
  // would otherwise land at `lib/client.cjs` in this `"type": "module"` package.
  outExtensions: () => ({ js: '.js' }),
  dts: false,
  clean: false,
  outputOptions: {
    banner: clientFactoryBanner,
    footer: clientFactoryFooter,
  },
})
