import { preloadSystemAssets } from "./asset-preloader.js";
import { renderHopeDespairTracker } from "../applications/ui/hope-despair-tracker.js";
import { registerChatHooks } from "../chat/index.js";
import { registerDocumentClasses } from "./documents.js";
import { registerSettings } from "./settings.js";
import { registerApplicationSheets } from "./sheets.js";
import { preloadHandlebarsTemplates } from "./templates.js";

export function registerSystem(): void {
  Hooks.once("init", async () => {
    registerDocumentClasses();
    registerSettings();
    registerApplicationSheets();
    registerChatHooks();
    await preloadHandlebarsTemplates();
  });

  Hooks.once("ready", () => {
    void preloadSystemAssets();
    void renderHopeDespairTracker();
  });
}
