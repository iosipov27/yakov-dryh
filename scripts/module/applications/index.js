import { SYSTEM_ID } from "../constants.js";
import { YakovDryhChatInteractionDialog } from "./dialogs/chat-interaction-dialog.js";
import { YakovDryhCharacterSheet } from "./sheets/character-sheet.js";
export { YakovDryhChatInteractionDialog, YakovDryhCharacterSheet };
export function registerApplicationSheets() {
    console.info(`[${SYSTEM_ID}] Character sheet shell is exposed through game.system.api.`);
}
//# sourceMappingURL=index.js.map