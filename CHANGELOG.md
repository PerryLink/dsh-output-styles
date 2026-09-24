# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `scripts/loader-runner.mjs` opened with a mojibake em dash in its first-line comment, so the file had never been free of encoding artifacts since that line was written. The dash is restored verbatim from the pre-regression blob; the file now matches the text it carried before the artifact was introduced.

### Changed

- Move the `@deepseek-ai/dsh-*` pins from `0.1.7-alpha.2` to `0.1.7-rc.1` and re-verify against that host line. `dshWorkshop.compatibility.dshVersions` records `0.1.7-rc.1` alongside the earlier lines, the five READMEs name `dsh-v0.1.7-rc.1`, and the compat workflow installs the `0.1.7-rc.1` host (`@deepseek-ai/dsh`, `dsh-base`, `dsh-headless`). The declared peer ranges and `engines.dsh` are deliberately **unchanged**: the existing four-clause union already admits `0.1.7-rc.1`, and the family convention keeps the declared range wider than the verified line. `0.1.7-rc.1` carries no plugin-facing seam change over `0.1.7-alpha.2` — the host's core packages differ only in their version fields — so no source or test expectation had to change.

## [0.6.19] - 2026-09-23

### Changed

- The `@deepseek-ai/dsh-*` dev/test pins move from `0.1.7-alpha.1` to `0.1.7-alpha.2` (23 keys), so the suite executes the host packages this release targets. `pnpm-lock.yaml` re-resolved and carries no `0.1.7-alpha.1` reference. No test expectation had to change: the bump turned nothing red.
- Every declared host range gains the trailing clause `|| >=0.1.7-0 <0.2.0`: `engines.dsh` and the 14 three-segment `@deepseek-ai/dsh-*` peers, plus the optional peer `@deepseek-ai/dsh-compaction-image-offload`, whose one-segment form is widened the same way. This is a correctness fix, not a tightening: under semver's prerelease rule a comparator set whose only prerelease comparators sit on earlier version tuples cannot admit a later alpha, so the previous bands excluded `0.1.7-alpha.2`, the very host this release targets. No existing segment was removed, reordered or narrowed.
- `dshWorkshop.compatibility.dshVersions` records `0.1.7-alpha.2` alongside `0.1.2-rc.1` and `0.1.5-rc.2`.
- `@deepseek-ai/cordis` moves to `^4.0.4` in both `peerDependencies` (which had declared the union `^4.0.2 || ^4.0.3`) and `devDependencies` (which had declared `^4.0.3`). Declaration alignment only: the published 4.0.3 and 4.0.4 tarballs are byte-identical in all 31 code and `.d.ts` files, `package.json` being the only difference.
- Two resolutions refresh inside the already-declared caret ranges: `@deepseek-ai/schemastery` 3.18.3 to 3.18.4 and `@deepseek-ai/cosmokit` 1.8.4 to 1.8.5 in the lockfile. Without them `typecheck` and `typecheck:ci` failed with `TS2883` ("The inferred type of 'Config' cannot be named without a reference to 'Schema' ..."): the alpha.2 host graph pulls schemastery 3.18.4 / cosmokit 1.8.5 while this lockfile still held the alpha.1-era 3.18.3 / 1.8.4, so the exported `Config` schema's type straddled two type identities of the schemastery/cosmokit pair and declaration emit could not name the result. No source, test or assertion changed.
- The Harness row of all five READMEs names `dsh-v0.1.7-alpha.2`; the dated verification narration beside it is left as written.
- The monthly Compat workflow installs and profile-adds the `0.1.7-alpha.2` host (`@deepseek-ai/dsh`, `@deepseek-ai/dsh-base`, `@deepseek-ai/dsh-headless`) on both host-line points, so the CLI and the bundle come from the same line. It had kept proving compatibility with a superseded line, silently: the job runs on a schedule, so nothing failed and nothing warned.

### Fixed

- The optional peer `@deepseek-ai/dsh-compaction-image-offload` admitted no `0.1.7` host. It had been left at `>=0.1.6-alpha.1 <0.2.0` when the other ranges were widened, because it uses a different shape from the family's three-segment baseline — but it is a live install-time constraint, and the `0.1.7-alpha.2` host ships `@deepseek-ai/dsh-compaction-image-offload@0.1.7-alpha.2`. It now reads `>=0.1.6-alpha.1 <0.2.0 || >=0.1.7-0 <0.2.0`.

## [0.6.18] - 2026-09-22

### Changed

- Rename the session-export command from `/export` to `/transcript`. The `export` name collided with the official `session-log-export` command — on hosts that ship it, the duplicate registration failed with `already registered` and the plugin half-mounted. The command now registers as `/transcript` (usage: `/transcript [markdown|html] [--renderer=<id>] [--save <path>]`); every user-facing reference (five READMEs, docs, error strings) follows the new name. There is no transitional dual registration — `/export` is gone as soon as this version loads. The internal `src/export.ts` module keeps its name; only the registered command changed.

- **Adapt to DeepSeek Harness `dsh-v0.1.7-alpha.1`.** The host deleted the settings API this plugin was built on (`@deepseek-ai/dsh-settings-file` is gone; `@deepseek-ai/dsh-settings` is now `SettingsForms`, and `SettingsProvider` / `SettingsSection` / `settings.register(ns, schema, { base, validate })` / `settings/updated` / `SettingsNamespace` / `SettingsScope` no longer exist anywhere in the host). Both of this plugin's own settings sections are therefore gone, and the two user-configurable values moved onto the plugin's own `Config` schema:

  | Before (settings section) | After (Config field) |
  |---|---|
  | `output-style.style` | `defaultStyle` |
  | `output-style-rules.rules` | `rules` |

  Both fields are declared `volatile()` and are **now editable from the Web Plugins page** — this is a user-visible change: the plugin opts out of the auto-generated settings card (`settings.configure({ auto: false })`) exactly as first-party plugins do, and a committed value is adopted through `loader/volatile-update` without a remount. Every other `Config` field stays composition-only. A committed `defaultStyle` that names no style in the live library is refused (logged and ignored) instead of resolving to a dangling directive. If you had values in either removed section, move them into the matching `Config` field in your profile patch (`cordis.yml`). Per-session `/style` choices are unaffected — they live in the `output_style` storage domain.

- The durable provenance marker is now `{ kind: 'dsh-output-styles' }`. The host removed the shared catch-all `kind: 'plugin'` message source (`MessageSourceMap` is now `user | model | tool | 'system-prompt'`), and the session-format admission gate refuses `kind: 'plugin'` outright. The package declares its own producer-owned source through a `MessageSourceMap` merge instead. The domain record's legacy `plugin` field is still accepted on read (`source.plugin` is optional now) so records written by earlier versions keep validating.

- The check that a rule names a valid kebab-case renderer id / tool is unchanged in effect but no longer runs at settings-write time (there is no settings write path any more). It runs in `resolveConfig`, which the plugin calls at load and on every volatile commit, so an invalid value still fails loudly. The cookbook's suggested `Schema.check()` is **not** usable: it does not exist in any published `@deepseek-ai/schemastery` (verified against 3.18.2 and 3.18.3), and a `transform` cannot express the check either because the transform callback receives the schema's *input* (plain values) while `Config` is its *output* (`Volatile` references).

- `@deepseek-ai/schemastery` moves to `^3.18.3` and `@deepseek-ai/cordis` to `^4.0.3`. `volatile()` and the `Volatile<T>` type this adapter depends on were added in exactly those releases: schemastery 3.18.2 has neither, and cordis 4.0.2 does not export `Volatile`. The cordis *peer* range is widened (`^4.0.2 || ^4.0.3`), not narrowed, and `@deepseek-ai/cosmokit` (`^1.8.4`) is added as a peer because the emitted `.d.ts` references its `Volatile` type. No supported host line is dropped.

- The `@deepseek-ai/dsh-*` dev/test pins move from `0.1.5-rc.2` to `0.1.7-alpha.1`, matching the host this adapter targets. The `0.1.5-rc.3` line was considered and rejected: it still ships the *old* settings contract and the old `kind: 'plugin'` message source, so every adaptation here would fail to typecheck against it. This is a deliberate deviation from the family's `0.1.5-rc.3` dev pin, recorded here for that reason.

- `@deepseek-ai/cordis-plugin-loader` moves to `^1.0.4`. Its `loader/volatile-update` event declaration (the hook the live settings commit rides) was added in 1.0.4; 1.0.3 has no such event type.

### Fixed

- The session-export surface fold resolves the `image/offload` message projection from the location the 0.1.7 generation actually publishes it, `@deepseek-ai/dsh-compaction-image-offload/projection`. The package root stopped exporting `imageOffloadProjection` (it now exports only `name`/`inject`/`apply`), so the previous root-only dynamic import silently resolved to an empty projection list and an offload-bearing transcript threw `requires a message projection`. The root specifier is kept as a fallback for older generations. `tests/export-surface.spec.ts` carries a structurally valid offload fixture so the counter-lock assertion is load-bearing.

- `scripts/loader-runner.mjs` now recovers the reason a Loader row failed and rethrows it. Under `cordis-plugin-loader` 1.0.4 an invalid config no longer rejects `loader.await()`: the row's `_init()` reports through `ctx.logger.error` and returns, so the row silently never mounts. The runner attaches no log exporter, so that message went nowhere and the negative regression reported only the downstream symptom (`/style command is missing`) — the `/expected boolean/` assertion in `tests/composition.spec.ts` was vacuous. The runner now walks the entry tree (including Include subtrees) for a `FiberState.FAILED` row and throws its `_error`, restoring the real reason: `Loader composition: entry failed to load: … $.watchStyles expected boolean but got yes (at watchStyles)`. Verified in both directions — the invalid config now exits 1 with that text, and a valid config still exits 0 with `DSH_LOADER_RESULT`.

- The session-export surface fold now supplies the message projection for plugin-owned surface events (`image/offload`, owned by `@deepseek-ai/dsh-compaction-image-offload`, added as an optional peer). The projection is loaded through a conditional dynamic import with a failure-tolerant fallback, so a host that predates the projection contract keeps working, while a new-generation host folds offload-bearing logs instead of throwing. A counter-lock test asserts that a bare fold without projections fails loudly on projection-requiring logs whenever the host fold implements the contract.

- The three `@deepseek-ai/dsh-storage*` packages moved from `dependencies` to optional peer dependencies. The plugin previously carried its own pinned `0.1.5-rc.2` copies in `node_modules`, which shadowed the host's newer storage generation — the plugin silently ran against the old storage stack. With the move, `require.resolve` lands on the host's copy, and a missing storage stack fails at composition time instead of silently degrading.

### Added

- `dsh.manifestVersion: 1` and the canonical three-clause `engines.dsh` range, matching the 0.1.6 family contract.

## [0.6.16] - 2026-09-12

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.

- The release workflow now creates the GitHub Release itself, with the body taken from this version's CHANGELOG section. Until now a `v*` tag published to npm and stopped there, so every Release page had to be created by hand afterwards.
- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.2` line and record `0.1.5-rc.2` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.2`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

## [0.6.15] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line and record `0.1.5-rc.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).

## [0.6.14] - 2026-09-09

### Fixed

- Realign the runtime `@deepseek-ai/dsh-storage`, `@deepseek-ai/dsh-storage-domain`, and `@deepseek-ai/dsh-storage-json` pins from `0.1.2-rc.1` to `0.1.5-alpha.1`. The rc.1 runtime pin was misaligned with the `0.1.5-alpha.1` host this batch targets: installing the tarball into a `0.1.5-alpha.1` profile let the bundled rc.1 copies shadow the host's own `0.1.5-alpha.1` tree, so the plugin resolved a foreign `@deepseek-ai/dsh-*` generation. All three stay regular `dependencies` — `dsh-storage-domain` is a value import in `src/types.ts`, and a bare profile resolves its storage rows from the plugin's own `node_modules` — and the duplicate `devDependencies` entries now state the same version. No peer range changes.

### Changed

- Supersede the 0.6.12 note that kept the runtime storage line at `0.1.2-rc.1`: that line is now `0.1.5-alpha.1`, so `dependencies` and `devDependencies` agree and pnpm resolves the aligned tree.

## [0.6.13] - 2026-09-09

### Fixed

- Use `$RUNNER_TEMP` instead of an absolute `/tmp` path in the plugin-doctor workflow: the repository self-contained gate rejects absolute paths, so the 0.6.12 publish workflow failed at `verify-self-contained`; no product code changes.

## [0.6.12] - 2026-09-09

### Fixed

- `/export` no longer includes the system prompt. Session format V3 (DeepSeek Harness `dsh-v0.1.5-alpha.1`) moved the rendered prompt onto the message surface as node 0 (a `system/message` event), and the transcript projection mapped that node to the first `## User` block, so a V3 session exported the whole prompt with the output-style body inside it. The surface node is excluded now and the pre-V3 export output is restored; `tests/export-surface.spec.ts` fails without the fix and passes with it.
- `scripts/verify-session-log.mjs` follows the V3 session-log contracts: `SessionHandle.read()` returns `{ eventState, events }` (an event array up to `0.1.3-alpha.1`), the model-visible prompt is read from the `system/message` event (`request/header.system` stays a V2 read fallback), and the storage probe reads the `single`-layout unit file `<root>/output_style.json` instead of scanning a directory that never exists. The pure shape handling moved to `scripts/session-log-evidence.mjs` and is unit tested (`tests/session-log-evidence.spec.ts`) without reading any real session log.

### Changed

- The `devDependencies` pins for `@deepseek-ai/dsh-storage`, `@deepseek-ai/dsh-storage-domain`, and `@deepseek-ai/dsh-storage-json` are stated at `0.1.2-rc.1`, matching what pnpm resolves: the same packages are runtime `dependencies` on that line and pnpm resolves them from `dependencies` alone, so the `0.1.5-alpha.1` dev pins added in 0.6.11 were inert. The runtime dependency line is unchanged (0.1.2-rc.1 is the widest published install line and the peer range still covers 0.1.5-alpha.1).
- The compat workflow probes now install `@deepseek-ai/dsh@0.1.5-alpha.1`, `@deepseek-ai/dsh-base@0.1.5-alpha.1`, and `@deepseek-ai/dsh-headless@0.1.5-alpha.1`, and the bare-import job pins the current `dsh-settings` peer range.

### Docs

- Five-language README: the injected system prompt is recorded as the `system/message` surface node (not `request/header`), and the test-count line states 148 tests.

## [0.6.11] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); runtime behavior is unchanged for every supported host line.
- Record `0.1.5-alpha.1` in `dshWorkshop.compatibility.dshVersions`.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-alpha.1` (verified 2026-09-09).

## [0.6.10] - 2026-09-07

### Docs

- Fix the DSH plugin badge URL: shields.io rejects the four-segment static badge form with "404 badge not found"; the label now uses the documented double-dash form (`dsh--plugin`), rendering identically; no behavior change.


## [0.6.9] - 2026-09-07

### Fixed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0`: the older `>=0.1.0-rc.8 <0.2.0` band resolved to only the `0.1.0-rc.8` prerelease under registry-driven resolution and broke fresh tarball installs; no behavior change.

### Docs

- Refresh the five-language README support-version wording: the verified GitHub tag `dsh-v0.1.3-alpha.1` now leads the compatibility claim, while npm `0.1.2-rc.1` stays the published dependency-pin line (peers `>=0.1.2-rc.1 <0.2.0`); no behavior change.


## [0.6.8] - 2026-09-04

### Fixed

- Remove the `storage` / `storage-json` / `storage-domain` rows from the bundle patch: the shipped profiles compose that stack through `dsh-base`, so the inserted rows collided with the same ids and made the profile refuse to boot (`duplicate loader entry id: storage`). The patch now mounts only the plugin row; bare profiles compose the storage stack themselves.

## [0.6.7] - 2026-09-04

### Changed

- Align the `dependencies` (3 packages) and devDependency pins to the published dsh `0.1.2-rc.1` line, move the compat CI probes from `0.1.1-rc.2` to `0.1.2-rc.1`, and refresh `dshWorkshop.dshVersions`; no behavior change.

### Docs

- Sync the five-language README compatibility rows to the `0.1.2-rc.1` facts.

## [0.6.6] - 2026-09-03

### Changed

- Runtime `dependencies` (`dsh-storage` / `dsh-storage-domain` / `dsh-storage-json`) moved from `0.1.1-rc.2` to the published `0.1.2-alpha.5` line, matching the dev pins.
- Dev pins `@deepseek-ai/cordis-plugin-loader ^1.0.3` / `@deepseek-ai/cordis-plugin-include ^1.0.7` aligned with the `cordis 4.0.2` peer ranges.

## [0.6.5] - 2026-09-02

### Docs

- Sync the five-language READMEs to the 0.1.2-alpha.5 facts; no behavior change.

## [0.6.4] - 2026-09-02

### Changed

- Align the devDependency pins to the published dsh 0.1.2-alpha.5 line and re-verify the adaptation claims; no behavior change.

## [0.6.3] - 2026-09-01

### Changed

- Align the devDependency pins to the published dsh `0.1.2-alpha.3` line (21 `@deepseek-ai/dsh-*` packages), widen the `dsh-commands`/`dsh-system-prompt` peers to `>=0.1.0-rc.8 <0.2.0`, and raise `dshWorkshop.compatibility.dshVersions` to `0.1.2-alpha.3`. No behavior change; the five-language READMEs record the alpha.3 fact.

## [0.6.2] - 2026-08-30

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
