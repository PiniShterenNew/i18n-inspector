import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { I18nCheckConfig } from "./buildConfig.js";

export const CONFIG_FILE_NAME =
  "i18n-inspector.config.json";

export async function writeConfig(
  directory: string,
  config: I18nCheckConfig,
): Promise<string> {
  const configPath = join(
    directory,
    CONFIG_FILE_NAME,
  );

  const content = JSON.stringify(
    config,
    null,
    2,
  );

  await writeFile(
    configPath,
    `${content}\n`,
    "utf8",
  );

  return configPath;
}