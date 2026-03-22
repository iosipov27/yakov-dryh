export const SYSTEM_ID = "yakov-dryh";
export const SYSTEM_TITLE = "Yakov Dryh";
export const SYSTEM_PATH = `systems/${SYSTEM_ID}`;
export const TEMPLATE_PATHS = {
    characterSheet: `${SYSTEM_PATH}/templates/sheets/character-sheet.hbs`,
    chatCard: `${SYSTEM_PATH}/templates/chat/interactive-card.hbs`,
    chatInteractionDialog: `${SYSTEM_PATH}/templates/dialogs/chat-interaction-dialog.hbs`,
    dryhPainRollDialog: `${SYSTEM_PATH}/templates/dialogs/pain-roll-dialog.hbs`,
    dryhRollCard: `${SYSTEM_PATH}/templates/chat/roll-card.hbs`,
    dryhRollDialog: `${SYSTEM_PATH}/templates/dialogs/roll-dialog.hbs`,
    hopeDespairTracker: `${SYSTEM_PATH}/templates/ui/hope-despair-tracker.hbs`
};
export const CHAT_CARD_COMMAND = `/${SYSTEM_ID}-card`;
export const CHAT_CARD_FLAG = "chatCard";
export const CHAT_CARD_STATUSES = ["draft", "review", "resolved"];
export const DRYH_ROLL_FLAG = "dryhRoll";
export const DRYH_SETTINGS = {
    gmDespair: "gmDespair",
    sharedHope: "sharedHope"
};
export const LOCALIZATION_PREFIX = "YAKOV_DRYH";
//# sourceMappingURL=constants.js.map