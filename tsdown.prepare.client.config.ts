import { defineConfig } from 'tsdown'
import { clientFactoryBanner, clientFactoryFooter } from './tsdown.client.shared.ts'

/**
 * Consumer-side browser bundle for Git and tarball installs: the `dsh.client`
 * entry, bundled without any repository project references.
 */
export default defineConfig({
  entry: {
    client: 'src/client/index.ts',
  },
  outDir: 'lib',
  // The same classic-script contract as the repository build; see
  // `tsdown.client.shared.ts`.
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  outExtensions: () => ({ js: '.js' }),
  dts: false,
  clean: false,
  tsconfig: 'tsconfig.prepare.json',
  outputOptions: {
    banner: clientFactoryBanner,
    footer: clientFactoryFooter,
  },
})
