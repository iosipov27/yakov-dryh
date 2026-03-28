import { DRYH_RESPONSE_MAX, YAKOV_DRYH_RESPONSE_TYPES, countConfiguredResponses, countResponsesByType } from "../../data/index.js";
import { localize } from "./character-sheet-localization.js";
const RESPONSE_TYPE_ORDER = [
    YAKOV_DRYH_RESPONSE_TYPES.fight,
    YAKOV_DRYH_RESPONSE_TYPES.flight
];
export function createResponseEditorData(editSlots, liveResponses) {
    return editSlots === null
        ? liveResponses
        : {
            max: DRYH_RESPONSE_MAX,
            slots: editSlots
        };
}
export function createResponseAllocationRows(responses, labels) {
    const configuredCount = countConfiguredResponses(responses);
    return RESPONSE_TYPE_ORDER
        .map((type) => {
        const count = countResponsesByType(responses, type);
        if (configuredCount === DRYH_RESPONSE_MAX && count === 0) {
            return null;
        }
        const label = type === YAKOV_DRYH_RESPONSE_TYPES.fight ? labels.fightLabel : labels.flightLabel;
        return {
            addLabel: `${localize("YAKOV_DRYH.SHEETS.Actor.Character.Actions.AddResponse", "Add Response")} (${label})`,
            checkboxes: Array.from({ length: count }, (_entry, index) => ({
                label: `${label} ${index + 1}`
            })),
            label,
            type
        };
    })
        .filter((row) => row !== null);
}
export function createResponsePlayRows(responses, labels) {
    return RESPONSE_TYPE_ORDER
        .map((type) => {
        const label = type === YAKOV_DRYH_RESPONSE_TYPES.fight ? labels.fightLabel : labels.flightLabel;
        const checkboxes = responses.slots
            .map((slot, index) => ({ index, slot }))
            .filter(({ slot }) => slot.type === type)
            .map(({ index, slot }, slotIndex) => ({
            checked: slot.checked,
            index,
            label: `${labels.responsesLabel} ${label} ${slotIndex + 1}`
        }));
        return checkboxes.length > 0
            ? {
                checkboxes,
                label,
                type
            }
            : null;
    })
        .filter((row) => row !== null);
}
export function normalizeResponseType(value) {
    return value === YAKOV_DRYH_RESPONSE_TYPES.fight ||
        value === YAKOV_DRYH_RESPONSE_TYPES.flight
        ? value
        : "";
}
//# sourceMappingURL=character-sheet-response-helpers.js.map