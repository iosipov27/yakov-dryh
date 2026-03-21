import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";

export function registerSettings(): void {
  game.settings.register(SYSTEM_ID, DRYH_SETTINGS.gmDespair, {
    name: "YAKOV_DRYH.SETTINGS.GmDespair.Name",
    hint: "YAKOV_DRYH.SETTINGS.GmDespair.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0
  });
}
