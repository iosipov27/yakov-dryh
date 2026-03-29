export function isLatestChatMessage(message, messages = game.messages?.contents ?? []) {
    const messageId = message?.id ?? null;
    if (!messageId) {
        return false;
    }
    return (messages.at(-1)?.id ?? null) === messageId;
}
export function shouldHideDryhRollAction(action, options) {
    const isGmAction = action === "roll-pain" ||
        action === "finalize" ||
        action === "add6" ||
        action === "remove6" ||
        action === "resolve-failure" ||
        action === "resolve-crash";
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
export function shouldShowPainRollWaitingMessage(action, options) {
    return action === "roll-pain" && !options.isGm;
}
//# sourceMappingURL=roll-card-visibility.js.map