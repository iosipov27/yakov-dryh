import { DRYH_SETTINGS, SYSTEM_ID } from "../../constants.js";
export function isSharedPoolSettingChange(setting) {
    return (setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}` ||
        setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.pendingHope}` ||
        setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`);
}
export function isDiceTraySettingChange(setting) {
    return (isSharedPoolSettingChange(setting) ||
        setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.diceTrayState}`);
}
//# sourceMappingURL=setting-change.js.map