import { readdir } from "node:fs/promises";
import { relative, join } from "node:path";
import type { Dirent } from "node:fs";

type DirectoryEntries = Dirent[];

export type StructureType =
    | "file-per-locale"
    | "locale-directories";

export interface LocaleRootCandidate {
    path: string;
    structure: StructureType;
    locales: string[];
}

const DEFAULT_IGNORES = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
]);

const LOCALE_REGEX = /^[a-z]{2}(?:-[A-Z]{2})?$/;

const DEFAULT_MAX_DEPTH = 6;

export async function detectLocaleRoots(
    rootDir: string,
    maxDepth = DEFAULT_MAX_DEPTH,
): Promise<LocaleRootCandidate[]> {
    const candidates: LocaleRootCandidate[] = [];

    await scanDirectory(
        rootDir,
        rootDir,
        0,
        maxDepth,
        candidates,
    );

    return candidates.sort((a, b) =>
        a.path.localeCompare(b.path),
    );
}

async function scanDirectory(
    rootDir: string,
    currentDir: string,
    depth: number,
    maxDepth: number,
    candidates: LocaleRootCandidate[],
): Promise<void> {
    if (depth > maxDepth) {
        return;
    }

    let entries;

    try {
        entries = await readdir(currentDir, {
            withFileTypes: true,
        });
    } catch {
        return;
    }

    const candidate = await detectCandidate(
        rootDir,
        currentDir,
        entries,
    );

    if (candidate) {
        candidates.push(candidate);
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }

        if (DEFAULT_IGNORES.has(entry.name)) {
            continue;
        }

        await scanDirectory(
            rootDir,
            join(currentDir, entry.name),
            depth + 1,
            maxDepth,
            candidates,
        );
    }
}

async function detectCandidate(
    rootDir: string,
    directory: string,
    entries: DirectoryEntries,
): Promise<LocaleRootCandidate | null> {
    const filePerLocale = detectFilePerLocale(
        rootDir,
        directory,
        entries,
    );

    if (filePerLocale) {
        return filePerLocale;
    }

    const localeDirectories =
        await detectLocaleDirectories(
            rootDir,
            directory,
            entries,
        );

    if (localeDirectories) {
        return localeDirectories;
    }

    return null;
}

function detectFilePerLocale(
    rootDir: string,
    directory: string,
    entries: DirectoryEntries,
): LocaleRootCandidate | null {
    const locales = entries
        .filter(
            (entry) =>
                entry.isFile() &&
                entry.name.endsWith(".json"),
        )
        .map((entry) => entry.name.replace(/\.json$/, ""))
        .filter((locale) =>
            LOCALE_REGEX.test(locale),
        );

    const uniqueLocales = [...new Set(locales)];

    if (uniqueLocales.length < 2) {
        return null;
    }

    return {
        path: normalizePath(
            relative(rootDir, directory),
        ),
        structure: "file-per-locale",
        locales: uniqueLocales.sort(),
    };
}

async function detectLocaleDirectories(
    rootDir: string,
    directory: string,
    entries: DirectoryEntries,
): Promise<LocaleRootCandidate | null> {
    const localeDirs = entries.filter(
        (entry) =>
            entry.isDirectory() &&
            LOCALE_REGEX.test(entry.name),
    );

    if (localeDirs.length < 2) {
        return null;
    }

    const locales: string[] = [];

    for (const localeDir of localeDirs) {
        try {
            const nestedEntries = await readdir(
                join(directory, localeDir.name),
                {
                    withFileTypes: true,
                },
            );

            const hasJsonFile = nestedEntries.some(
                (entry) =>
                    entry.isFile() &&
                    entry.name.endsWith(".json"),
            );

            if (hasJsonFile) {
                locales.push(localeDir.name);
            }
        } catch {
            // ignore unreadable directories
        }
    }

    const uniqueLocales = [...new Set(locales)];

    if (uniqueLocales.length < 2) {
        return null;
    }

    return {
        path: normalizePath(
            relative(rootDir, directory),
        ),
        structure: "locale-directories",
        locales: uniqueLocales.sort(),
    };
}

function normalizePath(path: string): string {
    if (!path) {
        return ".";
    }

    return path.replaceAll("\\", "/");
}