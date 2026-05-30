import type { I18nCheckConfig } from "../init/buildConfig.js";

const SUPPORTED_STRUCTURES = [
  "file-per-locale",
  "locale-directories",
] as const;

export function validateConfig(
  config: unknown,
): I18nCheckConfig {
  const errors: string[] = [];

  if (!isObject(config)) {
    errors.push(
      "config must be a JSON object",
    );

    throwInvalidConfig(errors);
  }

  if (
    !SUPPORTED_STRUCTURES.includes(
      config.structure as never,
    )
  ) {
    errors.push(
      'structure must be "file-per-locale" or "locale-directories"',
    );
  }

  if (
    typeof config.localesPath !== "string" ||
    config.localesPath.trim() === ""
  ) {
    errors.push(
      "localesPath must be a non-empty string",
    );
  }

  if (
    typeof config.sourceLocale !== "string" ||
    config.sourceLocale.trim() === ""
  ) {
    errors.push(
      "sourceLocale must be a string",
    );
  }

  if (
    !Array.isArray(config.targetLocales) ||
    config.targetLocales.length === 0 ||
    !config.targetLocales.every(
      (locale) =>
        typeof locale === "string" &&
        locale.trim() !== "",
    )
  ) {
    errors.push(
      "targetLocales must be a non-empty array of strings",
    );
  }

  if (
    "ignore" in config &&
    config.ignore !== undefined &&
    (
      !Array.isArray(config.ignore) ||
      !config.ignore.every(
        (pattern) =>
          typeof pattern === "string",
      )
    )
  ) {
    errors.push(
      "ignore must be an array of strings",
    );
  }

  if (errors.length > 0) {
    throwInvalidConfig(errors);
  }

  const validConfig: I18nCheckConfig = {
    structure: config.structure as I18nCheckConfig["structure"],
    localesPath: config.localesPath as string,
    sourceLocale: config.sourceLocale as string,
    targetLocales: config.targetLocales as string[],
  };

  if (config.ignore !== undefined) {
    validConfig.ignore =
      config.ignore as string[];
  }

  return validConfig;
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function throwInvalidConfig(
  errors: string[],
): never {
  throw new Error(
    [
      "Invalid config:",
      ...errors.map(
        (error) => `* ${error}`,
      ),
    ].join("\n"),
  );
}
