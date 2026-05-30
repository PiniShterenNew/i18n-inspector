import { describe, expect, it } from "vitest";

import { runCheck } from "../src/check/runCheck.js";

import type { LocaleMap } from "../src/check/loadLocales.js";
import type { I18nCheckConfig } from "../src/init/buildConfig.js";

const baseConfig: I18nCheckConfig = {
  structure: "file-per-locale",
  localesPath: "./messages",
  sourceLocale: "en",
  targetLocales: ["he"],
};

describe("runCheck", () => {
  it("returns 100 coverage for perfect translation", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello",
      },
      he: {
        title: "Shalom",
      },
    };

    const results = await runCheck(baseConfig, locales);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      locale: "he",
      missing: 0,
      extra: 0,
      empty: 0,
      placeholderMismatch: 0,
      coverage: 100,
    });
  });

  it("counts missing translations", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello",
        subtitle: "Welcome",
      },
      he: {
        title: "Shalom",
      },
    };

    const results = await runCheck(
      baseConfig,
      locales,
    );

    expect(results[0]!.missing).toBe(1);
    expect(results[0]!.coverage).toBeLessThan(100);
  });

  it("counts empty translations", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello",
      },
      he: {
        title: "",
      },
    };

    const results = await runCheck(
      baseConfig,
      locales,
    );

    expect(results[0]!.empty).toBe(1);
  });

  it("counts placeholder mismatches", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello {{name}}",
      },
      he: {
        title: "Shalom",
      },
    };

    const results = await runCheck(
      baseConfig,
      locales,
    );

    expect(
      results[0]!.placeholderMismatch,
    ).toBe(1);
  });

  it("counts extra translations", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello",
      },
      he: {
        title: "Shalom",
        legacy: "Legacy",
      },
    };

    const results = await runCheck(
      baseConfig,
      locales,
    );

    expect(results[0]!.extra).toBe(1);
  });

  it("checks multiple target locales", async () => {
    const config: I18nCheckConfig = {
      ...baseConfig,
      targetLocales: [
        "he",
        "fr",
      ],
    };

    const locales: LocaleMap = {
      en: {
        title: "Hello",
      },
      he: {
        title: "Shalom",
      },
      fr: {
        title: "Bonjour",
      },
    };

    const results = await runCheck(
      config,
      locales,
    );

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.locale)).toEqual([
      "he",
      "fr",
    ]);
  });

  it("throws when source locale is missing", async () => {
    const locales: LocaleMap = {
      he: {
        title: "Shalom",
      },
    };

    await expect(
      runCheck(
        baseConfig,
        locales,
      ),
    ).rejects.toThrow(
      'Source locale "en" was not loaded.',
    );
  });

  it("throws when target locale is missing", async () => {
    const locales: LocaleMap = {
      en: {
        title: "Hello",
      },
    };

    await expect(
      runCheck(
        baseConfig,
        locales,
      ),
    ).rejects.toThrow(
      'Locale "he" was not loaded.',
    );
  });
});
