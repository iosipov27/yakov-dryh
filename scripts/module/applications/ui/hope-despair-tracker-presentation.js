export function createHopeDespairTrackerContext(input) {
    const { isGm, sharedPools } = input;
    return {
        canEdit: isGm,
        despair: sharedPools.despair,
        hasPendingHope: sharedPools.pendingHope > 0,
        hope: sharedPools.hope,
        pendingHope: sharedPools.pendingHope
    };
}
//# sourceMappingURL=hope-despair-tracker-presentation.js.map