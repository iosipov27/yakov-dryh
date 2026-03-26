import { clearResponseChecks, getUncheckedResponseTypes } from "../data/index.js";
export function hasNoUncheckedResponses(responses) {
    return getUncheckedResponseTypes(responses).length === 0;
}
export function shouldAutoApplySnap(trigger) {
    if (!hasNoUncheckedResponses(trigger.responses)) {
        return false;
    }
    return (trigger.dominant === "madness" ||
        trigger.failureConsequence === "mark-response");
}
export function applySnapToCharacterData(actorData) {
    return {
        ...actorData,
        discipline: Math.max(actorData.discipline - 1, 0),
        madnessPermanent: actorData.madnessPermanent + 1,
        responses: clearResponseChecks(actorData.responses)
    };
}
//# sourceMappingURL=snap.js.map