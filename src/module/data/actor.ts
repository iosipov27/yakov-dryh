export const YAKOV_DRYH_ACTOR_TYPES = {
  character: "character"
} as const;

export type YakovDryhActorType =
  (typeof YAKOV_DRYH_ACTOR_TYPES)[keyof typeof YAKOV_DRYH_ACTOR_TYPES];

export const DRYH_RESPONSE_MAX = 3;
export const DRYH_EXHAUSTION_MAX = 6;
export const DRYH_TEMP_MADNESS_MAX = 6;

export interface YakovDryhResponsesData {
  fight: number;
  flight: number;
  max: number;
}

export interface YakovDryhTalentsData {
  exhaustion: string;
  madness: string;
}

export interface YakovDryhCharacterSystemData extends Record<string, unknown> {
  concept: string;
  discipline: number;
  exhaustion: number;
  madnessPermanent: number;
  responses: YakovDryhResponsesData;
  hope: number;
  talents: YakovDryhTalentsData;
  scars: string[];
}

export function createDefaultCharacterSystemData(): YakovDryhCharacterSystemData {
  return {
    concept: "",
    discipline: 3,
    exhaustion: 0,
    madnessPermanent: 0,
    responses: {
      fight: 0,
      flight: 0,
      max: DRYH_RESPONSE_MAX
    },
    hope: 0,
    talents: {
      exhaustion: "",
      madness: ""
    },
    scars: []
  };
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  {
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY
  }: {
    max?: number;
    min?: number;
  } = {}
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

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeScars(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function normalizeResponses(
  value: unknown,
  changedField?: "fight" | "flight"
): YakovDryhResponsesData {
  const defaults = createDefaultCharacterSystemData().responses;
  const source =
    value && typeof value === "object"
      ? (value as Partial<YakovDryhResponsesData>)
      : {};
  const max = DRYH_RESPONSE_MAX;
  let fight = normalizeNumber(source.fight, defaults.fight, { min: 0, max });
  let flight = normalizeNumber(source.flight, defaults.flight, { min: 0, max });

  if (fight + flight > max) {
    if (changedField === "fight") {
      flight = Math.max(max - fight, 0);
    } else {
      fight = Math.max(max - flight, 0);
    }
  }

  return { fight, flight, max };
}

export function normalizeCharacterSystemData(
  value: unknown
): YakovDryhCharacterSystemData {
  const defaults = createDefaultCharacterSystemData();
  const source =
    value && typeof value === "object"
      ? (value as Partial<YakovDryhCharacterSystemData>)
      : {};

  return {
    concept: normalizeText(source.concept),
    discipline: normalizeNumber(source.discipline, defaults.discipline, { min: 0 }),
    exhaustion: normalizeNumber(source.exhaustion, defaults.exhaustion, {
      min: 0,
      max: DRYH_EXHAUSTION_MAX
    }),
    madnessPermanent: normalizeNumber(
      source.madnessPermanent,
      defaults.madnessPermanent,
      { min: 0 }
    ),
    responses: normalizeResponses(source.responses),
    hope: normalizeNumber(source.hope, defaults.hope, { min: 0 }),
    talents: {
      exhaustion: normalizeText(source.talents?.exhaustion),
      madness: normalizeText(source.talents?.madness)
    },
    scars: normalizeScars(source.scars)
  };
}

export function parseScarsText(value: string): string[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function formatScarsText(scars: string[]): string {
  return scars.join("\n");
}
