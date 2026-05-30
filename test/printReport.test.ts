import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ReportData } from "../src/report/createReportData.js";
import { printReport } from "../src/report/printReport.js";

function makeReport(
  locales: Array<{
    locale: string;
    coverage: number;
    missing?: number;
    missingKeys?: string[];
    extra?: number;
    extraKeys?: string[];
    empty?: number;
    emptyKeys?: string[];
    placeholderMismatch?: number;
    placeholderMismatchKeys?: string[];
  }>,
): ReportData {
  const results = locales.map((l) => ({
    locale: l.locale,
    coverage: l.coverage,
    missing: { count: l.missing ?? 0, keys: l.missingKeys ?? [] },
    extra: { count: l.extra ?? 0, keys: l.extraKeys ?? [] },
    empty: { count: l.empty ?? 0, keys: l.emptyKeys ?? [] },
    placeholderMismatch: {
      count: l.placeholderMismatch ?? 0,
      keys: l.placeholderMismatchKeys ?? [],
    },
  }));

  const averageCoverage =
    results.length === 0
      ? 100
      : Number(
          (
            results.reduce((sum, r) => sum + r.coverage, 0) /
            results.length
          ).toFixed(2),
        );

  return {
    version: "0.1.0",
    reportId: "20260101-0000",
    generatedAt: new Date().toISOString(),
    localesChecked: results.length,
    averageCoverage,
    totalMissing: results.reduce((s, r) => s + r.missing.count, 0),
    totalEmpty: results.reduce((s, r) => s + r.empty.count, 0),
    totalUnknown: results.reduce((s, r) => s + r.extra.count, 0),
    totalPlaceholderMismatch: results.reduce((s, r) => s + r.placeholderMismatch.count, 0),
    locales: results,
  };
}

function loggedLines(log: ReturnType<typeof vi.spyOn>): string[] {
  return log.mock.calls.map((call) => {
    const arg = call[0];
    return typeof arg === "string"
      ? arg.replace(/\x1b\[[0-9;]*m/g, "")
      : String(arg);
  });
}

describe("printReport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints locale name and coverage", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(makeReport([{ locale: "he", coverage: 100 }]));

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("Hebrew (he)"))).toBe(true);
    expect(lines.some((l) => l.includes("Coverage:"))).toBe(true);
    expect(lines.some((l) => l.includes("100%"))).toBe(true);
  });

  it("prints missing count when > 0", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(
      makeReport([{ locale: "fr", coverage: 75, missing: 2 }]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("Missing") && l.includes("2"))).toBe(true);
  });

  it("prints extra count when > 0", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(
      makeReport([{ locale: "fr", coverage: 100, extra: 1 }]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("Unknown") && l.includes("1"))).toBe(true);
  });

  it("prints summary section", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(
      makeReport([
        { locale: "he", coverage: 100 },
        { locale: "fr", coverage: 75, missing: 2, empty: 1 },
      ]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("Summary"))).toBe(true);
    expect(lines.some((l) => l.includes("Locales checked") && l.includes("2"))).toBe(true);
    expect(lines.some((l) => l.includes("Average coverage") && l.includes("87.5%"))).toBe(true);
  });

  it("prints PASSED status when no issues", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(makeReport([{ locale: "he", coverage: 100 }]));

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("PASSED"))).toBe(true);
  });

  it("prints FAILED status when issues exist", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(
      makeReport([{ locale: "fr", coverage: 75, missing: 3 }]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("FAILED"))).toBe(true);
  });

  it("lists individual keys when provided", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printReport(
      makeReport([
        {
          locale: "fr",
          coverage: 80,
          missing: 2,
          missingKeys: ["home.title", "home.subtitle"],
        },
      ]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("home.title"))).toBe(true);
    expect(lines.some((l) => l.includes("home.subtitle"))).toBe(true);
  });

  it("truncates key list at 20 and shows overflow count", () => {
    const log = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const keys = Array.from({ length: 25 }, (_, i) => `key.${i}`);

    printReport(
      makeReport([
        { locale: "fr", coverage: 50, missing: 25, missingKeys: keys },
      ]),
    );

    const lines = loggedLines(log);
    expect(lines.some((l) => l.includes("and 5 more"))).toBe(true);
  });
});
