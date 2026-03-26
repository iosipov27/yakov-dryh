import { describe, expect, it } from "vitest";

import { applySnapToCharacterData, hasNoUncheckedResponses, shouldAutoApplySnap } from "../src/module/chat/snap.ts";
import { createDefaultCharacterSystemData } from "../src/module/data/index.ts";
import { createRollResult } from "../src/module/dice/index.ts";

describe("DRYH snap helpers", () => {
  it("detects when no unchecked responses remain", () => {
    expect(
      hasNoUncheckedResponses({
        max: 3,
        slots: [
          { checked: true, type: "fight" },
          { checked: true, type: "flight" },
          { checked: true, type: "fight" }
        ]
      })
    ).toBe(true);

    expect(
      hasNoUncheckedResponses({
        max: 3,
        slots: [
          { checked: true, type: "fight" },
          { checked: false, type: "flight" },
          { checked: true, type: "fight" }
        ]
      })
    ).toBe(false);
  });

  it("auto-applies snap when Madness dominates and no unchecked responses remain", () => {
    expect(
      shouldAutoApplySnap({
        dominant: createRollResult({
          discipline: [4],
          exhaustion: [5],
          madness: [6],
          pain: [3]
        }).dominant,
        failureConsequence: null,
        responses: {
          max: 3,
          slots: [
            { checked: true, type: "fight" },
            { checked: true, type: "flight" },
            { checked: true, type: "fight" }
          ]
        }
      })
    ).toBe(true);
  });

  it("auto-applies snap when a mandatory failure response check has no available responses", () => {
    expect(
      shouldAutoApplySnap({
        dominant: "exhaustion",
        failureConsequence: "mark-response",
        responses: {
          max: 3,
          slots: [
            { checked: true, type: "fight" },
            { checked: true, type: "flight" },
            { checked: true, type: "fight" }
          ]
        }
      })
    ).toBe(true);
  });

  it("clears responses and converts -1 Discipline to +1 Madness", () => {
    const actorData = {
      ...createDefaultCharacterSystemData(),
      discipline: 3,
      madnessPermanent: 2,
      responses: {
        max: 3,
        slots: [
          { checked: true, type: "fight" },
          { checked: true, type: "flight" },
          { checked: true, type: "fight" }
        ]
      }
    };

    expect(applySnapToCharacterData(actorData)).toEqual({
      ...actorData,
      discipline: 2,
      madnessPermanent: 3,
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
