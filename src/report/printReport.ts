import type { ReportData, ReportLocaleResult } from "./createReportData.js";
import { bold, cyan, green, red, yellow, blue, gray, dim } from "../ui/colors.js";
import { DIVIDER, CHECK, CROSS } from "../ui/fmt.js";

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

function printKeys(keys: string[], label: string, color: (s: string) => string): void {
  if (keys.length === 0) return;

  const shown = keys.slice(0, KEY_DISPLAY_LIMIT);
  const remaining = keys.length - shown.length;

  console.log(`  ${color(label)}`);
  for (const key of shown) {
    console.log(`    ${dim("·")} ${key}`);
  }
  if (remaining > 0) {
    console.log(`    ${gray(`... and ${remaining} more`)}`);
  }
  console.log("");
}

function printLocale(locale: ReportLocaleResult): void {
  const hasFailed =
    locale.missing.count > 0 ||
    locale.empty.count > 0 ||
    locale.placeholderMismatch.count > 0;

  const symbol = hasFailed ? red(CROSS) : green(CHECK);
  const name = bold(localeName(locale.locale));

  console.log(`${symbol} ${name}`);
  console.log("");
  console.log(`  Coverage: ${coverageColor(locale.coverage)(`${locale.coverage}%`)}`);
  console.log("");

  if (locale.missing.count > 0) {
    console.log(`  Missing:              ${red(String(locale.missing.count))}`);
  }
  if (locale.empty.count > 0) {
    console.log(`  Empty:                ${yellow(String(locale.empty.count))}`);
  }
  if (locale.extra.count > 0) {
    console.log(`  Unknown:              ${gray(String(locale.extra.count))}`);
  }
  if (locale.placeholderMismatch.count > 0) {
    console.log(`  Placeholder mismatch: ${yellow(String(locale.placeholderMismatch.count))}`);
  }

  const hasAnyCounts =
    locale.missing.count > 0 ||
    locale.empty.count > 0 ||
    locale.extra.count > 0 ||
    locale.placeholderMismatch.count > 0;

  if (hasAnyCounts) {
    console.log("");
    printKeys(locale.missing.keys, "Missing keys", red);
    printKeys(locale.empty.keys, "Empty keys", yellow);
    printKeys(locale.extra.keys, "Unknown keys", gray);
    printKeys(locale.placeholderMismatch.keys, "Placeholder mismatch keys", yellow);
  }
}

function coverageColor(coverage: number): (s: string) => string {
  if (coverage >= 99) return green;
  if (coverage >= 90) return yellow;
  return red;
}

export function printReport(report: ReportData): void {
  const now = new Date(report.generatedAt);
  const generated = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  console.log("");
  console.log(DIVIDER);
  console.log(bold(cyan("i18n-inspector")) + " " + dim(`v${report.version}`) + "  " + dim("Translation Audit Report"));
  console.log(DIVIDER);
  console.log("");
  console.log(`Generated: ${dim(generated)}  ${dim(`Report ID: ${report.reportId}`)}`);
  console.log("");

  for (const locale of report.locales) {
    console.log(DIVIDER);
    console.log("");
    printLocale(locale);
  }

  console.log(DIVIDER);
  console.log("");
  console.log(bold(blue("Summary")));
  console.log("");
  console.log(`Locales checked:      ${report.localesChecked}`);
  console.log(`Average coverage:     ${coverageColor(report.averageCoverage)(`${report.averageCoverage}%`)}`);
  if (report.totalMissing > 0)
    console.log(`Total missing:        ${red(String(report.totalMissing))}`);
  if (report.totalEmpty > 0)
    console.log(`Total empty:          ${yellow(String(report.totalEmpty))}`);
  if (report.totalUnknown > 0)
    console.log(`Total unknown:        ${gray(String(report.totalUnknown))}`);
  if (report.totalPlaceholderMismatch > 0)
    console.log(`Total ph. mismatch:   ${yellow(String(report.totalPlaceholderMismatch))}`);
  console.log("");

  const failed = report.locales.some(
    (l) =>
      l.missing.count > 0 ||
      l.empty.count > 0 ||
      l.placeholderMismatch.count > 0,
  );

  console.log(`Status: ${failed ? bold(red("FAILED")) : bold(green("PASSED"))}`);
  console.log("");
  console.log(DIVIDER);
  console.log("");
}
