import {
  normalizeInteger,
  normalizeString,
  normalizeStringArray
} from "../utils/index.js";

export const YAKOV_DRYH_ACTOR_TYPES = {
  character: "character"
} as const;

export type YakovDryhActorType =
  (typeof YAKOV_DRYH_ACTOR_TYPES)[keyof typeof YAKOV_DRYH_ACTOR_TYPES];

export const YAKOV_DRYH_RESPONSE_TYPES = {
  fight: "fight",
  flight: "flight"
} as const;

export type YakovDryhResponseType =
  (typeof YAKOV_DRYH_RESPONSE_TYPES)[keyof typeof YAKOV_DRYH_RESPONSE_TYPES];

export const DRYH_RESPONSE_MAX = 3;
export const DRYH_EXHAUSTION_MAX = 6;
export const DRYH_TEMP_MADNESS_MAX = 6;

export interface YakovDryhResponseSlotData {
  checked: boolean;
  type: YakovDryhResponseType | "";
}

export interface YakovDryhResponsesData {
  slots: YakovDryhResponseSlotData[];
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
  talents: YakovDryhTalentsData;
  scars: string[];
}

export function createDefaultCharacterSystemData(): YakovDryhCharacterSystemData {
  return {
    concept: "",
    discipline: 3,
    exhaustion: 0,
    madnessPermanent: 0,
    responses: createDefaultResponsesData(),
    talents: {
      exhaustion: "",
      madness: ""
    },
    scars: []
  };
}

export function createDefaultResponsesData(): YakovDryhResponsesData {
  return {
    slots: createDefaultResponseSlots(),
    max: DRYH_RESPONSE_MAX
  };
}

export function normalizeResponses(
  value: unknown
): YakovDryhResponsesData {
  const source =
    value && typeof value === "object"
      ? (value as Partial<YakovDryhResponsesData> & {
          fight?: unknown;
          flight?: unknown;
        })
      : {};
  const max = DRYH_RESPONSE_MAX;

  const slots = Array.isArray(source.slots)
    ? normalizeResponseSlots(source.slots, max)
    : createLegacyResponseSlots(source.fight, source.flight, max);

  return { slots, max };
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
    concept: normalizeString(source.concept),
    discipline: normalizeInteger(source.discipline, defaults.discipline, { min: 0 }),
    exhaustion: normalizeInteger(source.exhaustion, defaults.exhaustion, {
      min: 0
    }),
    madnessPermanent: normalizeInteger(
      source.madnessPermanent,
      defaults.madnessPermanent,
      { min: 0 }
    ),
    responses: normalizeResponses(source.responses),
    talents: {
      exhaustion: normalizeString(source.talents?.exhaustion),
      madness: normalizeString(source.talents?.madness)
    },
    scars: normalizeStringArray(source.scars)
  };
}

export function getUncheckedResponseTypes(
  responses: YakovDryhResponsesData
): YakovDryhResponseType[] {
  const availableTypes = new Set<YakovDryhResponseType>();

  responses.slots.forEach((slot) => {
    if (slot.type !== "" && !slot.checked) {
      availableTypes.add(slot.type);
    }
  });

  return [
    YAKOV_DRYH_RESPONSE_TYPES.fight,
    YAKOV_DRYH_RESPONSE_TYPES.flight
  ].filter((type) => availableTypes.has(type));
}

export function getCheckedResponseTypes(
  responses: YakovDryhResponsesData
): YakovDryhResponseType[] {
  const availableTypes = new Set<YakovDryhResponseType>();

  responses.slots.forEach((slot) => {
    if (slot.type !== "" && slot.checked) {
      availableTypes.add(slot.type);
    }
  });

  return [
    YAKOV_DRYH_RESPONSE_TYPES.fight,
    YAKOV_DRYH_RESPONSE_TYPES.flight
  ].filter((type) => availableTypes.has(type));
}

export function countConfiguredResponses(
  responses: YakovDryhResponsesData
): number {
  return responses.slots.filter((slot) => slot.type !== "").length;
}

export function countResponsesByType(
  responses: YakovDryhResponsesData,
  responseType: YakovDryhResponseType
): number {
  return responses.slots.filter((slot) => slot.type === responseType).length;
}

export function hasCheckedResponses(
  responses: YakovDryhResponsesData
): boolean {
  return responses.slots.some((slot) => slot.checked);
}

export function addResponseSlot(
  responses: YakovDryhResponsesData,
  responseType: YakovDryhResponseType
): YakovDryhResponsesData | null {
  const slotIndex = responses.slots.findIndex((slot) => slot.type === "");

  if (slotIndex < 0) {
    return null;
  }

  return {
    ...responses,
    slots: responses.slots.map((slot, index) =>
      index === slotIndex
        ? {
            checked: false,
            type: responseType
          }
        : slot
    )
  };
}

export function clearResponseChecks(
  responses: YakovDryhResponsesData
): YakovDryhResponsesData {
  return {
    ...responses,
    slots: responses.slots.map((slot) => ({
      ...slot,
      checked: false
    }))
  };
}

export function checkFirstUncheckedResponse(
  responses: YakovDryhResponsesData,
  responseType: YakovDryhResponseType
): YakovDryhResponsesData | null {
  const slotIndex = responses.slots.findIndex(
    (slot) => slot.type === responseType && !slot.checked
  );

  if (slotIndex < 0) {
    return null;
  }

  return {
    ...responses,
    slots: responses.slots.map((slot, index) =>
      index === slotIndex
        ? {
            ...slot,
            checked: true
          }
        : slot
    )
  };
}

export function uncheckFirstCheckedResponse(
  responses: YakovDryhResponsesData,
  responseType: YakovDryhResponseType
): YakovDryhResponsesData | null {
  const slotIndex = responses.slots.findIndex(
    (slot) => slot.type === responseType && slot.checked
  );

  if (slotIndex < 0) {
    return null;
  }

  return {
    ...responses,
    slots: responses.slots.map((slot, index) =>
      index === slotIndex
        ? {
            ...slot,
            checked: false
          }
        : slot
    )
  };
}

function createDefaultResponseSlots(): YakovDryhResponseSlotData[] {
  return Array.from({ length: DRYH_RESPONSE_MAX }, () => ({
    checked: false,
    type: ""
  }));
}

function createLegacyResponseSlots(
  fightValue: unknown,
  flightValue: unknown,
  max: number
): YakovDryhResponseSlotData[] {
  const flight = normalizeInteger(flightValue, 0, { min: 0, max });
  const fight = normalizeInteger(fightValue, 0, {
    min: 0,
    max: Math.max(max - flight, 0)
  });
  const slots: YakovDryhResponseSlotData[] = [];

  for (let index = 0; index < fight; index += 1) {
    slots.push({
      checked: true,
      type: YAKOV_DRYH_RESPONSE_TYPES.fight
    });
  }

  for (let index = 0; index < flight; index += 1) {
    slots.push({
      checked: true,
      type: YAKOV_DRYH_RESPONSE_TYPES.flight
    });
  }

  while (slots.length < max) {
    slots.push({
      checked: false,
      type: ""
    });
  }

  return slots.slice(0, max);
}

function normalizeResponseSlots(
  value: unknown[],
  max: number
): YakovDryhResponseSlotData[] {
  return Array.from({ length: max }, (_entry, index) =>
    normalizeResponseSlot(value[index])
  );
}

function normalizeResponseSlot(value: unknown): YakovDryhResponseSlotData {
  const source =
    value && typeof value === "object"
      ? (value as Partial<YakovDryhResponseSlotData>)
      : {};
  const type = normalizeResponseType(source.type);

  return {
    checked: type === "" ? false : source.checked === true,
    type
  };
}

function normalizeResponseType(value: unknown): YakovDryhResponseType | "" {
  return value === YAKOV_DRYH_RESPONSE_TYPES.fight ||
    value === YAKOV_DRYH_RESPONSE_TYPES.flight
    ? value
    : "";
}
