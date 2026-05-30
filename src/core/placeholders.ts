export interface PlaceholderMismatch {
  key: string;
  sourcePlaceholders: string[];
  targetPlaceholders: string[];
}

const PLACEHOLDER_PATTERN =
  /\{\{\s*([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\s*\}\}/g;

export function extractPlaceholders(
  value: string,
): string[] {
  const placeholders = new Set<string>();

  for (const match of value.matchAll(
    PLACEHOLDER_PATTERN,
  )) {
    placeholders.add(match[1]!);
  }

  return [
    ...placeholders,
  ].sort();
}

export function comparePlaceholders(
  key: string,
  sourceValue: string,
  targetValue: string,
): PlaceholderMismatch | undefined {
  const sourcePlaceholders =
    extractPlaceholders(sourceValue);

  const targetPlaceholders =
    extractPlaceholders(targetValue);

  if (
    areEqual(
      sourcePlaceholders,
      targetPlaceholders,
    )
  ) {
    return undefined;
  }

  return {
    key,
    sourcePlaceholders,
    targetPlaceholders,
  };
}

function areEqual(
  left: string[],
  right: string[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (value, index) =>
        value === right[index],
    )
  );
}
