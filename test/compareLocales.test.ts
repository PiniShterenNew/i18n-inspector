import { describe, expect, it } from "vitest";
import { compareLocales } from "../src/core/compareLocales.js";
import {
    comparePlaceholders,
    extractPlaceholders,
} from "../src/core/placeholders.js";

describe("compareLocales", () => {
    it("should detect missing translations", () => {
        const source = {
            home: {
                title: "Home"
            }
        };

        const target = {};

        const result = compareLocales(source, target);

        expect(result.missing).toHaveLength(1);
        expect(result.missing[0]!.key).toBe("home.title");

        expect(result.extra).toHaveLength(0);
        expect(result.empty).toHaveLength(0);
    });

    it("should detect extra translations", () => {
        const source = {
            title: "Home"
        };

        const target = {
            title: "בית",
            oldFeature: "ישן"
        };

        const result = compareLocales(source, target);

        expect(result.extra).toHaveLength(1);
        expect(result.extra[0]!.key).toBe("oldFeature");
    });

    it("should detect empty translations", () => {
        const source = {
            title: "Home"
        };

        const target = {
            title: ""
        };

        const result = compareLocales(source, target);

        expect(result.empty).toHaveLength(1);
        expect(result.empty[0]!.key).toBe("title");
    });

    it("should preserve source value for missing translations", () => {
        const source = {
            title: "Home"
        };

        const target = {};

        const result = compareLocales(source, target);

        expect(
            result.missing[0]!.sourceValue
        ).toBe("Home");
    });

    it("should preserve target value for extra translations", () => {
        const source = {};

        const target = {
            legacy: "Legacy value"
        };

        const result = compareLocales(source, target);

        expect(
            result.extra[0]!.targetValue
        ).toBe("Legacy value");
    });

    it("should detect placeholder mismatches", () => {
        const source = {
            title: "Hello {{name}}"
        };

        const target = {
            title: "Shalom"
        };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(1);
        expect(result.placeholderMismatch[0]!.key).toBe("title");
        expect(
            result.placeholderMismatch[0]!.sourcePlaceholders
        ).toEqual(["name"]);
        expect(
            result.placeholderMismatch[0]!.targetPlaceholders
        ).toEqual([]);
    });

    it("should not report placeholder mismatches when placeholders match", () => {
        const source = {
            title: "Hello {{user.firstName}}"
        };

        const target = {
            title: "Shalom {{user.firstName}}"
        };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(0);
    });
});

describe("placeholders", () => {
    it("should extract placeholders", () => {
        expect(
            extractPlaceholders(
                "Hello {{name}}, you have {{count}} messages for {{user.firstName}}"
            )
        ).toEqual([
            "count",
            "name",
            "user.firstName"
        ]);
    });

    it("should compare placeholders", () => {
        expect(
            comparePlaceholders(
                "title",
                "Hello {{name}}",
                "Shalom"
            )
        ).toEqual({
            key: "title",
            sourcePlaceholders: ["name"],
            targetPlaceholders: []
        });
    });
});

describe("coverage", () => {
    it("should return 100 percent coverage", () => {
        const source = {
            title: "Home",
            subtitle: "Welcome"
        };

        const target = {
            title: "בית",
            subtitle: "ברוך הבא"
        };

        const result = compareLocales(source, target);

        expect(result.coverage).toBe(100);
    });

    it("should calculate partial coverage", () => {
        const source = {
            title: "Home",
            subtitle: "Welcome",
            cta: "Start"
        };

        const target = {
            title: "בית",
            subtitle: ""
        };

        const result = compareLocales(source, target);

        expect(result.missing).toHaveLength(1);
        expect(result.empty).toHaveLength(1);

        expect(result.coverage).toBe(33.33);
    });

    it("should return 100 percent coverage for empty source locale", () => {
        const result = compareLocales({}, {});

        expect(result.coverage).toBe(100);
    });

    it("should return zero coverage when target locale is empty", () => {
        const source = {
            title: "Home"
        };

        const target = {};

        const result = compareLocales(source, target);

        expect(result.coverage).toBe(0);
    });

    it("should not count empty translations as translated", () => {
        const source = {
            title: "Home"
        };

        const target = {
            title: ""
        };

        const result = compareLocales(source, target);

        expect(result.coverage).toBe(0);
    });
});

describe("nested translations", () => {
    it("should detect deeply nested missing keys", () => {
        const source = {
            dashboard: {
                stats: {
                    revenue: "Revenue"
                }
            }
        };

        const target = {};

        const result = compareLocales(source, target);

        expect(
            result.missing[0]!.key
        ).toBe("dashboard.stats.revenue");
    });

    it("should support very deep nesting", () => {
        const source = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                title: "Hello"
                            }
                        }
                    }
                }
            }
        };

        const target = {};

        const result = compareLocales(source, target);

        expect(
            result.missing[0]!.key
        ).toBe("a.b.c.d.e.title");
    });

    it("should detect multiple missing keys", () => {
        const source = {
            title: "Home",
            subtitle: "Welcome",
            cta: "Start"
        };

        const target = {
            title: "בית"
        };

        const result = compareLocales(source, target);

        expect(result.missing).toHaveLength(2);
    });

    it("should detect multiple extra keys", () => {
        const source = {
            title: "Home"
        };

        const target = {
            title: "בית",
            old1: "a",
            old2: "b"
        };

        const result = compareLocales(source, target);

        expect(result.extra).toHaveLength(2);
    });

    it("should not mark translated keys as missing when values differ", () => {
        const source = {
            title: "Home"
        };

        const target = {
            title: "בית"
        };

        const result = compareLocales(source, target);

        expect(result.missing).toHaveLength(0);
        expect(result.empty).toHaveLength(0);
    });
});

describe("whitespace-only empty detection", () => {
    it("should treat whitespace-only value as empty", () => {
        const source = { title: "Home" };
        const target = { title: "   " };

        const result = compareLocales(source, target);

        expect(result.empty).toHaveLength(1);
        expect(result.empty[0]!.key).toBe("title");
    });

    it("should treat tab-only value as empty", () => {
        const source = { title: "Home" };
        const target = { title: "\t" };

        const result = compareLocales(source, target);

        expect(result.empty).toHaveLength(1);
    });

    it("should treat newline-only value as empty", () => {
        const source = { title: "Home" };
        const target = { title: "\n" };

        const result = compareLocales(source, target);

        expect(result.empty).toHaveLength(1);
    });

    it("should not count whitespace-only as translated in coverage", () => {
        const source = { title: "Home" };
        const target = { title: "   " };

        const result = compareLocales(source, target);

        expect(result.coverage).toBe(0);
    });

    it("should not treat value with real content and surrounding whitespace as empty", () => {
        const source = { title: "Home" };
        const target = { title: " בית " };

        const result = compareLocales(source, target);

        expect(result.empty).toHaveLength(0);
        expect(result.missing).toHaveLength(0);
    });
});

describe("array detection warnings", () => {
    it("should detect top-level array in source", () => {
        const source = { steps: ["one", "two"] as unknown as string };
        const target = { steps: ["אחד", "שתיים"] as unknown as string };

        const result = compareLocales(
            source as unknown as Record<string, unknown>,
            target as unknown as Record<string, unknown>,
        );

        expect(result.arrayKeys).toContain("steps");
    });

    it("should detect nested array key", () => {
        const source = {
            onboarding: { steps: ["one", "two"] }
        } as unknown as Record<string, unknown>;
        const target = {} as Record<string, unknown>;

        const result = compareLocales(source, target);

        expect(result.arrayKeys).toContain("onboarding.steps");
    });

    it("should not report array key as missing", () => {
        const source = {
            steps: ["one", "two"],
            title: "Home",
        } as unknown as Record<string, unknown>;
        const target = { title: "בית" } as Record<string, unknown>;

        const result = compareLocales(source, target);

        expect(result.missing.map((i) => i.key)).not.toContain("steps");
        expect(result.arrayKeys).toContain("steps");
    });

    it("should return empty arrayKeys when no arrays present", () => {
        const source = { title: "Home" };
        const target = { title: "בית" };

        const result = compareLocales(source, target);

        expect(result.arrayKeys).toHaveLength(0);
    });

    it("should detect arrays in target that are not in source", () => {
        const source = { title: "Home" } as Record<string, unknown>;
        const target = {
            title: "בית",
            extras: ["a", "b"],
        } as unknown as Record<string, unknown>;

        const result = compareLocales(source, target);

        expect(result.arrayKeys).toContain("extras");
    });
});

describe("placeholder spacing robustness", () => {
    it("should treat {{name}} and {{ name }} as the same placeholder", () => {
        const source = { title: "Hello {{name}}" };
        const target = { title: "שלום {{ name }}" };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(0);
    });

    it("should treat {{ user.name }} with spaces as valid", () => {
        const source = { title: "Hello {{ user.name }}" };
        const target = { title: "שלום {{ user.name }}" };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(0);
    });

    it("should detect mismatch between {{name}} and {{userName}}", () => {
        const source = { title: "Hello {{name}}" };
        const target = { title: "שלום {{userName}}" };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(1);
        expect(result.placeholderMismatch[0]!.sourcePlaceholders).toEqual(["name"]);
        expect(result.placeholderMismatch[0]!.targetPlaceholders).toEqual(["userName"]);
    });

    it("should handle multiple placeholders with mixed spacing", () => {
        const source = { title: "{{firstName}} {{lastName}}" };
        const target = { title: "{{ firstName }} {{ lastName }}" };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(0);
    });

    it("should deduplicate repeated placeholders", () => {
        const source = { title: "{{name}} and {{name}} again" };
        const target = { title: "{{name}} ו-{{name}} שוב" };

        const result = compareLocales(source, target);

        expect(result.placeholderMismatch).toHaveLength(0);
    });
});

describe("real world locale audit", () => {
    it("should audit a realistic locale file", () => {
        const source = {
            common: {
                save: "Save",
                cancel: "Cancel",
                delete: "Delete"
            },
            dashboard: {
                title: "Dashboard",
                revenue: "Revenue",
                expenses: "Expenses"
            }
        };

        const target = {
            common: {
                save: "שמור",
                cancel: "",
                delete: "מחק"
            },
            dashboard: {
                title: "לוח בקרה"
            },
            legacyFeature: {
                title: "ישן"
            }
        };

        const result = compareLocales(source, target);

        expect(result.missing).toHaveLength(2);
        expect(result.empty).toHaveLength(1);
        expect(result.extra).toHaveLength(1);

        expect(result.totalKeys).toBe(6);
    });
});
