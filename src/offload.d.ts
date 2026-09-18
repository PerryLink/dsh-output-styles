/**
 * Type-only face for the optional peer
 * @deepseek-ai/dsh-compaction-image-offload, which owns the message projection
 * for `image/offload` surface events. The package is loaded dynamically (see
 * src/export.ts); this declaration keeps the dynamic import typed without
 * installing the package at build time.
 */
declare module '@deepseek-ai/dsh-compaction-image-offload' {
  export const imageOffloadProjection: {
    readonly type: 'image/offload'
    project(event: unknown, context: unknown): unknown
  }
}
