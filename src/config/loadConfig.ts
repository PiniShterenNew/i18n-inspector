import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { I18nCheckConfig } from "../init/buildConfig.js";
import { validateConfig } from "./validateConfig.js";

const CONFIG_FILE_NAME = "i18n-inspector.config.json";

export async function loadConfig(
  cwd = process.cwd(),
): Promise<I18nCheckConfig> {
  const configPath = join(
    cwd,
    CONFIG_FILE_NAME,
  );

  let content: string;

  try {
    content = await readFile(configPath, "utf8");
  } catch {
    throw new Error(
      "Config file not found.\n\n" +
      "  Expected: i18n-inspector.config.json\n\n" +
      "  Next step:\n\n" +
      "    npx i18n-inspector init\n\n" +
      "  Or create it manually — see --help for the format.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const clean = raw.replace(/ in JSON at position \d+/, "");
    throw new Error(
      `i18n-inspector.config.json contains invalid JSON.\n\n` +
      `  Error: ${clean}\n\n` +
      `  Fix the syntax and run again.`,
    );
  }

  return validateConfig(parsed);
}
