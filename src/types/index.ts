import type { PlaceholderMismatch } from "../core/placeholders.js";

export interface TranslationIssue {
    key: string;
    sourceValue?: string;
    targetValue?: string;
}

export interface CompareLocalesResult {
    missing: TranslationIssue[];
    extra: TranslationIssue[];
    empty: TranslationIssue[];
    placeholderMismatch: PlaceholderMismatch[];

    totalKeys: number;
    coverage: number;
}
