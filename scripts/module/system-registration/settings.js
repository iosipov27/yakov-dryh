import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";
const DRYH_GM_DESPAIR_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`;
const DRYH_SHARED_HOPE_SETTING = `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}`;
export function registerSettings() {
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
//# sourceMappingURL=settings.js.map