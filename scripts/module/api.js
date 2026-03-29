import { YakovDryhChatInteractionDialog, YakovDryhCharacterSheet, YakovDryhDiceTray, YakovDryhHopeDespairTracker } from "./applications/index.js";
import { advanceChatCardStatus, createInteractiveChatMessage, getChatCardData, rerenderChatCard } from "./chat/chat-card-service.js";
import { openChatInteraction } from "./chat/index.js";
import * as data from "./data/index.js";
import * as documents from "./documents/index.js";
export function createSystemApi() {
    return {
        applications: {
            dialogs: {
                ChatInteraction: YakovDryhChatInteractionDialog
            },
            ui: {
                DiceTray: YakovDryhDiceTray,
                HopeDespairTracker: YakovDryhHopeDespairTracker
            },
            sheets: {
                Character: YakovDryhCharacterSheet
            }
        },
        data,
        documents,
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