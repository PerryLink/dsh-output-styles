import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    client: 'lib/types/client/index.js',
  },
  outDir: 'lib',
  format: ['esm'],
  platform: 'neutral',
  target: 'es2022',
  fixedExtension: false,
  dts: false,
  clean: false,
})
