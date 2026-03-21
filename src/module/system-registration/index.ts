import type { YakovDryhSystemApi } from "../api.js";
import { registerApplicationSheets } from "../applications/index.js";
import { SYSTEM_ID } from "../constants.js";
import { registerChatHooks } from "../chat/index.js";

export function registerSystem(api: YakovDryhSystemApi): void {
  Hooks.once("init", () => {
    const systemData = game.system as typeof game.system & {
      api?: YakovDryhSystemApi;
    };

    systemData.api = api;

    registerApplicationSheets();
    registerChatHooks(api);
  });

  Hooks.once("ready", () => {
    console.info(`[${SYSTEM_ID}] Composition root ready.`);
  });
}
