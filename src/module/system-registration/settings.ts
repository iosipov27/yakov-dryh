import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";
import { createDefaultDiceTrayState } from "../applications/ui/dice-tray-state.js";

const DRYH_DICE_TRAY_STATE_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.diceTrayState}` as const;
const DRYH_GM_DESPAIR_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}` as const;
const DRYH_PENDING_HOPE_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.pendingHope}` as const;
const DRYH_SHARED_HOPE_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}` as const;

declare module "fvtt-types/configuration" {
  interface SettingConfig {
    [DRYH_DICE_TRAY_STATE_SETTING]: string;
    [DRYH_GM_DESPAIR_SETTING]: number;
    [DRYH_PENDING_HOPE_SETTING]: number;
    [DRYH_SHARED_HOPE_SETTING]: number;
  }
}

export function registerSettings(): void {
  game.settings?.register(SYSTEM_ID, DRYH_SETTINGS.diceTrayState, {
    scope: "world",
    config: false,
    type: String,
    default: JSON.stringify(createDefaultDiceTrayState())
  });

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

  game.settings?.register(SYSTEM_ID, DRYH_SETTINGS.pendingHope, {
    name: "YAKOV_DRYH.SETTINGS.PendingHope.Name",
    hint: "YAKOV_DRYH.SETTINGS.PendingHope.Hint",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
}
