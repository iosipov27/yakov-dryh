import { registerApplicationSheets } from "../applications/index.js";
import { SYSTEM_ID } from "../constants.js";
import { registerChatHooks } from "../chat/index.js";
export function registerSystem(api) {
    Hooks.once("init", () => {
        const systemData = game.system;
        systemData.api = api;
        registerApplicationSheets();
        registerChatHooks(api);
    });
    Hooks.once("ready", () => {
        console.info(`[${SYSTEM_ID}] Composition root ready.`);
    });
}
//# sourceMappingURL=index.js.map