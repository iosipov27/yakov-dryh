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
import * as data from "./data/index.js";
import * as documents from "./documents/index.js";

export interface YakovDryhSystemApi {
  applications: {
    dialogs: {
      ChatInteraction: typeof YakovDryhChatInteractionDialog;
    };
    sheets: {
      Character: typeof YakovDryhCharacterSheet;
    };
  };
  data: typeof data;
  documents: typeof documents;
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
