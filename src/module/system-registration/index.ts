import type { YakovDryhSystemApi } from "../api.js";
import { registerChatHooks } from "../chat/index.js";
import { registerDocumentClasses } from "./documents.js";
import { registerApplicationSheets } from "./sheets.js";

export function registerSystem(api: YakovDryhSystemApi): void {
  Hooks.once("init", () => {
    const systemData = game.system as typeof game.system & {
      api?: YakovDryhSystemApi;
    };

    systemData.api = api;

    registerDocumentClasses();
    registerApplicationSheets();
    registerChatHooks(api);
  });
}
