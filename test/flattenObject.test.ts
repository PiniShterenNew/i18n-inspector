import { describe, expect, it } from "vitest";
import { flattenObject, collectArrayKeys } from "../src/core/flattenObject.js";

describe("flattenObject", () => {
    it("should return empty object for empty input", () => {
        const result = flattenObject({});

        expect(result).toEqual({});
    });
    it("should flatten a single level object", () => {
        const result = flattenObject({
            title: "Home"
        });

        expect(result).toEqual({
            title: "Home"
        });
    });
    it("should flatten nested objects", () => {
        const result = flattenObject({
            home: {
                title: "Home"
            }
        });

        expect(result).toEqual({
            "home.title": "Home"
        });
    });
    it("should flatten deeply nested objects", () => {
        const result = flattenObject({
            a: {
                b: {
                    c: {
                        d: "hello"
                    }
                }
            }
        });

        expect(result).toEqual({
            "a.b.c.d": "hello"
        });
    });
    it("should flatten multiple branches", () => {
        const result = flattenObject({
            home: {
                title: "Home"
            },
            settings: {
                profile: {
                    name: "Name"
                }
            }
        });

        expect(result).toEqual({
            "home.title": "Home",
            "settings.profile.name": "Name"
        });
    });
    it("should preserve empty strings", () => {
        const result = flattenObject({
            title: ""
        });

        expect(result).toEqual({
            title: ""
        });
    });
    it("should preserve empty strings", () => {
        const result = flattenObject({
            title: ""
        });

        expect(result).toEqual({
            title: ""
        });
    });
    it("should ignore arrays", () => {
        const result = flattenObject({
            items: ["a", "b"]
        });

        expect(result).toEqual({});
    });
    it("should ignore numeric values", () => {
        const result = flattenObject({
            count: 42
        });

        expect(result).toEqual({});
    });
    it("should ignore boolean values", () => {
        const result = flattenObject({
            enabled: true
        });

        expect(result).toEqual({});
    });
    it("should keep valid strings and ignore invalid values", () => {
        const result = flattenObject({
            title: "Home",
            count: 42,
            enabled: true,
            metadata: null
        });

        expect(result).toEqual({
            title: "Home"
        });
    });
    it("should ignore invalid nested values", () => {
        const result = flattenObject({
            dashboard: {
                title: "Dashboard",
                count: 42
            }
        });

        expect(result).toEqual({
            "dashboard.title": "Dashboard"
        });
    });
    it("should flatten valid nested strings and ignore invalid nested values", () => {
        const result = flattenObject({
            dashboard: {
                title: "Dashboard",
                stats: {
                    revenue: "Revenue",
                    count: 100
                }
            }
        });

        expect(result).toEqual({
            "dashboard.title": "Dashboard",
            "dashboard.stats.revenue": "Revenue"
        });
    });
    it("should flatten a realistic translation file", () => {
        const result = flattenObject({
            common: {
                buttons: {
                    save: "Save",
                    cancel: "Cancel"
                }
            },
            dashboard: {
                revenue: "Revenue",
                expenses: "Expenses"
            }
        });

        expect(result).toEqual({
            "common.buttons.save": "Save",
            "common.buttons.cancel": "Cancel",
            "dashboard.revenue": "Revenue",
            "dashboard.expenses": "Expenses"
        });
    });
    it("should preserve empty strings", () => {
        const result = flattenObject({
            title: ""
        });

        expect(result).toEqual({
            title: ""
        });
    });
    it("should flatten a complex locale structure", () => {
        const result = flattenObject({
            common: {
                save: "Save",
                cancel: "Cancel"
            },
            dashboard: {
                title: "Dashboard",
                charts: {
                    revenue: "Revenue",
                    expenses: "Expenses"
                }
            },
            profile: {
                settings: {
                    language: "Language"
                }
            }
        });

        expect(result).toEqual({
            "common.save": "Save",
            "common.cancel": "Cancel",
            "dashboard.title": "Dashboard",
            "dashboard.charts.revenue": "Revenue",
            "dashboard.charts.expenses": "Expenses",
            "profile.settings.language": "Language"
        });
    });
});

describe("collectArrayKeys", () => {
    it("should return empty array when no arrays present", () => {
        expect(collectArrayKeys({ title: "Home" })).toEqual([]);
    });

    it("should detect a top-level array", () => {
        const result = collectArrayKeys({ steps: ["one", "two"] });
        expect(result).toEqual(["steps"]);
    });

    it("should detect a nested array", () => {
        const result = collectArrayKeys({ onboarding: { steps: ["one", "two"] } });
        expect(result).toEqual(["onboarding.steps"]);
    });

    it("should detect multiple arrays", () => {
        const result = collectArrayKeys({
            steps: ["a"],
            wizard: { pages: ["b", "c"] },
        });
        expect(result).toContain("steps");
        expect(result).toContain("wizard.pages");
        expect(result).toHaveLength(2);
    });

    it("should not collect plain objects or strings as arrays", () => {
        const result = collectArrayKeys({
            title: "Home",
            nested: { subtitle: "Sub" },
        });
        expect(result).toHaveLength(0);
    });

    it("should return sorted keys", () => {
        const result = collectArrayKeys({
            z: ["last"],
            a: ["first"],
        });
        expect(result).toEqual(["a", "z"]);
    });
});