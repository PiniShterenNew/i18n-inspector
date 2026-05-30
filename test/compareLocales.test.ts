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
