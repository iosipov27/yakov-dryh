import { DRYH_SETTINGS, SYSTEM_ID } from "../../constants.js";

interface SettingDocumentLike {
  key?: string;
}

export function isSharedPoolSettingChange(setting: SettingDocumentLike): boolean {
  return (
    setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}` ||
    setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.pendingHope}` ||
    setting.key === `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`
  );
}
