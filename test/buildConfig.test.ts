import { describe, expect, it } from "vitest";

import {
  buildConfig,
  type I18nCheckConfig,
} from "../src/init/buildConfig.js";

import type { LocaleRootCandidate } from "../src/init/detectLocaleRoots.js";

describe("buildConfig", () => {
  it("builds a valid config for file-per-locale structure", () => {
    const candidate: LocaleRootCandidate = {
      path: "messages",
      structure: "file-per-locale",
      locales: ["en", "he", "fr"],
    };

    const result = buildConfig(
      candidate,
    );

    const expected: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he", "fr"],
      ignore: [
        "node_modules",
        ".next",
        "dist",
        "build",
        "coverage",
      ],
    };

    expect(result).toEqual(expected);
  });

  it("builds a valid config for locale-directories structure", () => {
    const candidate: LocaleRootCandidate = {
      path: "locales",
      structure: "locale-directories",
      locales: ["en", "he"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result).toEqual({
      structure: "locale-directories",
      localesPath: "./locales",
      sourceLocale: "en",
      targetLocales: ["he"],
      ignore: [
        "node_modules",
        ".next",
        "dist",
        "build",
        "coverage",
      ],
    });
  });

  it("removes source locale from targetLocales", () => {
    const candidate: LocaleRootCandidate = {
      path: "messages",
      structure: "file-per-locale",
      locales: ["en", "he", "fr", "de"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.targetLocales).toEqual([
      "he",
      "fr",
      "de",
    ]);

    expect(result.targetLocales).not.toContain(
      "en",
    );
  });

  it("adds ./ prefix when missing", () => {
    const candidate: LocaleRootCandidate = {
      path: "apps/web/messages",
      structure: "file-per-locale",
      locales: ["en", "he"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.localesPath).toBe(
      "./apps/web/messages",
    );
  });

  it("preserves existing ./ prefix", () => {
    const candidate: LocaleRootCandidate = {
      path: "./messages",
      structure: "file-per-locale",
      locales: ["en", "he"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.localesPath).toBe(
      "./messages",
    );
  });

  it("builds localesPath relative to project root", () => {
    const candidate: LocaleRootCandidate = {
      path: "sandbox/messages",
      structure: "file-per-locale",
      locales: ["en", "he"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.localesPath).toBe(
      "./sandbox/messages",
    );
  });

  it("throws when source locale cannot be determined", () => {
    const candidate: LocaleRootCandidate = {
      path: "messages",
      structure: "file-per-locale",
      locales: ["he", "fr"],
    };

    expect(() =>
      buildConfig(
        candidate,
      ),
    ).toThrow(
      "Could not determine source locale.",
    );
  });

  it("supports a single target locale", () => {
    const candidate: LocaleRootCandidate = {
      path: "messages",
      structure: "file-per-locale",
      locales: ["en", "he"],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.targetLocales).toEqual([
      "he",
    ]);
  });

  it("supports multiple target locales", () => {
    const candidate: LocaleRootCandidate = {
      path: "messages",
      structure: "file-per-locale",
      locales: [
        "en",
        "he",
        "fr",
        "de",
        "es",
      ],
    };

    const result = buildConfig(
      candidate,
    );

    expect(result.targetLocales).toEqual([
      "he",
      "fr",
      "de",
      "es",
    ]);
  });
});
