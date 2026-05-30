import type { LocaleCheckResult } from "../check/runCheck.js";

export interface ReportIssueGroup {
  count: number;
  keys: string[];
}

export interface ReportLocaleResult {
  locale: string;
  coverage: number;
  missing: ReportIssueGroup;
  empty: ReportIssueGroup;
  extra: ReportIssueGroup;
  placeholderMismatch: ReportIssueGroup;
}

export interface ReportData {
  version: string;
  reportId: string;
  generatedAt: string;
  localesChecked: number;
  averageCoverage: number;
  totalMissing: number;
  totalEmpty: number;
  totalUnknown: number;
  totalPlaceholderMismatch: number;
  locales: ReportLocaleResult[];
}

function makeReportId(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${mo}${d}-${h}${mi}`;
}

export function createReportData(
  results: LocaleCheckResult[],
  version = "0.1.0",
  generatedAt = new Date().toISOString(),
): ReportData {
  const date = new Date(generatedAt);
  return {
    version,
    reportId: makeReportId(date),
    generatedAt,
    localesChecked: results.length,
    averageCoverage: calculateAverageCoverage(results),
    totalMissing: results.reduce((s, r) => s + r.missing, 0),
    totalEmpty: results.reduce((s, r) => s + r.empty, 0),
    totalUnknown: results.reduce((s, r) => s + r.extra, 0),
    totalPlaceholderMismatch: results.reduce((s, r) => s + r.placeholderMismatch, 0),
    locales: results.map((result) => ({
      locale: result.locale,
      coverage: result.coverage,
      missing: {
        count: result.missing,
        keys: result.missingKeys,
      },
      empty: {
        count: result.empty,
        keys: result.emptyKeys,
      },
      extra: {
        count: result.extra,
        keys: result.extraKeys,
      },
      placeholderMismatch: {
        count: result.placeholderMismatch,
        keys: result.placeholderMismatchKeys,
      },
    })),
  };
}

function calculateAverageCoverage(
  results: LocaleCheckResult[],
): number {
  if (results.length === 0) {
    return 100;
  }

  return Number(
    (
      results.reduce(
        (sum, result) =>
          sum + result.coverage,
        0,
      ) / results.length
    ).toFixed(2),
  );
}
