import { compareLocales } from "../core/compareLocales.js";
import type { I18nCheckConfig } from "../init/buildConfig.js";
import type { LocaleMap } from "./loadLocales.js";

export interface LocaleCheckResult {
  locale: string;
  missing: number;
  missingKeys: string[];
  extra: number;
  extraKeys: string[];
  empty: number;
  emptyKeys: string[];
  placeholderMismatch: number;
  placeholderMismatchKeys: string[];
  coverage: number;
}

export async function runCheck(
  config: I18nCheckConfig,
  locales: LocaleMap,
): Promise<LocaleCheckResult[]> {
  const source =
    locales[config.sourceLocale];

  if (!source) {
    throw new Error(
      `Source locale "${config.sourceLocale}" was not loaded.`,
    );
  }

  return config.targetLocales.map(
    (locale) => {
      const target = locales[locale];

      if (!target) {
        throw new Error(
          `Locale "${locale}" was not loaded.`,
        );
      }

      const result = compareLocales(
        source,
        target,
      );

      return {
        locale,
        missing: result.missing.length,
        missingKeys: result.missing.map(
          (issue) => issue.key,
        ),
        extra: result.extra.length,
        extraKeys: result.extra.map(
          (issue) => issue.key,
        ),
        empty: result.empty.length,
        emptyKeys: result.empty.map(
          (issue) => issue.key,
        ),
        placeholderMismatch:
          result.placeholderMismatch.length,
        placeholderMismatchKeys:
          result.placeholderMismatch.map(
            (issue) => issue.key,
          ),
        coverage: result.coverage,
      };
    },
  );
}
