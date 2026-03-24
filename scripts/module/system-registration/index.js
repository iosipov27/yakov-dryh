import { registerChatHooks } from "../chat/index.js";
import { renderHopeDespairTracker } from "../applications/ui/hope-despair-tracker.js";
import { registerDocumentClasses } from "./documents.js";
import { registerSettings } from "./settings.js";
import { registerApplicationSheets } from "./sheets.js";
import { preloadHandlebarsTemplates } from "./templates.js";
export function registerSystem(api) {
    Hooks.once("init", async () => {
        const systemData = game.system;
        systemData.api = api;
        registerDocumentClasses();
        registerSettings();
        registerApplicationSheets();
        registerChatHooks(api);
        await preloadHandlebarsTemplates();
    });
    Hooks.once("ready", () => {
        void renderHopeDespairTracker();
    });
}
//# sourceMappingURL=index.js.map