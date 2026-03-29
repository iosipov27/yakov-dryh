import { describe, expect, it } from "vitest";

import { createRollResult } from "../src/module/dice/index.ts";
import {
  canTakePostRollExhaustion,
  canSpendHopeForDiscipline,
  getAvailablePlayerRollActionTypes,
  getDisplayedFinalEffectTexts,
  getVisibleRollPools,
  getRollCardPresentationState,
  sortRollDiceForDisplay,
  type YakovDryhFinalRollCardData,
  type YakovDryhInitialRollCardData
} from "../src/module/chat/roll-card-service.ts";
import { createDefaultShadowCastingData } from "../src/module/chat/shadow-casting.ts";
import {
  isLatestChatMessage,
  shouldHideDryhRollAction,
  shouldShowPainRollWaitingMessage
} from "../src/module/chat/roll-card-visibility.ts";

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

function createFinalCard(
  overrides: Partial<YakovDryhFinalRollCardData> = {}
): YakovDryhFinalRollCardData {
  return {
    actorId: "actor-1",
    actorName: "Test Actor",
    actorUuid: "Actor.actor-1",
    crashCause: null,
    crashResolutionText: null,
    dominantEffectText: "GM gains +1 Despair.",
    dominantResolutionText: null,
    failureConsequence: null,
    failureEffectText: null,
    failureResolutionText: null,
    modifiedResult: createRollResult({
      discipline: [4],
      exhaustion: [5],
      madness: [6],
      pain: [3]
    }),
    originalRollId: "message-1",
    snapEffectText: null,
    stage: "final",
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

describe("DRYH roll-card presentation state", () => {
  it("sorts displayed dice from highest to lowest", () => {
    expect(sortRollDiceForDisplay([2, 6, 1, 4, 2, 6])).toEqual([6, 6, 4, 2, 2, 1]);
  });

  it("hides the Pain pool before Pain is rolled", () => {
    expect(
      getVisibleRollPools(
        createInitialCard({
          painRolled: false
        })
      )
    ).toEqual(["discipline", "exhaustion", "madness"]);
  });

  it("shows the Pain pool after Pain is rolled", () => {
    expect(getVisibleRollPools(createInitialCard())).toEqual([
      "discipline",
      "exhaustion",
      "madness",
      "pain"
    ]);
  });

  it("hides outcome and dominant sections before Pain is rolled", () => {
    expect(
      getRollCardPresentationState(
        createInitialCard({
          painRolled: false
        })
      )
    ).toEqual({
      showDominant: false,
      showOutcome: false,
      showPainRollWaiting: true
    });
  });

  it("reveals outcome and dominant sections after Pain is rolled", () => {
    expect(getRollCardPresentationState(createInitialCard())).toEqual({
      showDominant: true,
      showOutcome: true,
      showPainRollWaiting: false
    });
  });

  it("keeps outcome and dominant sections visible on final cards", () => {
    expect(getRollCardPresentationState(createFinalCard())).toEqual({
      showDominant: true,
      showOutcome: true,
      showPainRollWaiting: false
    });
  });

  it("hides the madness response-check text when snap already resolved it", () => {
    const card = createFinalCard({
      dominantEffectText: "Hence chooses a Response to check.",
      modifiedResult: createRollResult({
        discipline: [2],
        exhaustion: [3],
        madness: [6],
        pain: [4]
      }),
      snapEffectText: "Test Actor becomes a Nightmare."
    });

    expect(getDisplayedFinalEffectTexts(card)).toEqual({
      dominantEffectText: null,
      failureEffectText: null
    });
  });

  it("hides the failure response-check text when snap already resolved it", () => {
    const card = createFinalCard({
      failureConsequence: "mark-response",
      failureEffectText: "GM narrates the failure and chooses either +1 Exhaustion or mark a Response.",
      modifiedResult: createRollResult({
        discipline: [2],
        exhaustion: [6],
        madness: [4],
        pain: [1]
      }),
      snapEffectText: "All Responses are un-checked."
    });

    expect(getDisplayedFinalEffectTexts(card)).toEqual({
      dominantEffectText: "GM gains +1 Despair.",
      failureEffectText: null
    });
  });
});

describe("DRYH roll-card action visibility", () => {
  it("treats only the most recent chat message as interactive", () => {
    expect(
      isLatestChatMessage(
        { id: "message-2" },
        [{ id: "message-1" }, { id: "message-2" }]
      )
    ).toBe(true);

    expect(
      isLatestChatMessage(
        { id: "message-1" },
        [{ id: "message-1" }, { id: "message-2" }]
      )
    ).toBe(false);

    expect(isLatestChatMessage({ id: null }, [{ id: "message-1" }])).toBe(false);
  });

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

    expect(
      shouldHideDryhRollAction("resolve-crash", {
        isActorOwner: true,
        isGm: false
      })
    ).toBe(true);

    expect(
      shouldHideDryhRollAction("resolve-crash", {
        isActorOwner: false,
        isGm: true
      })
    ).toBe(false);
  });

  it("shows a waiting message to non-GM users instead of the Pain button", () => {
    expect(
      shouldShowPainRollWaitingMessage("roll-pain", {
        isActorOwner: true,
        isGm: false
      })
    ).toBe(true);

    expect(
      shouldShowPainRollWaitingMessage("roll-pain", {
        isActorOwner: false,
        isGm: true
      })
    ).toBe(false);
  });

  it("does not show the waiting message for other GM-only actions", () => {
    expect(
      shouldShowPainRollWaitingMessage("finalize", {
        isActorOwner: true,
        isGm: false
      })
    ).toBe(false);

    expect(
      shouldShowPainRollWaitingMessage("add6", {
        isActorOwner: false,
        isGm: false
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
