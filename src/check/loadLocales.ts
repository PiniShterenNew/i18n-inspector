import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";

import type { I18nCheckConfig } from "../init/buildConfig.js";

export type LocaleMap = Record<
  string,
  Record<string, unknown>
>;

export async function loadLocales(
  config: I18nCheckConfig,
  cwd = process.cwd(),
): Promise<LocaleMap> {
  switch (config.structure) {
    case "file-per-locale":
      return loadFilePerLocale(
        config,
        cwd,
      );

    case "locale-directories":
      return loadLocaleDirectories(
        config,
        cwd,
      );

    default:
      throw new Error(
        `Unsupported structure: ${config.structure}`,
      );
  }
}

async function loadFilePerLocale(
  config: I18nCheckConfig,
  cwd: string,
): Promise<LocaleMap> {
  const locales: LocaleMap = {};

  const localeCodes = [
    config.sourceLocale,
    ...config.targetLocales,
  ];

  for (const locale of localeCodes) {
    const path = join(
      cwd,
      config.localesPath,
      `${locale}.json`,
    );

    locales[locale] = await readJsonFile(
      path,
      join(
        config.localesPath,
        `${locale}.json`,
      ),
    );
  }

  return locales;
}

async function loadLocaleDirectories(
  config: I18nCheckConfig,
  cwd: string,
): Promise<LocaleMap> {
  const locales: LocaleMap = {};

  const localeCodes = [
    config.sourceLocale,
    ...config.targetLocales,
  ];

  for (const locale of localeCodes) {
    const localeDirectory = join(
      cwd,
      config.localesPath,
      locale,
    );

    const paths = await glob(
      "**/*.json",
      {
        cwd: localeDirectory,
        nodir: true,
        windowsPathsNoEscape: true,
      },
    );

    const sortedPaths = paths.sort();

    if (sortedPaths.length === 0) {
      throw new Error(
        `No locale JSON files found:\n${normalizeDisplayPath(
          join(
            config.localesPath,
            locale,
          ),
        )}`,
      );
    }

    const merged: Record<string, unknown> = {};

    for (const relativePath of sortedPaths) {
      const namespace = await readJsonFile(
        join(
          localeDirectory,
          relativePath,
        ),
        join(
          config.localesPath,
          locale,
          relativePath,
        ),
      );

      deepMerge(
        merged,
        namespace,
      );
    }

    locales[locale] = merged;
  }

  return locales;
}

async function readJsonFile(
  path: string,
  displayPath: string,
): Promise<Record<string, unknown>> {
  const content = await readFile(
    path,
    "utf8",
  );

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error(
      buildJsonParseError(
        normalizeDisplayPath(displayPath),
        content,
        err,
      ),
    );
  }

  if (!isPlainObject(parsed)) {
    throw new Error(
      `Invalid locale file — expected a JSON object:\n${normalizeDisplayPath(displayPath)}`,
    );
  }

  return parsed;
}

function buildJsonParseError(
  displayPath: string,
  content: string,
  err: unknown,
): string {
  const rawMessage =
    err instanceof Error ? err.message : String(err);

  // Extract character position from Node's SyntaxError message
  // e.g. "Expected ',' or '}' after property value in JSON at position 247"
  const positionMatch = rawMessage.match(
    /at position (\d+)/,
  );

  let locationInfo = "";

  if (positionMatch) {
    const pos = Number(positionMatch[1]);
    const before = content.slice(0, pos);
    const line = (before.match(/\n/g) ?? []).length + 1;
    const col = pos - before.lastIndexOf("\n");
    locationInfo = `\nLine:   ${line}\nColumn: ${col}`;
  }

  // Strip the "in JSON at position N" suffix for a cleaner message
  const cleanMessage = rawMessage
    .replace(/ in JSON at position \d+/, "")
    .replace(/ \(line \d+.*?\)$/, "");

  return (
    `Invalid JSON syntax in:\n${displayPath}` +
    locationInfo +
    `\nError:  ${cleanMessage}` +
    `\n\nFix the JSON syntax and run again.`
  );
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): void {
  for (const [
    key,
    value,
  ] of Object.entries(source)) {
    const existing =
      target[key];

    if (
      isPlainObject(existing) &&
      isPlainObject(value)
    ) {
      deepMerge(
        existing,
        value,
      );

      continue;
    }

    target[key] = value;
  }
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeDisplayPath(
  path: string,
): string {
  const normalized =
    path.replaceAll("\\", "/");

  if (
    normalized.startsWith("./") ||
    normalized === "."
  ) {
    return normalized;
  }

  return `./${normalized}`;
}
