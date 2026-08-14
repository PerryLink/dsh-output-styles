# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.3.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.3.0
[0.2.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.2.0
[0.1.0]: https://github.com/PerryLink/dsh-output-styles/releases/tag/v0.1.0
