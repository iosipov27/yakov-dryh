import type { YakovDryhSystemApi } from "../api.js";
import { registerChatHooks } from "../chat/index.js";
import { registerDocumentClasses } from "./documents.js";
import { registerSettings } from "./settings.js";
import { registerApplicationSheets } from "./sheets.js";

export function registerSystem(api: YakovDryhSystemApi): void {
  Hooks.once("init", () => {
    const systemData = game.system as typeof game.system & {
      api?: YakovDryhSystemApi;
    };

    systemData.api = api;

    registerDocumentClasses();
    registerSettings();
    registerApplicationSheets();
    registerChatHooks(api);
  });
}
