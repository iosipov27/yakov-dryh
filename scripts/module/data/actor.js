import { normalizeInteger, normalizeString, normalizeStringArray } from "../utils/index.js";
export const YAKOV_DRYH_ACTOR_TYPES = {
    character: "character"
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
export function normalizeResponses(value, changedField) {
    const defaults = createDefaultCharacterSystemData().responses;
    const source = value && typeof value === "object" ? value : {};
    const max = DRYH_RESPONSE_MAX;
    let fight = normalizeInteger(source.fight, defaults.fight, { min: 0, max });
    let flight = normalizeInteger(source.flight, defaults.flight, { min: 0, max });
    if (fight + flight > max) {
        if (changedField === "fight") {
            flight = Math.max(max - fight, 0);
        }
        else {
            fight = Math.max(max - flight, 0);
        }
    }
    return { fight, flight, max };
}
export function normalizeCharacterSystemData(value) {
    const defaults = createDefaultCharacterSystemData();
    const source = value && typeof value === "object" ? value : {};
    return {
        concept: normalizeString(source.concept),
        discipline: normalizeInteger(source.discipline, defaults.discipline, { min: 0 }),
        exhaustion: normalizeInteger(source.exhaustion, defaults.exhaustion, {
            min: 0,
            max: DRYH_EXHAUSTION_MAX
        }),
        madnessPermanent: normalizeInteger(source.madnessPermanent, defaults.madnessPermanent, { min: 0 }),
        responses: normalizeResponses(source.responses),
        hope: normalizeInteger(source.hope, defaults.hope, { min: 0 }),
        talents: {
            exhaustion: normalizeString(source.talents?.exhaustion),
            madness: normalizeString(source.talents?.madness)
        },
        scars: normalizeStringArray(source.scars)
    };
}
//# sourceMappingURL=actor.js.map
