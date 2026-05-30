import { afterEach, describe, expect, it } from "vitest";
import {
    mkdir,
    mkdtemp,
    rm,
    writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { detectLocaleRoots } from "../src/init/detectLocaleRoots.js";

const tempDirs: string[] = [];

async function createTempProject() {
    const dir = await mkdtemp(
        join(tmpdir(), "i18n-check-"),
    );

    tempDirs.push(dir);

    return dir;
}

afterEach(async () => {
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

describe("detectLocaleRoots", () => {
    it("detects file-per-locale structure", async () => {
        const root = await createTempProject();

        const messagesDir = join(root, "messages");

        await mkdir(messagesDir);

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "he.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([
            {
                path: "messages",
                structure: "file-per-locale",
                locales: ["en", "he"],
            },
        ]);
    });

    it("detects locale-directories structure", async () => {
        const root = await createTempProject();

        const localesDir = join(root, "locales");

        await mkdir(join(localesDir, "en"), {
            recursive: true,
        });

        await mkdir(join(localesDir, "he"), {
            recursive: true,
        });

        await writeFile(
            join(localesDir, "en", "common.json"),
            "{}",
        );

        await writeFile(
            join(localesDir, "he", "common.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([
            {
                path: "locales",
                structure: "locale-directories",
                locales: ["en", "he"],
            },
        ]);
    });

    it("ignores invalid locale names", async () => {
        const root = await createTempProject();

        const messagesDir = join(root, "messages");

        await mkdir(messagesDir);

        await writeFile(
            join(messagesDir, "english.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "hebrew.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([]);
    });

    it("ignores directories with only one locale", async () => {
        const root = await createTempProject();

        const messagesDir = join(root, "messages");

        await mkdir(messagesDir);

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([]);
    });

    it("ignores locale directories without json files", async () => {
        const root = await createTempProject();

        const localesDir = join(root, "locales");

        await mkdir(join(localesDir, "en"), {
            recursive: true,
        });

        await mkdir(join(localesDir, "he"), {
            recursive: true,
        });

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([]);
    });

    it("supports region locales", async () => {
        const root = await createTempProject();

        const messagesDir = join(root, "messages");

        await mkdir(messagesDir);

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "pt-BR.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([
            {
                path: "messages",
                structure: "file-per-locale",
                locales: ["en", "pt-BR"],
            },
        ]);
    });

    it("detects nested locale roots", async () => {
        const root = await createTempProject();

        const messagesDir = join(
            root,
            "apps",
            "web",
            "messages",
        );

        await mkdir(messagesDir, {
            recursive: true,
        });

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "he.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([
            {
                path: "apps/web/messages",
                structure: "file-per-locale",
                locales: ["en", "he"],
            },
        ]);
    });

    it("detects multiple locale roots", async () => {
        const root = await createTempProject();

        const messagesDir = join(
            root,
            "apps",
            "web",
            "messages",
        );

        const localesDir = join(
            root,
            "packages",
            "admin",
            "locales",
        );

        await mkdir(messagesDir, {
            recursive: true,
        });

        await mkdir(
            join(localesDir, "en"),
            {
                recursive: true,
            },
        );

        await mkdir(
            join(localesDir, "he"),
            {
                recursive: true,
            },
        );

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "he.json"),
            "{}",
        );

        await writeFile(
            join(localesDir, "en", "common.json"),
            "{}",
        );

        await writeFile(
            join(localesDir, "he", "common.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([
            {
                path: "apps/web/messages",
                structure: "file-per-locale",
                locales: ["en", "he"],
            },
            {
                path: "packages/admin/locales",
                structure: "locale-directories",
                locales: ["en", "he"],
            },
        ]);
    });

    it("ignores node_modules", async () => {
        const root = await createTempProject();

        const messagesDir = join(
            root,
            "node_modules",
            "messages",
        );

        await mkdir(messagesDir, {
            recursive: true,
        });

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "he.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root);

        expect(result).toEqual([]);
    });

    it("respects maxDepth", async () => {
        const root = await createTempProject();

        const messagesDir = join(
            root,
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "messages",
        );

        await mkdir(messagesDir, {
            recursive: true,
        });

        await writeFile(
            join(messagesDir, "en.json"),
            "{}",
        );

        await writeFile(
            join(messagesDir, "he.json"),
            "{}",
        );

        const result =
            await detectLocaleRoots(root, 3);

        expect(result).toEqual([]);
    });

    it("returns empty array when no locale roots exist", async () => {
        const root = await createTempProject();

        await mkdir(join(root, "src"));
        await mkdir(join(root, "components"));

        const result = await detectLocaleRoots(root);

        expect(result).toEqual([]);
    });
});