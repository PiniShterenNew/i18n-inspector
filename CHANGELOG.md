# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
