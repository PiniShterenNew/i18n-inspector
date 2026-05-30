import { flattenObject } from "./flattenObject.js";
import { comparePlaceholders } from "./placeholders.js";
import type { CompareLocalesResult, TranslationIssue } from "../types/index.js"

export function compareLocales(
    source: Record<string, unknown>,
    target: Record<string, unknown>
): CompareLocalesResult {

    const flatSource = flattenObject(source);
    const flatTarget = flattenObject(target);

    const sourceKeys = new Set(Object.keys(flatSource));
    const targetKeys = new Set(Object.keys(flatTarget));

    const missing: TranslationIssue[] = [];
    const extra: TranslationIssue[] = [];
    const empty: TranslationIssue[] = [];
    const placeholderMismatch = [];

    for (const key of sourceKeys) {
        if (!targetKeys.has(key)) {
            missing.push({
                key,
                sourceValue: flatSource[key]!
            });

            continue;
        }

        const sourceValue = flatSource[key]!;
        const targetValue = flatTarget[key]!;

        if (targetValue === "") {
            empty.push({
                key,
                sourceValue,
                targetValue: targetValue
            });

            continue;
        }

        const mismatch = comparePlaceholders(
            key,
            sourceValue,
            targetValue
        );

        if (mismatch) {
            placeholderMismatch.push(mismatch);
        }
    }

    for (const key of targetKeys) {
        if (!sourceKeys.has(key)) {
            extra.push({
                key,
                targetValue: flatTarget[key]!
            })
        }
    }

    const totalKeys = sourceKeys.size;

    const translatedKeys =
        totalKeys -
        missing.length -
        empty.length;

    const coverage =
        totalKeys === 0
            ? 100
            : Number(
                (
                    translatedKeys /
                    totalKeys *
                    100
                ).toFixed(2)
            );

    return {
        missing,
        extra,
        empty,
        placeholderMismatch,
        totalKeys,
        coverage
    };
}
