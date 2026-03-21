export const SYSTEM_ID = "yakov-dryh";
export const SYSTEM_TITLE = "Yakov Dryh";
export const SYSTEM_PATH = `systems/${SYSTEM_ID}`;
export const TEMPLATE_PATHS = {
    characterSheet: `${SYSTEM_PATH}/templates/sheets/character-sheet.hbs`,
    chatCard: `${SYSTEM_PATH}/templates/chat/interactive-card.hbs`,
    chatInteractionDialog: `${SYSTEM_PATH}/templates/dialogs/chat-interaction-dialog.hbs`
};
export const CHAT_CARD_COMMAND = `/${SYSTEM_ID}-card`;
export const CHAT_CARD_FLAG = "chatCard";
export const CHAT_CARD_STATUSES = ["draft", "review", "resolved"];
//# sourceMappingURL=constants.js.map