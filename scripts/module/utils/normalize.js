export function normalizeInteger(value, fallback, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
    const numericValue = typeof value === "number"
        ? value
        : typeof value === "string"
            ? Number.parseInt(value, 10)
            : Number.NaN;
    if (!Number.isFinite(numericValue)) {
        return fallback;
    }
    return Math.min(Math.max(Math.trunc(numericValue), min), max);
}
export function normalizeString(value) {
    return typeof value === "string" ? value : "";
}
export function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .filter((entry) => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}
export function parseLineList(value) {
    return value
        .split("\n")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}
export function formatLineList(value) {
    return value.join("\n");
}
//# sourceMappingURL=normalize.js.map
