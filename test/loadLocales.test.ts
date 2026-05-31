import { afterEach, describe, expect, it } from "vitest";
import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadLocales } from "../src/check/loadLocales.js";

import type { I18nCheckConfig } from "../src/init/buildConfig.js";

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

describe("loadLocales", () => {
  it("loads file-per-locale files", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "messages"),
    );

    await writeFile(
      join(dir, "messages", "en.json"),
      JSON.stringify({
        greeting: "Hello",
      }),
    );

    await writeFile(
      join(dir, "messages", "he.json"),
      JSON.stringify({
        greeting: "Shalom",
      }),
    );

    const config: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).resolves.toEqual({
      en: {
        greeting: "Hello",
      },
      he: {
        greeting: "Shalom",
      },
    });
  });

  it("loads locale-directories namespaces", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "locales", "en"),
      {
        recursive: true,
      },
    );

    await mkdir(
      join(dir, "locales", "he"),
      {
        recursive: true,
      },
    );

    await writeFile(
      join(dir, "locales", "en", "common.json"),
      JSON.stringify({
        greeting: "Hello",
      }),
    );

    await writeFile(
      join(dir, "locales", "en", "dashboard.json"),
      JSON.stringify({
        title: "Dashboard",
      }),
    );

    await writeFile(
      join(dir, "locales", "he", "common.json"),
      JSON.stringify({
        greeting: "Shalom",
      }),
    );

    await writeFile(
      join(dir, "locales", "he", "dashboard.json"),
      JSON.stringify({
        title: "Dashboard",
      }),
    );

    const config: I18nCheckConfig = {
      structure: "locale-directories",
      localesPath: "./locales",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).resolves.toEqual({
      en: {
        greeting: "Hello",
        title: "Dashboard",
      },
      he: {
        greeting: "Shalom",
        title: "Dashboard",
      },
    });
  });

  it("deep merges locale-directories namespaces deterministically", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "locales", "en"),
      {
        recursive: true,
      },
    );

    await mkdir(
      join(dir, "locales", "he"),
      {
        recursive: true,
      },
    );

    await writeFile(
      join(dir, "locales", "en", "common.json"),
      JSON.stringify({
        nested: {
          title: "Common",
          subtitle: "Welcome",
        },
      }),
    );

    await writeFile(
      join(dir, "locales", "en", "dashboard.json"),
      JSON.stringify({
        nested: {
          title: "Dashboard",
        },
      }),
    );

    await writeFile(
      join(dir, "locales", "he", "common.json"),
      JSON.stringify({
        nested: {
          title: "Common",
          subtitle: "Welcome",
        },
      }),
    );

    await writeFile(
      join(dir, "locales", "he", "dashboard.json"),
      JSON.stringify({
        nested: {
          title: "Dashboard",
        },
      }),
    );

    const config: I18nCheckConfig = {
      structure: "locale-directories",
      localesPath: "./locales",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).resolves.toEqual({
      en: {
        nested: {
          subtitle: "Welcome",
          title: "Dashboard",
        },
      },
      he: {
        nested: {
          subtitle: "Welcome",
          title: "Dashboard",
        },
      },
    });
  });

  it("throws when locale file is missing", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "messages"),
    );

    await writeFile(
      join(dir, "messages", "en.json"),
      JSON.stringify({
        greeting: "Hello",
      }),
    );

    const config: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).rejects.toThrow();
  });

  it("throws when locale directory has no JSON files", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "locales", "en"),
      {
        recursive: true,
      },
    );

    await mkdir(
      join(dir, "locales", "he"),
      {
        recursive: true,
      },
    );

    await writeFile(
      join(dir, "locales", "en", "common.json"),
      JSON.stringify({
        greeting: "Hello",
      }),
    );

    const config: I18nCheckConfig = {
      structure: "locale-directories",
      localesPath: "./locales",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).rejects.toThrow(
      "No locale JSON files found:\n./locales/he",
    );
  });

  it("preserves nested objects", async () => {
    const dir =
      await createTempDirectory();

    const nestedMessages = {
      home: {
        title: "Home",
        cta: {
          primary: "Start",
        },
      },
    };

    await mkdir(
      join(dir, "messages"),
    );

    await writeFile(
      join(dir, "messages", "en.json"),
      JSON.stringify(nestedMessages),
    );

    await writeFile(
      join(dir, "messages", "he.json"),
      JSON.stringify({
        home: {
          title: "Home",
          cta: {
            primary: "Start",
          },
        },
      }),
    );

    const config: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    const locales = await loadLocales(
      config,
      dir,
    );

    expect(locales.en).toEqual(
      nestedMessages,
    );
  });

  it("throws a clear error for invalid JSON", async () => {
    const dir =
      await createTempDirectory();

    await mkdir(
      join(dir, "messages"),
    );

    await writeFile(
      join(dir, "messages", "en.json"),
      JSON.stringify({
        greeting: "Hello",
      }),
    );

    await writeFile(
      join(dir, "messages", "he.json"),
      "{",
    );

    const config: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(
        config,
        dir,
      ),
    ).rejects.toThrow(
      "Invalid JSON syntax in:\n./messages/he.json",
    );
  });

  it("loads a file with UTF-8 BOM successfully", async () => {
    const dir = await createTempDirectory();

    await mkdir(join(dir, "messages"));

    await writeFile(
      join(dir, "messages", "en.json"),
      JSON.stringify({ greeting: "Hello" }),
    );

    // Write he.json with BOM prefix
    const bomContent = "﻿" + JSON.stringify({ greeting: "Shalom" });
    await writeFile(
      join(dir, "messages", "he.json"),
      bomContent,
      "utf8",
    );

    const config: I18nCheckConfig = {
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(config, dir),
    ).resolves.toEqual({
      en: { greeting: "Hello" },
      he: { greeting: "Shalom" },
    });
  });

  it("loads locale-directory files with UTF-8 BOM successfully", async () => {
    const dir = await createTempDirectory();

    await mkdir(join(dir, "locales", "en"), { recursive: true });
    await mkdir(join(dir, "locales", "he"), { recursive: true });

    await writeFile(
      join(dir, "locales", "en", "common.json"),
      JSON.stringify({ title: "Hello" }),
    );

    const bomContent = "﻿" + JSON.stringify({ title: "Shalom" });
    await writeFile(
      join(dir, "locales", "he", "common.json"),
      bomContent,
      "utf8",
    );

    const config: I18nCheckConfig = {
      structure: "locale-directories",
      localesPath: "./locales",
      sourceLocale: "en",
      targetLocales: ["he"],
    };

    await expect(
      loadLocales(config, dir),
    ).resolves.toEqual({
      en: { title: "Hello" },
      he: { title: "Shalom" },
    });
  });

  it.each([
    {
      name: "array",
      value: [],
    },
    {
      name: "null",
      value: null,
    },
    {
      name: "number",
      value: 123,
    },
    {
      name: "boolean",
      value: true,
    },
  ])(
    "throws when locale file root is $name",
    async ({ value }) => {
      const dir =
        await createTempDirectory();

      await mkdir(
        join(dir, "messages"),
      );

      await writeFile(
        join(dir, "messages", "en.json"),
        JSON.stringify({
          greeting: "Hello",
        }),
      );

      await writeFile(
        join(dir, "messages", "he.json"),
        JSON.stringify(value),
      );

      const config: I18nCheckConfig = {
        structure: "file-per-locale",
        localesPath: "./messages",
        sourceLocale: "en",
        targetLocales: ["he"],
      };

      await expect(
        loadLocales(
          config,
          dir,
        ),
      ).rejects.toThrow(
        "Invalid locale file — expected a JSON object:",
      );
    },
  );
});
