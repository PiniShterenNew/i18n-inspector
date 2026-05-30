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
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { initCommand } from "../src/init/initCommand.js";

const originalCwd = process.cwd();
const tempDirs: string[] = [];

async function createTempDirectory() {
  const dir = await mkdtemp(
    join(tmpdir(), "i18n-check-"),
  );

  tempDirs.push(dir);

  return dir;
}

afterEach(async () => {
  process.chdir(originalCwd);
  vi.restoreAllMocks();

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

describe("initCommand", () => {
  it("writes config in project root with nested localesPath", async () => {
    const dir =
      await createTempDirectory();

    const messagesDir = join(
      dir,
      "packages",
      "client",
      "src",
      "messages",
    );

    await mkdir(
      messagesDir,
      {
        recursive: true,
      },
    );

    await writeFile(
      join(messagesDir, "en.json"),
      JSON.stringify({
        title: "Hello",
      }),
    );

    await writeFile(
      join(messagesDir, "he.json"),
      JSON.stringify({
        title: "Shalom",
      }),
    );

    vi.spyOn(console, "log").mockImplementation(
      () => {},
    );

    process.chdir(dir);

    await initCommand();

    const configPath = join(
      dir,
      "i18n-inspector.config.json",
    );

    const config = JSON.parse(
      await readFile(
        configPath,
        "utf8",
      ),
    ) as {
      localesPath: string;
    };

    expect(config.localesPath).toBe(
      "./packages/client/src/messages",
    );
  });
});
