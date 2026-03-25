export function shouldHideDryhRollAction(action, options) {
    const isGmAction = action === "roll-pain" ||
        action === "finalize" ||
        action === "add6" ||
        action === "remove6" ||
        action === "resolve-failure";
    const isPlayerAction = action === "spend-hope" || action === "take-post-roll-exhaustion";
    const isActorOwnerResolutionAction = action === "resolve-dominant";
    if (isGmAction && !options.isGm) {
        return true;
    }
    if ((isPlayerAction || isActorOwnerResolutionAction) && !options.isActorOwner) {
        return true;
    }
    return false;
}
//# sourceMappingURL=roll-card-visibility.js.map