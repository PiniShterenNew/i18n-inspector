import { describe, expect, it, afterEach } from "vitest";
import {
  mkdtemp,
  readFile,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  writeConfig,
  CONFIG_FILE_NAME,
} from "../src/init/writeConfig.js";

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

describe("writeConfig", () => {
  it("writes config file", async () => {
    const dir =
      await createTempDirectory();

    const config = {
      structure: "file-per-locale" as const,
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
      ignore: ["node_modules"],
    };

    const path = await writeConfig(
      dir,
      config,
    );

    const content = await readFile(
      path,
      "utf8",
    );

    expect(content).toContain(
      '"sourceLocale": "en"',
    );

    expect(content).toContain(
      '"targetLocales"'
    );
  });

  it("returns written file path", async () => {
    const dir =
      await createTempDirectory();

    const config = {
      structure: "file-per-locale" as const,
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    const path = await writeConfig(
      dir,
      config,
    );

    expect(path).toBe(
      join(dir, CONFIG_FILE_NAME),
    );
  });

  it("writes valid json", async () => {
    const dir =
      await createTempDirectory();

    const config = {
      structure: "file-per-locale" as const,
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    const path = await writeConfig(
      dir,
      config,
    );

    const content = await readFile(
      path,
      "utf8",
    );

    expect(() =>
      JSON.parse(content),
    ).not.toThrow();
  });
});