# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.2] — 2026-05-31

Hardening / Reliability Release — no new features. Strengthens the existing core, reduces edge-case failures, and expands test coverage.

### Fixed

- Whitespace-only values (e.g. `"   "`, `"\t"`, `"\n"`) are now correctly treated as empty translations, consistent with `""`
- UTF-8 BOM (`﻿`) is stripped before JSON parsing, enabling files created by Windows editors and certain tools to load without error
- `placeholderMismatch` array in `compareLocales` now carries an explicit `PlaceholderMismatch[]` type annotation (was inferred `any[]`)

### Improved

- Array values in locale files are now detected and reported as warnings instead of being silently skipped
  - Warnings appear in the terminal report under a dedicated **Warnings** section
  - Warnings appear in the HTML report as a styled notice above the locale cards
  - Array keys do not affect coverage, missing, or empty counts — they are informational only
- `collectArrayKeys` is exported from `flattenObject` as a tested public utility
- Expanded edge-case test coverage:
  - Whitespace-only empty detection (space, tab, newline variants)
  - UTF-8 BOM handling in both `file-per-locale` and `locale-directories` modes
  - Array detection in source, target, and nested positions
  - Placeholder spacing variations (`{{name}}` vs `{{ name }}` vs `{{ user.name }}`)
  - Duplicate placeholder deduplication
- CLI help screen now opens with a **Quick Start** section (3-step onboarding) before the command reference
- `--help` examples updated to use `npx i18n-inspector` for clarity
- `init` success message now shows `npx i18n-inspector` as the next step
- Config-not-found error now shows a clear `Next step: npx i18n-inspector init` prompt
- HTML report success output now shows a prominent **Open:** path block
- README updated to reflect 0.1.2 behaviour: arrays as warnings, whitespace-only empty detection, BOM handling, multi-package-manager installation
- HTML report redesigned with brand-aligned colours (derived from project SVG assets):
  - Prominent **status banner** (pass/fail) displayed before all other content
  - **Summary dashboard** replaced flat stat row with six labelled cards (Locales Checked, Average Coverage, Missing, Empty, Unknown, Array Warnings)
  - Inline **favicon** (browser tab icon) using the project icon
  - **About this report** collapsible section explaining the coverage formula and what does/does not affect it
  - Progress bars and coverage pills now use brand-green (`#34d399`) matching the logo check badge
  - Professional footer with version, timestamp, report ID, and GitHub repository link
- Project branding assets added to `docs/assets/`: `icon.svg`, `logo.svg`, `favicon.svg`
- README logo updated from placeholder comment to `<img>` referencing `docs/assets/logo.svg`

---

## [0.1.0] — 2026-05-30

### Initial release

#### Detection

- **Missing key detection** — identifies keys present in the source locale but absent in a target locale
- **Empty key detection** — flags keys that exist but have an empty string value
- **Unknown key detection** — reports keys found in a target locale that have no corresponding source key
- **Placeholder mismatch detection** — compares `{{ variable }}` placeholder sets between source and target; reports any additions or removals

#### Coverage reporting

- Per-locale translation coverage percentage
- Average coverage across all target locales
- Total counts for missing, empty, unknown, and placeholder mismatch issues

#### CLI

- `i18n-inspector` — run a full audit and print a colored console report
- `i18n-inspector init` — auto-detect locale file structure and write `i18n-inspector.config.json`
- `i18n-inspector --html` — run audit and save a self-contained HTML report to `./reports/`
- `i18n-inspector --help` — display usage, exit codes, and config reference
- Exit codes: `0` (pass), `1` (issues found), `2` (system error)

#### Config

- Supports `file-per-locale` structure (one JSON file per language)
- Supports `locale-directories` structure (one directory per language with namespace files)
- Optional `ignore` field to skip directories during `init` detection
- Auto-detection of English as the source locale during `init`

#### HTML report

- Self-contained single HTML file — no server or external dependencies
- Version, generated timestamp, and report ID in the header
- Summary bar with: locales checked, average coverage, total missing / empty / unknown / placeholder mismatch counts, overall pass/fail status
- Per-locale cards with coverage percentage, progress bar, and collapsible key lists
- Up to 20 keys shown per issue category with a "… and N more" indicator
- Search box to filter across all locales and keys in real time
- Responsive layout for mobile screens
- Reports saved to `./reports/i18n-inspector-report-YYYY-MM-DD-HHmm.html` (no overwriting)

#### Developer experience

- Zero runtime dependencies (only `glob` for file discovery)
- Node.js >= 18 required
- Fully typed TypeScript source
- CI-friendly exit codes
