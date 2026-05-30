import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runCli } from "../src/cli/runCli.js";

const tempDirs: string[] = [];

async function createTempDirectory() {
  const dir = await mkdtemp(
    join(tmpdir(), "i18n-check-"),
  );

  tempDirs.push(dir);

  return dir;
}

async function writeProject(
  dir: string,
  heMessages: Record<string, unknown>,
): Promise<void> {
  await mkdir(
    join(dir, "messages"),
  );

  await writeFile(
    join(dir, "i18n-inspector.config.json"),
    JSON.stringify({
      structure: "file-per-locale",
      localesPath: "./messages",
      sourceLocale: "en",
      targetLocales: ["he"],
    }),
  );

  await writeFile(
    join(dir, "messages", "en.json"),
    JSON.stringify({
      title: "Hello {{name}}",
    }),
  );

  await writeFile(
    join(dir, "messages", "he.json"),
    JSON.stringify(heMessages),
  );
}

afterEach(async () => {
  vi.restoreAllMocks();
  process.exitCode = undefined;

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

describe("runCli", () => {
  it("sets exit code 0 when checks pass", async () => {
    const dir =
      await createTempDirectory();

    await writeProject(
      dir,
      {
        title: "Shalom {{name}}",
      },
    );

    vi.spyOn(console, "log").mockImplementation(
      () => {},
    );

    await runCli(
      [],
      dir,
    );

    expect(process.exitCode).toBe(0);
  });

  it("sets exit code 1 for missing translations", async () => {
    const dir =
      await createTempDirectory();

    await writeProject(
      dir,
      {},
    );

    vi.spyOn(console, "log").mockImplementation(
      () => {},
    );

    await runCli(
      [],
      dir,
    );

    expect(process.exitCode).toBe(1);
  });

  it("sets exit code 1 for empty translations", async () => {
    const dir =
      await createTempDirectory();

    await writeProject(
      dir,
      {
        title: "",
      },
    );

    vi.spyOn(console, "log").mockImplementation(
      () => {},
    );

    await runCli(
      [],
      dir,
    );

    expect(process.exitCode).toBe(1);
  });

  it("sets exit code 1 for placeholder mismatches", async () => {
    const dir =
      await createTempDirectory();

    await writeProject(
      dir,
      {
        title: "Shalom",
      },
    );

    vi.spyOn(console, "log").mockImplementation(
      () => {},
    );

    await runCli(
      [],
      dir,
    );

    expect(process.exitCode).toBe(1);
  });
});
