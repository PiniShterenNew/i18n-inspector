import type { ReportData, ReportLocaleResult } from "./createReportData.js";

const KEY_DISPLAY_LIMIT = 20;

const LOCALE_NAMES: Record<string, string> = {
  af: "Afrikaans", ar: "Arabic", bg: "Bulgarian", bn: "Bengali",
  cs: "Czech", da: "Danish", de: "German", el: "Greek",
  en: "English", es: "Spanish", et: "Estonian", fa: "Persian",
  fi: "Finnish", fr: "French", he: "Hebrew", hi: "Hindi",
  hr: "Croatian", hu: "Hungarian", id: "Indonesian", it: "Italian",
  ja: "Japanese", ko: "Korean", lt: "Lithuanian", lv: "Latvian",
  ms: "Malay", nl: "Dutch", no: "Norwegian", pl: "Polish",
  pt: "Portuguese", ro: "Romanian", ru: "Russian", sk: "Slovak",
  sl: "Slovenian", sq: "Albanian", sr: "Serbian", sv: "Swedish",
  sw: "Swahili", th: "Thai", tr: "Turkish", uk: "Ukrainian",
  ur: "Urdu", vi: "Vietnamese", zh: "Chinese",
};

function localeName(code: string): string {
  const base = code.split("-")[0]!;
  const name = LOCALE_NAMES[base];
  return name ? `${name} (${code})` : code;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function coverageClass(coverage: number): string {
  if (coverage >= 99) return "good";
  if (coverage >= 90) return "warn";
  return "bad";
}

function progressBar(coverage: number): string {
  const cls = coverageClass(coverage);
  return `
    <div class="progress-wrap" title="${coverage}%">
      <div class="progress-bar ${cls}" style="width:${coverage}%"></div>
    </div>`;
}

function keyList(
  label: string,
  group: { count: number; keys: string[] },
  cssClass: string,
): string {
  if (group.count === 0) return "";

  const shown = group.keys.slice(0, KEY_DISPLAY_LIMIT);
  const remaining = group.keys.length - shown.length;

  const rows = shown
    .map((k) => `<li class="key-item">${esc(k)}</li>`)
    .join("\n");

  const moreRow =
    remaining > 0
      ? `<li class="key-more">… and ${remaining} more</li>`
      : "";

  return `
    <details class="key-group" open>
      <summary class="key-group-label ${cssClass}">
        ${esc(label)} <span class="key-count">${group.count}</span>
      </summary>
      <ul class="key-list">
        ${rows}
        ${moreRow}
      </ul>
    </details>`;
}

function localeCard(locale: ReportLocaleResult): string {
  const failed =
    locale.missing.count > 0 ||
    locale.empty.count > 0 ||
    locale.placeholderMismatch.count > 0;

  const statusClass = failed ? "status-failed" : "status-passed";
  const statusLabel = failed ? "FAILED" : "PASSED";
  const covClass = coverageClass(locale.coverage);

  const stats = [
    locale.missing.count > 0
      ? `<div class="stat"><span class="stat-label">Missing</span><span class="stat-val bad">${locale.missing.count}</span></div>`
      : "",
    locale.empty.count > 0
      ? `<div class="stat"><span class="stat-label">Empty</span><span class="stat-val warn">${locale.empty.count}</span></div>`
      : "",
    locale.extra.count > 0
      ? `<div class="stat"><span class="stat-label">Unknown</span><span class="stat-val muted">${locale.extra.count}</span></div>`
      : "",
    locale.placeholderMismatch.count > 0
      ? `<div class="stat"><span class="stat-label">Placeholder mismatch</span><span class="stat-val warn">${locale.placeholderMismatch.count}</span></div>`
      : "",
  ].join("");

  const keys =
    keyList("Missing keys", locale.missing, "bad") +
    keyList("Empty keys", locale.empty, "warn") +
    keyList("Unknown keys", locale.extra, "muted") +
    keyList("Placeholder mismatch keys", locale.placeholderMismatch, "warn");

  return `
  <section class="locale-card searchable" data-locale="${esc(locale.locale)}">
    <div class="card-header">
      <div class="card-title">
        <span class="locale-name">${esc(localeName(locale.locale))}</span>
        <span class="locale-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div class="coverage-pill ${covClass}">${locale.coverage}%</div>
    </div>
    <div class="coverage-row">
      ${progressBar(locale.coverage)}
    </div>
    ${stats ? `<div class="stats-row">${stats}</div>` : ""}
    ${keys ? `<div class="keys-section">${keys}</div>` : ""}
  </section>`;
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0d14;
    --surface: #141720;
    --surface-2: #1c2030;
    --border: #252836;
    --border-subtle: #1e2130;
    --text: #e2e8f0;
    --text-secondary: #94a3b8;
    --muted: #4b5675;
    --good: #22c55e;
    --good-bg: #052e16;
    --warn: #f59e0b;
    --warn-bg: #2d1a03;
    --bad: #ef4444;
    --bad-bg: #2d0a0a;
    --accent: #38bdf8;
    --accent-bg: #0c2233;
    --radius: 10px;
    --radius-sm: 6px;
    --font: 'Inter', system-ui, -apple-system, sans-serif;
    --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.6;
    padding: 2.5rem 1rem 4rem;
    -webkit-font-smoothing: antialiased;
  }

  .container { max-width: 880px; margin: 0 auto; }

  /* ── Branding header ── */
  .site-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .header-left {}
  .site-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.25rem;
  }
  .site-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.02em;
  }
  .site-version {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 0.1rem 0.45rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
    font-family: var(--mono);
  }
  .site-subtitle {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  .header-meta {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: flex-end;
  }
  .meta-row {
    font-size: 0.75rem;
    color: var(--muted);
    font-family: var(--mono);
  }
  .meta-label {
    color: var(--muted);
    margin-right: 0.4rem;
  }
  .meta-value {
    color: var(--text-secondary);
  }

  /* ── Summary bar ── */
  .summary-bar {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.25rem 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem 1.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .summary-stat { display: flex; flex-direction: column; gap: 3px; }
  .summary-label {
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }
  .summary-value { font-size: 1.2rem; font-weight: 700; color: var(--text); }
  .summary-value.good { color: var(--good); }
  .summary-value.warn { color: var(--warn); }
  .summary-value.bad  { color: var(--bad); }
  .summary-value.zero { color: var(--muted); }
  .summary-status {
    grid-column: -1;
    display: flex;
    justify-content: flex-end;
  }
  .badge {
    padding: 0.3rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .badge-pass { background: var(--good-bg); color: var(--good); border: 1px solid #166534; }
  .badge-fail { background: var(--bad-bg);  color: var(--bad);  border: 1px solid #7f1d1d; }

  /* ── Search ── */
  .search-wrap { margin-bottom: 1.5rem; position: relative; }
  .search-icon {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 0.85rem;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 0.875rem;
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .search-input:focus {
    border-color: var(--accent);
    background: var(--surface-2);
  }
  .search-input::placeholder { color: var(--muted); }

  /* ── Section label ── */
  .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 0.75rem;
    padding-left: 0.25rem;
  }

  /* ── Locale cards ── */
  .locale-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 0.875rem;
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .locale-card:hover { border-color: #353a50; }
  .locale-card.hidden { display: none; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
  }
  .card-title { display: flex; align-items: center; gap: 0.625rem; }
  .locale-name { font-weight: 600; font-size: 0.9375rem; }
  .locale-badge {
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .status-passed { background: var(--good-bg); color: var(--good); }
  .status-failed { background: var(--bad-bg);  color: var(--bad); }

  .coverage-pill {
    font-weight: 700;
    font-size: 1rem;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    font-family: var(--mono);
  }
  .coverage-pill.good { color: var(--good); background: var(--good-bg); }
  .coverage-pill.warn { color: var(--warn); background: var(--warn-bg); }
  .coverage-pill.bad  { color: var(--bad);  background: var(--bad-bg); }

  /* ── Progress bar ── */
  .coverage-row { padding: 0; }
  .progress-wrap {
    height: 2px;
    background: var(--border-subtle);
    width: 100%;
  }
  .progress-bar {
    height: 100%;
    transition: width 0.3s ease;
  }
  .progress-bar.good { background: var(--good); }
  .progress-bar.warn { background: var(--warn); }
  .progress-bar.bad  { background: var(--bad); }

  /* ── Stats row ── */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid var(--border-subtle);
    background: var(--surface-2);
  }
  .stat { display: flex; gap: 0.4rem; align-items: center; font-size: 0.8125rem; }
  .stat-label { color: var(--muted); }
  .stat-val { font-weight: 700; font-family: var(--mono); font-size: 0.875rem; }
  .stat-val.bad   { color: var(--bad); }
  .stat-val.warn  { color: var(--warn); }
  .stat-val.muted { color: var(--text-secondary); }

  /* ── Key groups ── */
  .keys-section {
    padding: 0.75rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    border-top: 1px solid var(--border-subtle);
  }

  details.key-group { border-radius: var(--radius-sm); overflow: hidden; }
  details.key-group + details.key-group { margin-top: 0.2rem; }

  summary.key-group-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    list-style: none;
    border-radius: 4px;
    user-select: none;
  }
  summary.key-group-label::-webkit-details-marker { display: none; }
  summary.key-group-label::before {
    content: "▶";
    font-size: 0.55rem;
    opacity: 0.45;
    transition: transform 0.15s;
    display: inline-block;
    flex-shrink: 0;
  }
  details[open] summary.key-group-label::before { transform: rotate(90deg); }
  summary.key-group-label:hover { opacity: 0.85; }
  summary.key-group-label.bad   { color: var(--bad); }
  summary.key-group-label.warn  { color: var(--warn); }
  summary.key-group-label.muted { color: var(--text-secondary); }
  .key-count { font-weight: 500; opacity: 0.65; }

  .key-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.3rem 0.5rem 0.35rem 1.1rem;
  }
  .key-item {
    font-family: var(--mono);
    font-size: 0.775rem;
    color: var(--text-secondary);
    padding: 0.125rem 0;
  }
  .key-item::before { content: "·  "; color: var(--muted); }
  .key-more {
    font-size: 0.72rem;
    color: var(--muted);
    font-style: italic;
    padding: 0.2rem 0 0.1rem;
    font-family: var(--mono);
  }

  /* ── Utility ── */
  .good  { color: var(--good); }
  .warn  { color: var(--warn); }
  .bad   { color: var(--bad); }
  .muted { color: var(--muted); }

  /* ── Footer ── */
  .report-footer {
    margin-top: 3rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted);
  }
  .report-footer a { color: var(--muted); text-decoration: none; }
  .report-footer a:hover { color: var(--text-secondary); }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    body { padding: 1.5rem 0.75rem 3rem; }
    .site-header { flex-direction: column; }
    .header-meta { text-align: left; align-items: flex-start; }
    .summary-bar { grid-template-columns: repeat(2, 1fr); }
    .summary-status { grid-column: span 2; justify-content: flex-start; }
    .card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  }
`;

const JS = `
  const input = document.getElementById('search');
  const cards = document.querySelectorAll('.searchable');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    cards.forEach(card => {
      if (!q) { card.classList.remove('hidden'); return; }
      const text = card.textContent.toLowerCase();
      card.classList.toggle('hidden', !text.includes(q));
    });
  });
`;

export function generateHtmlReport(report: ReportData): string {
  const now = new Date(report.generatedAt);
  const generated =
    now.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const covClass = coverageClass(report.averageCoverage);

  const failed = report.locales.some(
    (l) =>
      l.missing.count > 0 ||
      l.empty.count > 0 ||
      l.placeholderMismatch.count > 0,
  );

  const totalMissingClass = report.totalMissing > 0 ? "bad" : "zero";
  const totalEmptyClass = report.totalEmpty > 0 ? "warn" : "zero";
  const totalUnknownClass = report.totalUnknown > 0 ? "warn" : "zero";
  const totalPlaceholderClass = report.totalPlaceholderMismatch > 0 ? "warn" : "zero";

  const cards = report.locales.map(localeCard).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>i18n-inspector Report — ${esc(generated)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="container">

    <header class="site-header">
      <div class="header-left">
        <div class="site-brand">
          <span class="site-title">i18n-inspector</span>
          <span class="site-version">v${esc(report.version)}</span>
        </div>
        <div class="site-subtitle">Translation Audit Report</div>
      </div>
      <div class="header-meta">
        <div class="meta-row">
          <span class="meta-label">Generated</span>
          <span class="meta-value">${esc(generated)}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Report ID</span>
          <span class="meta-value">${esc(report.reportId)}</span>
        </div>
      </div>
    </header>

    <div class="summary-bar">
      <div class="summary-stat">
        <span class="summary-label">Locales</span>
        <span class="summary-value">${report.localesChecked}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Coverage</span>
        <span class="summary-value ${covClass}">${report.averageCoverage}%</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Missing</span>
        <span class="summary-value ${totalMissingClass}">${report.totalMissing}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Empty</span>
        <span class="summary-value ${totalEmptyClass}">${report.totalEmpty}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Unknown</span>
        <span class="summary-value ${totalUnknownClass}">${report.totalUnknown}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Placeholder</span>
        <span class="summary-value ${totalPlaceholderClass}">${report.totalPlaceholderMismatch}</span>
      </div>
      <div class="summary-status">
        <span class="badge ${failed ? "badge-fail" : "badge-pass"}">${failed ? "Failed" : "Passed"}</span>
      </div>
    </div>

    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input
        id="search"
        class="search-input"
        type="search"
        placeholder="Search locales or keys…"
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <div class="section-label">Locales (${report.localesChecked})</div>

    ${cards}

    <footer class="report-footer">
      Generated by <a href="https://github.com/PiniShterenNew/i18n-inspector" target="_blank" rel="noopener">i18n-inspector</a> v${esc(report.version)}
    </footer>

  </div>
  <script>${JS}</script>
</body>
</html>`;
}
