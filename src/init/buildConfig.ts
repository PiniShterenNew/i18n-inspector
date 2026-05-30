import type {
  LocaleRootCandidate,
  StructureType,
} from "./detectLocaleRoots.js";

export interface I18nCheckConfig {
  structure: StructureType;
  localesPath: string;
  sourceLocale: string;
  targetLocales: string[];
  ignore?: string[];
}

const DEFAULT_IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
];

export function buildConfig(
  candidate: LocaleRootCandidate,
): I18nCheckConfig {
  const sourceLocale =
    detectSourceLocale(candidate);

  return {
    structure: candidate.structure,
    localesPath: normalizePath(
      candidate.path,
    ),
    sourceLocale,
    targetLocales: candidate.locales.filter(
      (locale) => locale !== sourceLocale,
    ),
    ignore: DEFAULT_IGNORE_PATTERNS,
  };
}

function detectSourceLocale(
  candidate: LocaleRootCandidate,
): string {
  if (candidate.locales.includes("en")) {
    return "en";
  }

  throw new Error(
    "Could not determine source locale.",
  );
}

function normalizePath(
  path: string,
): string {
  const normalized =
    path.replaceAll("\\", "/");

  if (
    normalized === "." ||
    normalized === ""
  ) {
    return ".";
  }

  if (normalized.startsWith("./")) {
    return normalized;
  }

  return `./${normalized}`;
}
