# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Client half: `ClientContext` now aliases `@deepseek-ai/cordis` `Context`
  and the sessions face is a local structural contract (`binding` → `style`
  projection observable), replacing the removed
  `@deepseek-ai/dsh-client-runtime` import; `SessionId` re-exports from
  `@deepseek-ai/dsh-api-remotes/client`. The browser picker mounts again on
  harness lines without the client runtime package.

## [0.6.1] - 2026-08-27

### Fixed

- Declare the web-client inject packages (`@deepseek-ai/dsh-api-remotes`,
  `@deepseek-ai/dsh-client-locale`, `@deepseek-ai/dsh-client-runtime`,
  `@deepseek-ai/dsh-client-ui-commands`) as optional peerDependencies so the
  bundle composition is explicit and standalone installs stay clean.

## [0.6.0] - 2026-08-26

### Added

- 与核心 outputStyles 共存/降级策略：探测 + 免重复注入 + 可运行检测。

## [0.5.0] - 2026-08-23

### Added

- **`/export --save <path>`**: the export command now writes the rendered
  document to a workspace path, gated by the user-approval service and the fs
  service. `/export [md|markdown|html] [--renderer=<id>] [--save <path>]` — the
  no-argument behavior is unchanged (the document is returned as output text);
  `--save` writes only after `ctx.get('approval')` grants `allowed-once`
  (fail-closed when the service is absent, rejects, cancels, or throws), uses
  `ctx.get('fs')` for the actual write (fail-loud with a structured error when
  absent), and passes the document through `sanitizeText` before writing.
  `md` is accepted as a Markdown alias. `@deepseek-ai/dsh-fs` and
  `@deepseek-ai/dsh-user-approval` are declared as optional peer dependencies.

### Changed

- **Standards alignment**: `package.json` declares `packageManager` (`pnpm@11.7.0`,
  matching CI and the lockfile), and the `cordis.patch.yml` reference comment
  now lists the two renderer-protocol config keys (`rules`, `enableExport`)
  added in 0.4.0. No runtime behavior changes.
- Five READMEs: `/export --save` reference, the `fs:write` workshop permission,
  and the test count refreshed to 127.

## [0.4.3] - 2026-08-22

### Changed

- **rc2 compatibility**: every `@deepseek-ai/dsh-*` dependency moves to
  `0.1.1-rc.2` (devDependencies and the runtime storage dependencies pinned);
  the `@deepseek-ai/dsh-session-projection` peer range raises to
  `>=0.1.1-rc.2 <0.2.0` because the projection unit now uses the rc2-only
  `stateSchema` + `wire` definition. The five README compatibility rows, the
  `dshWorkshop` compatibility claim, the compat workflow's rc pins, and the
  workspace `minimumReleaseAgeExclude` follow.

### Fixed

- **rc2 session-projection definition**: the `style` projection registers a
  `stateSchema` (persisted fold-state validator) and a client `wire`
  (`viewSchema` + `view`) instead of the rc8 top-level `schema`/`view`, and
  declares its `SessionProjectionStateMap` merge so the `register` overload
  resolves the client-visible unit.

## [0.4.2] - 2026-08-21

### Changed

- **rc8 compatibility**: every `@deepseek-ai/dsh-*` dependency moves to
  `0.1.0-rc.8` (devDependencies and the runtime storage dependencies pinned,
  peer ranges `>=0.1.0-rc.8 <0.2.0`); the five README compatibility rows,
  the `dshWorkshop` compatibility claim, and the compat workflow's rc8 pins
  follow. Verified on a real rc8 profile: bundle install, row mount, and a
  keyless headless run through the deterministic mock LLM (`SMOKE-OK`).

### Fixed

- **Web picker submits through the rc8 command Remote**: the generated
  `commands.execute` client signature gained the image-attachment batch —
  the `/style` picker passes an empty batch, keeping every switch on the
  host's durable command lifecycle.
- **rc8 `commands.execute` arity in tests and the loader runner**: the
  integration harness and `scripts/loader-runner.mjs` pass the image batch
  and the abort signal explicitly, matching the rc8 registry signature.

## [0.4.1] - 2026-08-19

### Fixed

- **Invariant companion survives hot-reload**: the inline invariant registration now holds the host registry's disposer through the inject scope's `ctx.effect` (the registry binds its own effect to the service context, so the returned disposer is the only unregistration path). Disposing the plugin fiber unregisters the companion and its `domain/changed` / `session/event` listeners; remounting re-registers cleanly instead of throwing `package "dsh-output-styles" is already registered`. Regression covered by a dispose-and-remount lifecycle test against a duplicate-strict registry.

## [0.4.0] - 2026-08-16

### Added

- **Renderer registry (`output.render.*` protocol)**: `ctx.outputRenderers` service with reversible `register()` / `list()` / `resolve()` / `renderText()`. A renderer is `{ id, match (tool/content-type), priority, presenter }` — the presenter is a pure function (args → display data, no DOM). Every render request passes the `output.render/before` waterfall first (listeners transform `{ text, context }` and must call `next()`), then the rule table, then matching renderers in priority order. Built-in renderers: `concise` and `step-by-step`.
- **Per-session/per-tool style rules**: `rules: [{ match: { tool, contentType, session }, style, priority }]` in Config and the new `output-style-rules` settings section (validated at write time; unknown renderer ids fail loudly at render time).
- **`/export` command**: renders the current session's message surface (official `deriveEventMessage` projection) to Markdown or sanitized HTML through the renderer pipeline — `/export [markdown|html] [--renderer=<id>]`. Every render keeps `{ original, rendered, rendererId, changed }`, so rendered output and its session-log source reconstruct together.
- `sanitizeText` / `toMarkdown` / `toHtml` / `renderExport` pure functions with extreme-case coverage (tags, control characters, huge inputs).
- Renderer protocol reference: `docs/renderer-protocol.md` (+ 中文).

### Changed

- `/style` command and per-session persistence are fully unchanged (0.3.x compatible).
- Five-language READMEs: renderer protocol section, two new Config rows, `/export` reference; test count updated to 107.

## [0.3.2] - 2026-08-15

### Fixed

- **Bundle install on DSH 0.1.0-rc.6**: the bundle patch now configures the
  storage rows it inserts (`storage-json` root, `storage-domain` backend),
  fixing a load-time `invalid config` failure when installing into a
  headless profile via `dsh plugin add`. Found and verified against a real
  rc.6 profile boot.

### Added

- `package.json#dsh.client` declaration for the Web picker client half.
- `package.json#dshWorkshop` (`omdsh-workshop-package/v1`) intake manifest
  for the omdsh-dev/dsh-hub-workshop Registry.

## [0.3.1] - 2026-08-15

### Added

- **Publish workflow** (`.github/workflows/publish.yml`): pushing a `v*` tag
  whose suffix matches the `package.json` version runs the full verification
  suite and publishes the tarball to npm with provenance, so a GitHub release
  can never again leave npm behind.
- **`prepublishOnly` verification gate**: every `npm publish` runs typecheck,
  the full test suite, and the self-contained check before packing — a local
  safety net outside CI.
- Package metadata: `author`, `bugs`, and `publishConfig.access: public`.

### Changed

- `pnpm run verify` aggregates typecheck, tests, and the self-contained check.
- The unknown-style error says `available: none` instead of a trailing empty
  list when the library is empty.
- The development sections of all five READMEs document the release flow.

## [0.3.0] - 2026-08-14

### Added

- **Claude Code `force-for-plugin` support**: the official Claude Code field
  is now accepted verbatim in both frontmatter and `outputStyles` JSON
  entries. The original `force` field remains as an alias; when both appear
  they must agree, and a disagreement skips the file with a warning.
- **Built-in styles `proactive` and `learning`**: bundled-library parity with
  Claude Code's built-in output styles (Default/Proactive/Explanatory/
  Learning). The bundled library now ships six styles:
  `concise`, `explanatory`, `formal`, `learning`, `proactive`, `step-by-step`.

### Changed

- `package.json` declares `packageManager` (`pnpm@11.7.0`, aligned with CI)
  and `sideEffects: false` for bundler friendliness.

## [0.2.0] - 2026-08-14

### Added

- Claude Code parity: layered `stylesDir` directories (later wins),
  `keep-coding-instructions`, forced styles, `outputStyles` JSON compatibility
  (`compatJson`), style-body budget (`maxStyleChars`/`truncationMarker`),
  `sectionOrder`, hot reload (`watchStyles`), built-ins opt-out
  (`includeBuiltins`).
- Project-level default over the DSH settings seam (`output-style.style`).
- Web picker (`dsh-output-styles/client`) decorating the host `/style`
  command with a projection-backed popup picker.
- `style` session projection (`{ options, currentValue }`) folded from
  settled commands in the session log.
- Bundle install: `dsh.bundle.patch` manifest (`cordis.patch.yml`) composes
  storage rows + the plugin through a single `dsh plugin add`.
- Invariant companion (`dsh-output-styles/invariant`).

## [0.1.0] - 2026-08-12

### Added

- Initial release: `/style` command, `output_style` storage domain
  persistence, `systemPrompt.section()` injection, four bundled styles
  (`concise`, `explanatory`, `formal`, `step-by-step`).

[0.3.2]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.3.2
[0.3.1]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.3.1
[0.3.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.3.0
[0.2.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.2.0
[0.1.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.1.0
