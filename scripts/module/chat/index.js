import { YakovDryhChatInteractionDialog } from "../applications/dialogs/chat-interaction-dialog.js";
import { CHAT_CARD_COMMAND, DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";
import { adjustDryhDiceTrayPool, hasDryhDiceTrayCard, lockDryhDiceTrayPools, rollDryhDiceTray, syncActiveDryhDiceTrayMessage } from "./dice-tray-card-service.js";
import { applyDryhRollPlayerAction, applyDryhRollGmAction, finalizeDryhRoll, getDryhRollCardData, hasDryhRollCard, resolveDryhRollCrashAction, resolveDryhRollDominantAction, resolveDryhRollFailureAction, rerenderDryhRollMessage } from "./roll-card-service.js";
import { advanceChatCardStatus, getChatCardData, hasInteractiveChatCard } from "./chat-card-service.js";
import { shouldHideDryhRollAction } from "./roll-card-visibility.js";
export async function openChatInteraction(message) {
    const liveMessage = (message.id ? game.messages?.get(message.id) : null) ?? message;
    const dialog = new YakovDryhChatInteractionDialog(liveMessage);
    await dialog.render({ force: true });
    return dialog;
}
export function registerChatHooks(api) {
    Hooks.on("chatMessage", (_chatLog, message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage.startsWith(CHAT_CARD_COMMAND)) {
            return;
        }
        const summary = trimmedMessage.slice(CHAT_CARD_COMMAND.length).trim();
        void api.chat.createInteractiveMessage({
            summary: summary || undefined
        });
        return false;
    });
    Hooks.on("renderChatMessageHTML", (message, html) => {
        if (hasDryhDiceTrayCard(message)) {
            activateDryhDiceTrayListeners(html);
        }
        if (hasDryhRollCard(message)) {
            activateDryhRollListeners(message, html);
        }
        if (!hasInteractiveChatCard(message)) {
            return;
        }
        activateChatCardListeners(message, html, api);
    });
    Hooks.on("updateSetting", (setting) => {
        if (setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.diceTrayState}`) {
            void syncActiveDryhDiceTrayMessage();
        }
        if (setting.key !== `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}` &&
            setting.key !== `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}` &&
            setting.key !== `${SYSTEM_ID}.${DRYH_SETTINGS.pendingHope}`) {
            return;
        }
        const latestMessage = (game.messages?.contents ?? []).at(-1);
        if (!latestMessage || !hasDryhRollCard(latestMessage)) {
            return;
        }
        const card = getDryhRollCardData(latestMessage);
        if (card.stage !== "initial" || card.finalized) {
            return;
        }
        void rerenderDryhRollMessage(latestMessage);
    });
}
function activateDryhDiceTrayListeners(html) {
    const actionElements = html.querySelectorAll([
        "[data-yakov-dryh-tray-card-action]",
        "[data-yakov-dryh-tray-card-pool]"
    ].join(", "));
    actionElements.forEach((actionElement) => {
        actionElement.addEventListener("click", (event) => {
            event.preventDefault();
            const trayAction = actionElement.dataset.yakovDryhTrayCardAction;
            if (trayAction === "lock-pools") {
                actionElement.setAttribute("disabled", "disabled");
                void lockDryhDiceTrayPools();
                return;
            }
            if (trayAction === "roll") {
                actionElement.setAttribute("disabled", "disabled");
                void rollDryhDiceTray();
                return;
            }
            const trayPool = actionElement.dataset.yakovDryhTrayCardPool;
            const trayDelta = Number.parseInt(actionElement.dataset.yakovDryhTrayCardDelta ?? "0", 10);
            if (trayPool && Number.isFinite(trayDelta)) {
                actionElement.setAttribute("disabled", "disabled");
                void adjustDryhDiceTrayPool(trayPool, trayDelta);
            }
        });
    });
}
function activateChatCardListeners(message, html, api) {
    const actions = html.querySelectorAll("[data-yakov-dryh-action]");
    actions.forEach((actionElement) => {
        const action = actionElement.getAttribute("data-yakov-dryh-action");
        if (action === "open-dialog") {
            actionElement.addEventListener("click", (event) => {
                event.preventDefault();
                void api.chat.openInteraction(message);
            });
        }
        if (action === "advance-status") {
            actionElement.addEventListener("click", (event) => {
                event.preventDefault();
                void api.chat.advanceStatus(message);
            });
        }
    });
}
function activateDryhRollListeners(message, html) {
    const card = getDryhRollCardData(message);
    const actor = card.actorId
        ? game.actors?.get(card.actorId) ?? null
        : null;
    const canUseActorOwnerActions = actor?.isOwner ?? false;
    const actionElements = html.querySelectorAll("[data-yakov-dryh-roll-action]");
    actionElements.forEach((actionElement) => {
        const action = actionElement.dataset.yakovDryhRollAction;
        const targetPool = actionElement.dataset.targetPool;
        const responseType = actionElement.dataset.responseType;
        if (shouldHideDryhRollAction(action, {
            isActorOwner: canUseActorOwnerActions,
            isGm: game.user?.isGM ?? false
        })) {
            actionElement.hidden = true;
            return;
        }
        if (card.stage === "final") {
            if (action !== "resolve-failure" &&
                action !== "resolve-dominant" &&
                action !== "resolve-crash") {
                actionElement.setAttribute("disabled", "disabled");
                return;
            }
            actionElement.addEventListener("click", (event) => {
                event.preventDefault();
                if (action === "resolve-failure") {
                    html
                        .querySelectorAll("[data-yakov-dryh-roll-action='resolve-failure']")
                        .forEach((element) => element.setAttribute("disabled", "disabled"));
                    void resolveDryhRollFailureAction(message, {
                        responseType: actionElement.dataset.failureAction === "check-response"
                            ? (responseType ?? null)
                            : null,
                        type: actionElement.dataset.failureAction === "check-response"
                            ? "check-response"
                            : actionElement.dataset.failureAction === "snap"
                                ? "snap"
                                : "gain-exhaustion"
                    });
                    return;
                }
                if (action === "resolve-crash") {
                    html
                        .querySelectorAll("[data-yakov-dryh-roll-action='resolve-crash']")
                        .forEach((element) => element.setAttribute("disabled", "disabled"));
                    void resolveDryhRollCrashAction(message, {
                        type: actionElement.dataset.crashAction === "die" ? "die" : "sleep"
                    });
                    return;
                }
                html
                    .querySelectorAll("[data-yakov-dryh-roll-action='resolve-dominant']")
                    .forEach((element) => element.setAttribute("disabled", "disabled"));
                const dominantAction = actionElement.dataset.dominantAction;
                void resolveDryhRollDominantAction(message, {
                    responseType: dominantAction === "uncheck-response" || dominantAction === "check-response"
                        ? (responseType ?? null)
                        : null,
                    type: dominantAction === "uncheck-response" || dominantAction === "check-response"
                        ? dominantAction
                        : "remove-exhaustion"
                });
            });
            return;
        }
        if (card.finalized) {
            actionElement.setAttribute("disabled", "disabled");
            return;
        }
        actionElement.addEventListener("click", (event) => {
            event.preventDefault();
            if (action === "spend-hope" || action === "take-post-roll-exhaustion") {
                actionElement.setAttribute("disabled", "disabled");
                void applyDryhRollPlayerAction(message, {
                    type: action
                });
                return;
            }
            if (action === "finalize") {
                actionElement.setAttribute("disabled", "disabled");
                void finalizeDryhRoll(message);
                return;
            }
            if (!targetPool || (action !== "add6" && action !== "remove6")) {
                return;
            }
            actionElement.setAttribute("disabled", "disabled");
            void applyDryhRollGmAction(message, {
                type: action,
                targetPool
            });
        });
    });
}
export { advanceChatCardStatus, getChatCardData };
//# sourceMappingURL=index.js.map