import { defineConfig } from 'tsdown'

/**
 * Consumer-side browser bundle for Git and tarball installs: the `dsh.client`
 * entry, bundled without any repository project references.
 */
export default defineConfig({
  entry: {
    client: 'src/client/index.ts',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'neutral',
  target: 'es2022',
  fixedExtension: false,
  dts: false,
  clean: false,
  tsconfig: 'tsconfig.prepare.json',
})
