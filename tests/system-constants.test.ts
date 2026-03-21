import { describe, expect, it } from "vitest";

import { SYSTEM_ID, TEMPLATE_PATHS } from "../src/module/constants.ts";
import {
  DRYH_EXHAUSTION_MAX,
  DRYH_RESPONSE_MAX,
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
      concept: "",
      discipline: 3,
      exhaustion: 0,
      madnessPermanent: 0,
      responses: {
        fight: 0,
        flight: 0,
        max: DRYH_RESPONSE_MAX
      },
      hope: 0,
      talents: {
        exhaustion: "",
        madness: ""
      },
      scars: []
    });
  });

  it("tracks the fixed exhaustion cap for the MVP", () => {
    expect(DRYH_EXHAUSTION_MAX).toBe(6);
  });
});
