import { YakovDryhChatInteractionDialog } from "../applications/dialogs/chat-interaction-dialog.js";
import type { YakovDryhSystemApi } from "../api.js";
import { CHAT_CARD_COMMAND } from "../constants.js";
import {
  finalizeDryhRoll,
  getDryhRollCardData,
  hasDryhRollCard
} from "./roll-card-service.js";
import {
  advanceChatCardStatus,
  getChatCardData,
  hasInteractiveChatCard,
  markChatCardDialogOpened
} from "./chat-card-service.js";

export async function openChatInteraction(
  message: ChatMessage.Implementation
): Promise<YakovDryhChatInteractionDialog> {
  await markChatCardDialogOpened(message);

  const liveMessage =
    (message.id ? game.messages?.get(message.id) : null) ?? message;
  const dialog = new YakovDryhChatInteractionDialog(liveMessage);

  await dialog.render({ force: true });

  return dialog;
}

export function registerChatHooks(api: YakovDryhSystemApi): void {
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
}

function activateChatCardListeners(
  message: ChatMessage.Implementation,
  html: HTMLElement,
  api: YakovDryhSystemApi
): void {
  const actions = html.querySelectorAll<HTMLElement>(
    "[data-yakov-dryh-action]"
  );

  actions.forEach((actionElement) => {
    const action = actionElement.getAttribute("data-yakov-dryh-action");

    if (action === "open-dialog") {
      actionElement.addEventListener("click", (event: MouseEvent) => {
        event.preventDefault();
        void api.chat.openInteraction(message);
      });
    }

    if (action === "advance-status") {
      actionElement.addEventListener("click", (event: MouseEvent) => {
        event.preventDefault();
        void api.chat.advanceStatus(message);
      });
    }
  });
}

function activateDryhRollListeners(
  message: ChatMessage.Implementation,
  html: HTMLElement
): void {
  const card = getDryhRollCardData(message);
  const actionElements = html.querySelectorAll<HTMLElement>(
    "[data-yakov-dryh-roll-action]"
  );

  actionElements.forEach((actionElement) => {
    if (game.user && !game.user.isGM) {
      actionElement.hidden = true;
      return;
    }

    if (card.stage !== "initial" || card.finalized) {
      actionElement.setAttribute("disabled", "disabled");
      return;
    }

    const action = actionElement.dataset.yakovDryhRollAction;
    const targetPool = actionElement.dataset.targetPool as
      | "discipline"
      | "exhaustion"
      | "madness"
      | "pain"
      | undefined;

    actionElement.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      actionElement.setAttribute("disabled", "disabled");

      if (action === "finalize") {
        void finalizeDryhRoll(message);
        return;
      }

      if (!targetPool || (action !== "add6" && action !== "remove6")) {
        return;
      }

      void finalizeDryhRoll(message, {
        type: action,
        targetPool
      });
    });
  });
}

export { advanceChatCardStatus, getChatCardData };
