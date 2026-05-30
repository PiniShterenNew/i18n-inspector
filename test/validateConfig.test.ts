import { describe, expect, it } from "vitest";

import { validateConfig } from "../src/config/validateConfig.js";

describe("validateConfig", () => {
  it("returns a valid config", () => {
    const config = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
      ignore: [
        "node_modules/**",
      ],
    };

    expect(
      validateConfig(config),
    ).toEqual(config);
  });

  it("rejects unsupported structures", () => {
    expect(() =>
      validateConfig({
        structure: "nested",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: ["he"],
      }),
    ).toThrow(
      'structure must be "file-per-locale" or "locale-directories"',
    );
  });

  it("rejects invalid localesPath", () => {
    expect(() =>
      validateConfig({
        structure: "file-per-locale",
        localesPath: "",
        sourceLocale: "en",
        targetLocales: ["he"],
      }),
    ).toThrow(
      "localesPath must be a non-empty string",
    );
  });

  it("rejects invalid sourceLocale", () => {
    expect(() =>
      validateConfig({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: 123,
        targetLocales: ["he"],
      }),
    ).toThrow(
      "sourceLocale must be a string",
    );
  });

  it("rejects invalid targetLocales", () => {
    expect(() =>
      validateConfig({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: [],
      }),
    ).toThrow(
      "targetLocales must be a non-empty array of strings",
    );
  });

  it("rejects invalid ignore", () => {
    expect(() =>
      validateConfig({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: ["he"],
        ignore: ["dist/**", 123],
      }),
    ).toThrow(
      "ignore must be an array of strings",
    );
  });

  it("reports multiple config errors", () => {
    expect(() =>
      validateConfig({
        structure: "nested",
        localesPath: "",
        sourceLocale: 123,
        targetLocales: [],
      }),
    ).toThrow(
      [
        "Invalid config:",
        '* structure must be "file-per-locale" or "locale-directories"',
        "* localesPath must be a non-empty string",
        "* sourceLocale must be a string",
        "* targetLocales must be a non-empty array of strings",
      ].join("\n"),
    );
  });

  it("rejects non-object configs", () => {
    expect(() =>
      validateConfig(null),
    ).toThrow(
      "config must be a JSON object",
    );
  });
});
