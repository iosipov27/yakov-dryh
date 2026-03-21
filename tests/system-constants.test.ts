import { describe, expect, it } from "vitest";

import { SYSTEM_ID, TEMPLATE_PATHS } from "../src/module/constants.ts";
import {
  YAKOV_DRYH_ACTOR_TYPES,
  createDefaultCharacterSystemData
} from "../src/module/data/index.ts";

describe("system scaffold constants", () => {
  it("uses the manifest system id in template paths", () => {
    expect(SYSTEM_ID).toBe("yakov-dryh");
    expect(TEMPLATE_PATHS.characterSheet).toContain(`systems/${SYSTEM_ID}/templates`);
  });

  it("provides a default character actor scaffold", () => {
    expect(YAKOV_DRYH_ACTOR_TYPES.character).toBe("character");
    expect(createDefaultCharacterSystemData()).toEqual({
      biography: "",
      notes: ""
    });
  });
});
