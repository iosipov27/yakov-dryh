import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";

const DRYH_GM_DESPAIR_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}` as const;
const DRYH_SHARED_HOPE_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}` as const;

declare module "fvtt-types/configuration" {
  interface SettingConfig {
    [DRYH_GM_DESPAIR_SETTING]: number;
    [DRYH_SHARED_HOPE_SETTING]: number;
  }
}

export function registerSettings(): void {
  game.settings?.register(SYSTEM_ID, DRYH_SETTINGS.sharedHope, {
    name: "YAKOV_DRYH.SETTINGS.SharedHope.Name",
    hint: "YAKOV_DRYH.SETTINGS.SharedHope.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0
  });

  game.settings?.register(SYSTEM_ID, DRYH_SETTINGS.gmDespair, {
    name: "YAKOV_DRYH.SETTINGS.GmDespair.Name",
    hint: "YAKOV_DRYH.SETTINGS.GmDespair.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 0
  });
}
