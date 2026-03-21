import { YakovDryhChatInteractionDialog, YakovDryhCharacterSheet } from "./applications/index.js";
import { advanceChatCardStatus, createInteractiveChatMessage, getChatCardData, rerenderChatCard } from "./chat/chat-card-service.js";
import { openChatInteraction } from "./chat/index.js";
export function createSystemApi() {
    return {
        applications: {
            dialogs: {
                ChatInteraction: YakovDryhChatInteractionDialog
            },
            sheets: {
                Character: YakovDryhCharacterSheet
            }
        },
        chat: {
            advanceStatus: advanceChatCardStatus,
            createInteractiveMessage: createInteractiveChatMessage,
            getCardData: getChatCardData,
            openInteraction: openChatInteraction,
            rerender: rerenderChatCard
        }
    };
}
//# sourceMappingURL=api.js.map