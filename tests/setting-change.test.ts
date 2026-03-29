import { describe, expect, it } from "vitest";

import { DRYH_SETTINGS, SYSTEM_ID } from "../src/module/constants.ts";
import {
  isDiceTraySettingChange,
  isSharedPoolSettingChange
} from "../src/module/applications/ui/setting-change.ts";

describe("setting change helpers", () => {
  it("treats shared pool settings as tracker updates", () => {
    expect(
      isSharedPoolSettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}`
      })
    ).toBe(true);
    expect(
      isSharedPoolSettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.pendingHope}`
      })
    ).toBe(true);
    expect(
      isSharedPoolSettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`
      })
    ).toBe(true);
    expect(
      isSharedPoolSettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.diceTrayState}`
      })
    ).toBe(false);
  });

  it("treats shared pool and dice tray settings as dice tray updates", () => {
    expect(
      isDiceTraySettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.sharedHope}`
      })
    ).toBe(true);
    expect(
      isDiceTraySettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.gmDespair}`
      })
    ).toBe(true);
    expect(
      isDiceTraySettingChange({
        key: `${SYSTEM_ID}.${DRYH_SETTINGS.diceTrayState}`
      })
    ).toBe(true);
    expect(
      isDiceTraySettingChange({
        key: `${SYSTEM_ID}.unrelated`
      })
    ).toBe(false);
  });
});
