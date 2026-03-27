import { describe, expect, it } from "vitest";

import {
  applyCrashSleepToCharacterData,
  shouldAutoApplyCrash,
  shouldOfferCrashResolution
} from "../src/module/chat/crash.ts";
import { canAddPreRollExhaustion } from "../src/module/applications/dialogs/roll-dialog-rules.ts";
import {
  createDefaultCharacterSystemData,
  normalizeCharacterSystemData
} from "../src/module/data/index.ts";

describe("DRYH crash helpers", () => {
  it("triggers crash only after exhaustion goes above 6", () => {
    expect(shouldAutoApplyCrash(5)).toBe(false);
    expect(shouldAutoApplyCrash(6)).toBe(false);
    expect(shouldAutoApplyCrash(7)).toBe(true);
  });

  it("blocks pre-roll exhaustion once the actor is already at 6 or higher", () => {
    expect(canAddPreRollExhaustion(5)).toBe(true);
    expect(canAddPreRollExhaustion(6)).toBe(false);
    expect(canAddPreRollExhaustion(7)).toBe(false);
  });

  it("only offers crash resolution once other final resolutions are done", () => {
    expect(
      shouldOfferCrashResolution({
        crashResolved: false,
        exhaustion: 7,
        hasPendingDominantResolution: false,
        hasPendingFailureResolution: false
      })
    ).toBe(true);

    expect(
      shouldOfferCrashResolution({
        crashResolved: false,
        exhaustion: 7,
        hasPendingDominantResolution: true,
        hasPendingFailureResolution: false
      })
    ).toBe(false);

    expect(
      shouldOfferCrashResolution({
        crashResolved: true,
        exhaustion: 7,
        hasPendingDominantResolution: false,
        hasPendingFailureResolution: false
      })
    ).toBe(false);
  });

  it("preserves exhaustion values above 6 in normalized actor data", () => {
    expect(
      normalizeCharacterSystemData({
        exhaustion: 7
      }).exhaustion
    ).toBe(7);
  });

  it("applies the sleep branch by resetting exhaustion, discipline, and responses", () => {
    const actorData = {
      ...createDefaultCharacterSystemData(),
      discipline: 3,
      exhaustion: 6,
      madnessPermanent: 2,
      responses: {
        max: 3,
        slots: [
          { checked: true, type: "fight" },
          { checked: true, type: "flight" },
          { checked: false, type: "fight" }
        ]
      }
    };

    expect(applyCrashSleepToCharacterData(actorData)).toEqual({
      ...actorData,
      discipline: 1,
      exhaustion: 0,
      responses: {
        max: 3,
        slots: [
          { checked: false, type: "fight" },
          { checked: false, type: "flight" },
          { checked: false, type: "fight" }
        ]
      }
    });
  });
});
