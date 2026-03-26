export function createDefaultShadowCastingData() {
    return {
        deferredHope: 0,
        madePainDominant: false
    };
}
export function didShadowCastingMakePainDominant(previousResult, nextResult) {
    return previousResult.dominant !== "pain" && nextResult.dominant === "pain";
}
export function updateShadowCastingData(current, previousResult, nextResult) {
    return {
        deferredHope: current.deferredHope + 1,
        madePainDominant: current.madePainDominant ||
            didShadowCastingMakePainDominant(previousResult, nextResult)
    };
}
export function shouldAwardPainDominantDespair(shadowCasting) {
    return !shadowCasting.madePainDominant;
}
export function createPainDominantEffectText(options) {
    if (options.shadowCastingMadePainDominant) {
        return options.noDespairFromShadowCastingText;
    }
    return `${options.gainsDespairText} ${options.despairTotalText} ${options.nextDespairTotal}`;
}
//# sourceMappingURL=shadow-casting.js.map