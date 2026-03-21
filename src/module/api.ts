import {
  YakovDryhChatInteractionDialog,
  YakovDryhCharacterSheet
} from "./applications/index.js";
import {
  advanceChatCardStatus,
  createInteractiveChatMessage,
  getChatCardData,
  rerenderChatCard,
  type CreateInteractiveChatMessageInput,
  type YakovDryhChatCardData
} from "./chat/chat-card-service.js";
import { openChatInteraction } from "./chat/index.js";

export interface YakovDryhSystemApi {
  applications: {
    dialogs: {
      ChatInteraction: typeof YakovDryhChatInteractionDialog;
    };
    sheets: {
      Character: typeof YakovDryhCharacterSheet;
    };
  };
  chat: {
    advanceStatus: (message: ChatMessage.Implementation) => Promise<YakovDryhChatCardData>;
    createInteractiveMessage: (
      input?: CreateInteractiveChatMessageInput
    ) => Promise<ChatMessage.Implementation>;
    getCardData: (message: ChatMessage.Implementation) => YakovDryhChatCardData;
    openInteraction: (message: ChatMessage.Implementation) => Promise<YakovDryhChatInteractionDialog>;
    rerender: (message: ChatMessage.Implementation) => Promise<YakovDryhChatCardData>;
  };
}

export function createSystemApi(): YakovDryhSystemApi {
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
