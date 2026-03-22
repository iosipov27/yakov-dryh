import { describe, expect, it } from "vitest";

import { SYSTEM_ID, TEMPLATE_PATHS } from "../src/module/constants.ts";
import {
  DRYH_EXHAUSTION_MAX,
  DRYH_RESPONSE_MAX,
  YAKOV_DRYH_ACTOR_TYPES,
  createDefaultCharacterSystemData,
  normalizeResponses
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
        slots: [
          { checked: false, type: "" },
          { checked: false, type: "" },
          { checked: false, type: "" }
        ],
        max: DRYH_RESPONSE_MAX
      },
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

  it("migrates legacy numeric responses into checked response slots", () => {
    expect(normalizeResponses({ fight: 2, flight: 1 })).toEqual({
      slots: [
        { checked: true, type: "fight" },
        { checked: true, type: "fight" },
        { checked: true, type: "flight" }
      ],
      max: DRYH_RESPONSE_MAX
    });
  });
});
