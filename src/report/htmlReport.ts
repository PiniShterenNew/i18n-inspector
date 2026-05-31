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
  if (coverage >= 95) return "good";
  if (coverage >= 80) return "warn";
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
    <details class="key-group">
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
      ? `<div class="stat stat-dim"><span class="stat-label">Empty</span><span class="stat-val warn">${locale.empty.count}</span></div>`
      : "",
    locale.extra.count > 0
      ? `<div class="stat stat-dim"><span class="stat-label">Unknown</span><span class="stat-val muted">${locale.extra.count}</span></div>`
      : "",
    locale.placeholderMismatch.count > 0
      ? `<div class="stat stat-dim"><span class="stat-label">Placeholder mismatch</span><span class="stat-val warn">${locale.placeholderMismatch.count}</span></div>`
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

// Inline icon SVG — slightly smaller than original (36×36 vs 44×44)
const HEADER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="36" height="36" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="rpt-globe" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="rpt-badge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <mask id="rpt-mask">
      <rect width="200" height="200" fill="white"/>
      <circle cx="155" cy="155" r="36" fill="black"/>
    </mask>
  </defs>
  <g mask="url(#rpt-mask)">
    <circle cx="100" cy="100" r="70" fill="none" stroke="url(#rpt-globe)" stroke-width="8"/>
    <ellipse cx="100" cy="100" rx="30" ry="70" fill="none" stroke="url(#rpt-globe)" stroke-width="8"/>
    <ellipse cx="100" cy="100" rx="70" ry="24" fill="none" stroke="url(#rpt-globe)" stroke-width="8"/>
  </g>
  <circle cx="155" cy="155" r="28" fill="url(#rpt-badge)"/>
  <path d="M143 155L151 163L167 145" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const FAVICON_DATA_URL =
  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
  `<circle cx='100' cy='100' r='70' fill='none' stroke='%2338bdf8' stroke-width='8'/>` +
  `<ellipse cx='100' cy='100' rx='30' ry='70' fill='none' stroke='%2338bdf8' stroke-width='8'/>` +
  `<ellipse cx='100' cy='100' rx='70' ry='24' fill='none' stroke='%2338bdf8' stroke-width='8'/>` +
  `<circle cx='155' cy='155' r='28' fill='%2334d399'/>` +
  `<path d='M143 155L151 163L167 145' fill='none' stroke='white' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/>` +
  `</svg>`;

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
    --good: #34d399;
    --good-bg: #022c22;
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
    padding: 1.75rem 1rem 3rem;
    -webkit-font-smoothing: antialiased;
  }

  .container { max-width: 880px; margin: 0 auto; }

  /* ── Header ── */
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .brand-group svg { flex-shrink: 0; }
  .brand-text { display: flex; flex-direction: column; gap: 0.05rem; }
  .brand-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1.25;
  }
  .brand-sub {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    line-height: 1.3;
  }
  .brand-product {
    color: var(--accent);
    font-weight: 600;
  }
  .brand-ver {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 0.675rem;
  }
  .header-meta {
    text-align: right;
  }
  .meta-row {
    font-size: 0.7rem;
    color: var(--muted);
    font-family: var(--mono);
    white-space: nowrap;
  }
  .meta-label { color: var(--muted); margin-right: 0.3rem; }
  .meta-value { color: var(--text-secondary); }
  .meta-sep { opacity: 0.3; margin: 0 0.35rem; }

  /* ── Status Banner ── */
  .status-banner {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.875rem 1.25rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
  }
  .status-banner.pass {
    background: var(--good-bg);
    border: 1px solid #0d5c3a;
  }
  .status-banner.fail {
    background: var(--bad-bg);
    border: 1px solid #7f1d1d;
  }
  .status-title {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 1.0625rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .status-banner.pass .status-title { color: var(--good); }
  .status-banner.fail .status-title { color: var(--bad); }
  .status-icon { font-size: 1rem; flex-shrink: 0; line-height: 1; }
  .status-sub {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding-left: 0.1rem;
  }

  /* ── Summary Grid ── */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .summary-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.625rem 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .card-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--muted);
  }
  .card-value {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
    font-family: var(--mono);
  }
  .card-value.good  { color: var(--good); }
  .card-value.warn  { color: var(--warn); }
  .card-value.bad   { color: var(--bad); }
  .card-value.muted { color: var(--text-secondary); }
  .card-value.zero  { color: var(--muted); }

  /* ── Warnings bar ── */
  .warnings-bar {
    background: var(--warn-bg);
    border: 1px solid #78350f;
    border-radius: var(--radius);
    padding: 0.75rem 1.25rem;
    margin-bottom: 1.25rem;
  }
  .warnings-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--warn);
    margin-bottom: 0.4rem;
  }
  .warnings-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .warnings-list li {
    font-family: var(--mono);
    font-size: 0.775rem;
    color: var(--text-secondary);
  }
  .warnings-list li::before { content: "·  "; color: var(--warn); }

  /* ── Search ── */
  .search-wrap { margin-bottom: 1rem; position: relative; }
  .search-icon {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 0.9rem;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 0.875rem;
    padding: 0.55rem 1rem 0.55rem 2.5rem;
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
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 0.5rem;
    padding-left: 0.25rem;
  }

  /* ── Locale cards ── */
  .locale-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 0.625rem;
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .locale-card:hover { border-color: #353a50; }
  .locale-card.hidden { display: none; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
  }
  .card-title { display: flex; align-items: center; gap: 0.5rem; }
  .locale-name { font-weight: 600; font-size: 0.9375rem; }
  .locale-badge {
    padding: 0.1rem 0.45rem;
    border-radius: 4px;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .status-passed { background: var(--good-bg); color: var(--good); }
  .status-failed { background: var(--bad-bg);  color: var(--bad); }

  .coverage-pill {
    font-weight: 700;
    font-size: 0.9375rem;
    padding: 0.175rem 0.5rem;
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
    height: 3px;
    background: var(--border-subtle);
    width: 100%;
  }
  .progress-bar {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 0 2px 2px 0;
  }
  .progress-bar.good { background: var(--good); }
  .progress-bar.warn { background: var(--warn); }
  .progress-bar.bad  { background: var(--bad); }

  /* ── Stats row ── */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border-subtle);
    background: var(--surface-2);
    align-items: center;
  }
  .stat { display: flex; gap: 0.35rem; align-items: center; font-size: 0.8125rem; }
  .stat-label { color: var(--muted); }
  .stat-val { font-weight: 700; font-family: var(--mono); font-size: 0.875rem; }
  .stat-val.bad   { color: var(--bad); }
  .stat-val.warn  { color: var(--warn); }
  .stat-val.muted { color: var(--text-secondary); }

  /* Secondary stats: empty, unknown, placeholder — less prominent than missing */
  .stat.stat-dim { opacity: 0.72; }
  .stat.stat-dim .stat-label { font-size: 0.75rem; }
  .stat.stat-dim .stat-val { font-size: 0.8125rem; font-weight: 600; }

  /* ── Key groups ── */
  .keys-section {
    padding: 0.5rem 1rem 0.75rem;
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

  /* ── About section ── */
  .about-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-top: 1.25rem;
    overflow: hidden;
  }
  .about-summary {
    padding: 0.75rem 1.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }
  .about-summary::-webkit-details-marker { display: none; }
  .about-summary::before {
    content: "▶";
    font-size: 0.55rem;
    opacity: 0.4;
    transition: transform 0.15s;
    display: inline-block;
    flex-shrink: 0;
  }
  .about-section[open] > .about-summary::before { transform: rotate(90deg); }
  .about-summary:hover { color: var(--text); }
  .about-body {
    padding: 0 1.25rem 1.25rem;
    border-top: 1px solid var(--border-subtle);
  }
  .about-body h3 {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--muted);
    margin: 1rem 0 0.5rem;
  }
  .about-body p {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
  .about-body pre {
    font-family: var(--mono);
    font-size: 0.775rem;
    color: var(--text);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.625rem 0.875rem;
    margin: 0.4rem 0 0.75rem;
    overflow-x: auto;
  }
  .about-body ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0;
  }
  .about-body ul li {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.5;
    padding-left: 1rem;
    position: relative;
  }
  .about-body ul li::before {
    content: "·";
    position: absolute;
    left: 0;
    color: var(--muted);
  }
  .about-body strong { color: var(--text); font-weight: 600; }

  /* ── Footer ── */
  .report-footer {
    margin-top: 2rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
  }
  .footer-brand {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  .footer-brand a { color: var(--accent); text-decoration: none; }
  .footer-brand a:hover { text-decoration: underline; }
  .footer-meta {
    font-size: 0.675rem;
    color: var(--muted);
    font-family: var(--mono);
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }
  .footer-sep { opacity: 0.35; }

  /* ── Utility ── */
  .good  { color: var(--good); }
  .warn  { color: var(--warn); }
  .bad   { color: var(--bad); }
  .muted { color: var(--muted); }

  /* ── Responsive ── */
  @media (max-width: 720px) {
    .summary-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 640px) {
    body { padding: 1.25rem 0.75rem 2.5rem; }
    .site-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .header-meta { text-align: left; }
    .meta-row { white-space: normal; }
    .card-header { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
  }
  @media (max-width: 400px) {
    .summary-grid { grid-template-columns: repeat(2, 1fr); }
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

function warningsBar(arrayWarnings: string[]): string {
  if (arrayWarnings.length === 0) return "";
  const items = arrayWarnings
    .map((k) => `<li>${esc(k)}</li>`)
    .join("\n        ");
  return `
    <div class="warnings-bar">
      <div class="warnings-title">⚠ Arrays detected and skipped</div>
      <ul class="warnings-list">
        ${items}
      </ul>
    </div>`;
}

function statusBanner(report: ReportData): string {
  const failedLocales = report.locales.filter(
    (l) => l.missing.count > 0 || l.empty.count > 0 || l.placeholderMismatch.count > 0,
  );
  if (failedLocales.length === 0) {
    const n = report.localesChecked;
    return `
  <div class="status-banner pass">
    <div class="status-title">
      <span class="status-icon">✓</span>
      <span>AUDIT PASSED</span>
    </div>
    <div class="status-sub">All ${n} locale${n !== 1 ? "s" : ""} passed</div>
  </div>`;
  }
  const f = failedLocales.length;
  const t = report.localesChecked;
  return `
  <div class="status-banner fail">
    <div class="status-title">
      <span class="status-icon">✗</span>
      <span>AUDIT FAILED</span>
    </div>
    <div class="status-sub">${f} of ${t} locale${t !== 1 ? "s" : ""} contain issues</div>
  </div>`;
}

function summaryGrid(report: ReportData): string {
  const covClass = coverageClass(report.averageCoverage);
  const missingClass = report.totalMissing > 0 ? "bad" : "zero";
  const emptyClass = report.totalEmpty > 0 ? "warn" : "zero";
  const unknownClass = report.totalUnknown > 0 ? "muted" : "zero";
  const warningsClass = report.arrayWarnings.length > 0 ? "warn" : "zero";

  return `
  <div class="summary-grid">
    <div class="summary-card">
      <div class="card-label">Locales</div>
      <div class="card-value">${report.localesChecked}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Avg Coverage</div>
      <div class="card-value ${covClass}">${report.averageCoverage}%</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Missing</div>
      <div class="card-value ${missingClass}">${report.totalMissing}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Empty</div>
      <div class="card-value ${emptyClass}">${report.totalEmpty}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Unknown</div>
      <div class="card-value ${unknownClass}">${report.totalUnknown}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Array Warnings</div>
      <div class="card-value ${warningsClass}">${report.arrayWarnings.length}</div>
    </div>
  </div>`;
}

function aboutSection(): string {
  return `
  <details class="about-section">
    <summary class="about-summary">About this report</summary>
    <div class="about-body">
      <h3>Coverage formula</h3>
      <pre>coverage = (source keys − missing − empty) / source keys × 100%</pre>
      <p>Coverage measures how completely each target locale represents the source locale.</p>

      <h3>Lowers coverage</h3>
      <ul>
        <li><strong>Missing</strong> — key exists in source, absent in target</li>
        <li><strong>Empty</strong> — key exists in target, value is empty or whitespace-only</li>
      </ul>

      <h3>Does not affect coverage</h3>
      <ul>
        <li><strong>Unknown</strong> — extra keys in target with no matching source key</li>
        <li><strong>Placeholder mismatches</strong> — {{ variable }} sets differ between source and target</li>
        <li><strong>Array warnings</strong> — keys with array values (detected but not compared)</li>
      </ul>
    </div>
  </details>`;
}

function reportFooter(version: string, generated: string, reportId: string): string {
  return `
  <footer class="report-footer">
    <div class="footer-brand">
      Generated by <a href="https://github.com/PiniShterenNew/i18n-inspector" target="_blank" rel="noopener noreferrer">i18n-inspector</a>
    </div>
    <div class="footer-meta">
      <span>v${esc(version)}</span>
      <span class="footer-sep">·</span>
      <span>${esc(generated)}</span>
      <span class="footer-sep">·</span>
      <span>ID: ${esc(reportId)}</span>
    </div>
  </footer>`;
}

export function generateHtmlReport(report: ReportData): string {
  const now = new Date(report.generatedAt);
  const generated =
    now.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const cards = report.locales.map(localeCard).join("\n");

  const showSearch = report.localesChecked >= 4;
  const showLocaleCount = report.localesChecked > 1;
  const sectionLabel = showLocaleCount
    ? `Locales (${report.localesChecked})`
    : "Locale";

  const searchHtml = showSearch
    ? `
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
    </div>`
    : "";

  const scriptHtml = showSearch ? `<script>${JS}</script>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Translation Audit Report — ${esc(generated)}</title>
  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URL}" />
  <style>${CSS}</style>
</head>
<body>
  <div class="container">

    <header class="site-header">
      <div class="brand-group">
        ${HEADER_ICON}
        <div class="brand-text">
          <div class="brand-name">Translation Audit Report</div>
          <div class="brand-sub">
            <span class="brand-product">i18n-inspector</span>
            <span class="brand-ver">v${esc(report.version)}</span>
          </div>
        </div>
      </div>
      <div class="header-meta">
        <div class="meta-row">
          <span class="meta-label">Generated</span><span class="meta-value">${esc(generated)}</span><span class="meta-sep">·</span><span class="meta-label">ID</span><span class="meta-value">${esc(report.reportId)}</span>
        </div>
      </div>
    </header>

    ${statusBanner(report)}

    ${summaryGrid(report)}

    ${warningsBar(report.arrayWarnings)}

    ${searchHtml}

    <div class="section-label">${sectionLabel}</div>

    ${cards}

    ${aboutSection()}

    ${reportFooter(report.version, generated, report.reportId)}

  </div>
  ${scriptHtml}
</body>
</html>`;
}
