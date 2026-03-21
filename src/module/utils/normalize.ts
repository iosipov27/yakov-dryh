export interface NormalizeIntegerOptions {
  max?: number;
  min?: number;
}

export function normalizeInteger(
  value: unknown,
  fallback: number,
  {
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY
  }: NormalizeIntegerOptions = {}
): number {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(numericValue), min), max);
}

export function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function parseLineList(value: string): string[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function formatLineList(value: string[]): string {
  return value.join("\n");
}
