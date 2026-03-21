import { registerChatHooks } from "../chat/index.js";
import { registerDocumentClasses } from "./documents.js";
import { registerSettings } from "./settings.js";
import { registerApplicationSheets } from "./sheets.js";
export function registerSystem(api) {
    Hooks.once("init", () => {
        const systemData = game.system;
        systemData.api = api;
        registerDocumentClasses();
        registerSettings();
        registerApplicationSheets();
        registerChatHooks(api);
    });
}
//# sourceMappingURL=index.js.map
