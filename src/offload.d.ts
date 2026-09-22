/**
 * Type-only face for the optional peer
 * @deepseek-ai/dsh-compaction-image-offload, which owns the message projection
 * for `image/offload` surface events. The package is loaded dynamically (see
 * src/export.ts); this declaration keeps the dynamic import typed without
 * installing the package at build time.
 *
 * On the 0.1.7 generation the projection moved out of the package root onto a
 * `./projection` subpath (the root now exports only `name`/`inject`/`apply`),
 * so the specifier below is the one that resolves. The loader keeps a
 * failure-tolerant fallback for lines that predate that subpath.
 */
declare module '@deepseek-ai/dsh-compaction-image-offload/projection' {
  export const imageOffloadProjection: {
    readonly type: 'image/offload'
    project(event: unknown, context: unknown): unknown
  }
}

declare module '@deepseek-ai/dsh-compaction-image-offload' {
  export const name: string
  export const inject: string[]
  export function apply(ctx: unknown): void
  /** Only present on older generations, where the projection still rode the root. */
  export const imageOffloadProjection: {
    readonly type: 'image/offload'
    project(event: unknown, context: unknown): unknown
  } | undefined
}
