import { YakovDryhChatInteractionDialog } from "../applications/dialogs/chat-interaction-dialog.js";
import { CHAT_CARD_COMMAND } from "../constants.js";
import { advanceChatCardStatus, getChatCardData, hasInteractiveChatCard, markChatCardDialogOpened } from "./chat-card-service.js";
export async function openChatInteraction(message) {
    await markChatCardDialogOpened(message);
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
        if (!hasInteractiveChatCard(message)) {
            return;
        }
        activateChatCardListeners(message, html, api);
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
export { advanceChatCardStatus, getChatCardData };
//# sourceMappingURL=index.js.map