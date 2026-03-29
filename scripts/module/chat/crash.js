import { clearResponseChecks, DRYH_EXHAUSTION_MAX } from "../data/index.js";
export function shouldAutoApplyCrash(exhaustion) {
    return exhaustion > DRYH_EXHAUSTION_MAX;
}
export function shouldOfferCrashResolution(options) {
    return (!options.crashResolved &&
        shouldAutoApplyCrash(options.exhaustion) &&
        !options.hasPendingDominantResolution &&
        !options.hasPendingFailureResolution);
}
export function applyCrashSleepToCharacterData(actorData) {
    return {
        ...actorData,
        discipline: 1,
        exhaustion: 0,
        responses: clearResponseChecks(actorData.responses)
    };
}
//# sourceMappingURL=crash.js.map