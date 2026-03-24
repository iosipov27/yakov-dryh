import { YakovDryhChatInteractionDialog } from "../applications/dialogs/chat-interaction-dialog.js";
import { YakovDryhPainRollDialog } from "../applications/dialogs/pain-roll-dialog.js";
import { CHAT_CARD_COMMAND, DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";
import { applyDryhRollGmAction, finalizeDryhRoll, getDryhRollCardData, hasDryhRollCard, resolveDryhRollFailureAction, rerenderDryhRollMessage } from "./roll-card-service.js";
import { advanceChatCardStatus, getChatCardData, hasInteractiveChatCard } from "./chat-card-service.js";
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
        if (hasDryhRollCard(message)) {
            activateDryhRollListeners(message, html);
        }
        if (!hasInteractiveChatCard(message)) {
            return;
        }
        activateChatCardListeners(message, html, api);
    });
    Hooks.on("updateSetting", (setting) => {
        if (setting.key !== `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`) {
            return;
        }
        const latestMessage = (game.messages?.contents ?? []).at(-1);
        if (!latestMessage || !hasDryhRollCard(latestMessage)) {
            return;
        }
        const card = getDryhRollCardData(latestMessage);
        if (card.stage !== "initial" ||
            card.finalized ||
            !card.painRolled ||
            card.gmActionUsed) {
            return;
        }
        void rerenderDryhRollMessage(latestMessage);
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
    const actionElements = html.querySelectorAll("[data-yakov-dryh-roll-action]");
    actionElements.forEach((actionElement) => {
        if (game.user && !game.user.isGM) {
            actionElement.hidden = true;
            return;
        }
        const action = actionElement.dataset.yakovDryhRollAction;
        const targetPool = actionElement.dataset.targetPool;
        const responseType = actionElement.dataset.responseType;
        if (card.stage === "final") {
            if (action !== "resolve-failure") {
                actionElement.setAttribute("disabled", "disabled");
                return;
            }
            actionElement.addEventListener("click", (event) => {
                event.preventDefault();
                html
                    .querySelectorAll("[data-yakov-dryh-roll-action]")
                    .forEach((element) => element.setAttribute("disabled", "disabled"));
                void resolveDryhRollFailureAction(message, {
                    responseType: actionElement.dataset.failureAction === "check-response"
                        ? (responseType ?? null)
                        : null,
                    type: actionElement.dataset.failureAction === "check-response"
                        ? "check-response"
                        : "gain-exhaustion"
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
            if (action === "roll-pain") {
                void YakovDryhPainRollDialog.openForMessage(message);
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