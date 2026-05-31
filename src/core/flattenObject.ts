export function flattenObject(
    obj: Record<string, unknown>
): Record<string, string> {
    const result: Record<string, string> = {};

    walk(obj, "", result);

    return result;
}

function walk(
    obj: Record<string, unknown>,
    path: string,
    result: Record<string, string>
): void {
    for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (isPlainObject(value)) {
            walk(value, fullPath, result);
        }
        if (typeof value === "string") {
            result[fullPath] = value;
        }
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function collectArrayKeys(obj: Record<string, unknown>): string[] {
    const result: string[] = [];
    walkArrays(obj, "", result);
    return result.sort();
}

function walkArrays(
    obj: Record<string, unknown>,
    path: string,
    result: string[],
): void {
    for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (Array.isArray(value)) {
            result.push(fullPath);
        } else if (isPlainObject(value)) {
            walkArrays(value, fullPath, result);
        }
    }
}