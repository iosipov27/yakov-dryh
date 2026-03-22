import { normalizeInteger, normalizeString, normalizeStringArray } from "../utils/index.js";
export const YAKOV_DRYH_ACTOR_TYPES = {
    character: "character"
};
export const YAKOV_DRYH_RESPONSE_TYPES = {
    fight: "fight",
    flight: "flight"
};
export const DRYH_RESPONSE_MAX = 3;
export const DRYH_EXHAUSTION_MAX = 6;
export const DRYH_TEMP_MADNESS_MAX = 6;
export function createDefaultCharacterSystemData() {
    return {
        concept: "",
        discipline: 3,
        exhaustion: 0,
        madnessPermanent: 0,
        responses: {
            slots: createDefaultResponseSlots(),
            max: DRYH_RESPONSE_MAX
        },
        talents: {
            exhaustion: "",
            madness: ""
        },
        scars: []
    };
}
export function normalizeResponses(value) {
    const source = value && typeof value === "object"
        ? value
        : {};
    const max = DRYH_RESPONSE_MAX;
    const slots = Array.isArray(source.slots)
        ? normalizeResponseSlots(source.slots, max)
        : createLegacyResponseSlots(source.fight, source.flight, max);
    return { slots, max };
}
export function normalizeCharacterSystemData(value) {
    const defaults = createDefaultCharacterSystemData();
    const source = value && typeof value === "object"
        ? value
        : {};
    return {
        concept: normalizeString(source.concept),
        discipline: normalizeInteger(source.discipline, defaults.discipline, { min: 0 }),
        exhaustion: normalizeInteger(source.exhaustion, defaults.exhaustion, {
            min: 0,
            max: DRYH_EXHAUSTION_MAX
        }),
        madnessPermanent: normalizeInteger(source.madnessPermanent, defaults.madnessPermanent, { min: 0 }),
        responses: normalizeResponses(source.responses),
        talents: {
            exhaustion: normalizeString(source.talents?.exhaustion),
            madness: normalizeString(source.talents?.madness)
        },
        scars: normalizeStringArray(source.scars)
    };
}
function createDefaultResponseSlots() {
    return Array.from({ length: DRYH_RESPONSE_MAX }, () => ({
        checked: false,
        type: ""
    }));
}
function createLegacyResponseSlots(fightValue, flightValue, max) {
    const flight = normalizeInteger(flightValue, 0, { min: 0, max });
    const fight = normalizeInteger(fightValue, 0, {
        min: 0,
        max: Math.max(max - flight, 0)
    });
    const slots = [];
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
function normalizeResponseSlots(value, max) {
    return Array.from({ length: max }, (_entry, index) => normalizeResponseSlot(value[index]));
}
function normalizeResponseSlot(value) {
    const source = value && typeof value === "object"
        ? value
        : {};
    const type = normalizeResponseType(source.type);
    return {
        checked: type === "" ? false : source.checked === true,
        type
    };
}
function normalizeResponseType(value) {
    return value === YAKOV_DRYH_RESPONSE_TYPES.fight ||
        value === YAKOV_DRYH_RESPONSE_TYPES.flight
        ? value
        : "";
}
//# sourceMappingURL=actor.js.map