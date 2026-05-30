import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { loadConfig } from "../src/config/loadConfig.js";

const tempDirs: string[] = [];

async function createTempDirectory() {
  const dir = await mkdtemp(
    join(tmpdir(), "i18n-check-"),
  );

  tempDirs.push(dir);

  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.map((dir) =>
      rm(dir, {
        recursive: true,
        force: true,
      }),
    ),
  );

  tempDirs.length = 0;
});

describe("loadConfig", () => {
  it("loads config file", async () => {
    const dir =
      await createTempDirectory();

    await writeFile(
      join(dir, "i18n-inspector.config.json"),
      JSON.stringify({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: ["he"],
      }),
    );

    const config =
      await loadConfig(dir);

    expect(config).toEqual({
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    });
  });

  it("throws when config does not exist", async () => {
    const dir =
      await createTempDirectory();

    await expect(
      loadConfig(dir),
    ).rejects.toThrow(
      "Config file not found.",
    );
  });

  it("loads ignore patterns", async () => {
    const dir =
      await createTempDirectory();

    await writeFile(
      join(dir, "i18n-inspector.config.json"),
      JSON.stringify({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: ["he"],
        ignore: [
          "node_modules",
          ".next",
        ],
      }),
    );

    const config =
      await loadConfig(dir);

    expect(config.ignore).toEqual([
      "node_modules",
      ".next",
    ]);
  });

  it("throws when config is invalid", async () => {
    const dir =
      await createTempDirectory();

    await writeFile(
      join(dir, "i18n-inspector.config.json"),
      JSON.stringify({
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: [],
      }),
    );

    await expect(
      loadConfig(dir),
    ).rejects.toThrow(
      "targetLocales must be a non-empty array of strings",
    );
  });
});
