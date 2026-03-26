import { describe, expect, it } from "vitest";

import { createRollResult } from "../src/module/dice/index.ts";
import {
  canTakePostRollExhaustion,
  canSpendHopeForDiscipline,
  getAvailablePlayerRollActionTypes,
  type YakovDryhInitialRollCardData
} from "../src/module/chat/roll-card-service.ts";
import { createDefaultShadowCastingData } from "../src/module/chat/shadow-casting.ts";
import { shouldHideDryhRollAction } from "../src/module/chat/roll-card-visibility.ts";

function createInitialCard(
  overrides: Partial<YakovDryhInitialRollCardData> = {}
): YakovDryhInitialRollCardData {
  return {
    actorId: "actor-1",
    actorName: "Test Actor",
    actorUuid: "Actor.actor-1",
    finalMessageId: null,
    finalized: false,
    gmActionUsed: false,
    painRolled: true,
    playerAdjustments: {
      hopeBoostUsed: false,
      postRollExhaustionTaken: false,
      preRollExhaustionTaken: false
    },
    rollResult: createRollResult({
      discipline: [4],
      exhaustion: [5],
      madness: [6],
      pain: [3]
    }),
    shadowCasting: createDefaultShadowCastingData(),
    stage: "initial",
    ...overrides
  };
}

describe("DRYH player post-roll action availability", () => {
  it("shows no player actions before Pain is rolled", () => {
    const card = createInitialCard({
      painRolled: false
    });

    expect(canSpendHopeForDiscipline(card, 1)).toBe(false);
    expect(canTakePostRollExhaustion(card)).toBe(false);
    expect(getAvailablePlayerRollActionTypes(card, 1)).toEqual([]);
  });

  it("shows both player actions when Pain is rolled and both conditions are met", () => {
    const card = createInitialCard();

    expect(getAvailablePlayerRollActionTypes(card, 1)).toEqual([
      "spend-hope",
      "take-post-roll-exhaustion"
    ]);
  });

  it("hides the Hope action when no Hope is available or it was already used", () => {
    expect(canSpendHopeForDiscipline(createInitialCard(), 0)).toBe(false);
    expect(
      canSpendHopeForDiscipline(
        createInitialCard({
          playerAdjustments: {
            hopeBoostUsed: true,
            postRollExhaustionTaken: false,
            preRollExhaustionTaken: false
          }
        }),
        1
      )
    ).toBe(false);
  });

  it("hides the post-roll Exhaustion action if pre-roll or post-roll Exhaustion was already taken", () => {
    expect(
      canTakePostRollExhaustion(
        createInitialCard({
          playerAdjustments: {
            hopeBoostUsed: false,
            postRollExhaustionTaken: false,
            preRollExhaustionTaken: true
          }
        })
      )
    ).toBe(false);

    expect(
      canTakePostRollExhaustion(
        createInitialCard({
          playerAdjustments: {
            hopeBoostUsed: false,
            postRollExhaustionTaken: true,
            preRollExhaustionTaken: false
          }
        })
      )
    ).toBe(false);
  });
});

describe("DRYH roll-card action visibility", () => {
  it("shows GM actions only to the GM", () => {
    expect(
      shouldHideDryhRollAction("roll-pain", {
        isActorOwner: false,
        isGm: false
      })
    ).toBe(true);

    expect(
      shouldHideDryhRollAction("roll-pain", {
        isActorOwner: false,
        isGm: true
      })
    ).toBe(false);
  });

  it("shows player post-roll actions only to the actor owner", () => {
    expect(
      shouldHideDryhRollAction("spend-hope", {
        isActorOwner: true,
        isGm: false
      })
    ).toBe(false);

    expect(
      shouldHideDryhRollAction("spend-hope", {
        isActorOwner: false,
        isGm: true
      })
    ).toBe(true);
  });

  it("shows dominant resolution actions only to the actor owner", () => {
    expect(
      shouldHideDryhRollAction("resolve-dominant", {
        isActorOwner: true,
        isGm: false
      })
    ).toBe(false);

    expect(
      shouldHideDryhRollAction("resolve-dominant", {
        isActorOwner: false,
        isGm: false
      })
    ).toBe(true);
  });
});
