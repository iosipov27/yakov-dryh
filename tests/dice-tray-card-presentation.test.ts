import { beforeEach, describe, expect, it } from "vitest";

import { createDiceTrayCardContext } from "../src/module/chat/dice-tray-card-presentation.ts";
import { normalizeDiceTrayState } from "../src/module/applications/ui/dice-tray-state.ts";

describe("dice tray card presentation", () => {
  beforeEach(() => {
    globalThis.game = {
      i18n: {
        localize: (key: string) => key
      }
    } as typeof game;
  });

  it("enables roll once the GM adds at least one pain die", () => {
    const noPainState = normalizeDiceTrayState({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 2,
        exhaustion: 2,
        madness: 3,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 2,
        exhaustion: 3,
        madness: 5,
        pain: 0
      }
    });
    const painReadyState = normalizeDiceTrayState({
      ...noPainState,
      pools: {
        ...noPainState.pools,
        pain: 1
      }
    });

    const waitingContext = createDiceTrayCardContext({
      isActorOwner: true,
      isGm: false,
      state: noPainState
    });
    const readyOwnerContext = createDiceTrayCardContext({
      isActorOwner: true,
      isGm: false,
      state: painReadyState
    });
    const readyGmContext = createDiceTrayCardContext({
      isActorOwner: false,
      isGm: true,
      state: painReadyState
    });

    expect(waitingContext.rollDisabled).toBe(true);
    expect(waitingContext.statusLabel).toBe("");
    expect(readyOwnerContext.rollDisabled).toBe(false);
    expect(readyOwnerContext.statusLabel).toBe("");
    expect(readyGmContext.rollDisabled).toBe(false);
  });

  it("limits pain editing to the GM and player pools to the actor owner", () => {
    const state = normalizeDiceTrayState({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 2,
        exhaustion: 2,
        madness: 3,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 2,
        exhaustion: 2,
        madness: 3,
        pain: 0
      }
    });
    const observerContext = createDiceTrayCardContext({
      isActorOwner: false,
      isGm: false,
      state
    });
    const gmContext = createDiceTrayCardContext({
      isActorOwner: false,
      isGm: true,
      state
    });
    const madnessPool = observerContext.poolSummaries.find(
      (summary) => summary.key === "madness"
    );
    const painPoolForObserver = observerContext.poolSummaries.find(
      (summary) => summary.key === "pain"
    );
    const painPoolForGm = gmContext.poolSummaries.find(
      (summary) => summary.key === "pain"
    );

    expect(madnessPool?.controls.canIncrease).toBe(false);
    expect(madnessPool?.controls.canDecrease).toBe(false);
    expect(painPoolForObserver?.controls.canIncrease).toBe(false);
    expect(painPoolForObserver?.controls.canDecrease).toBe(false);
    expect(painPoolForGm?.controls.canIncrease).toBe(true);
    expect(painPoolForGm?.controls.canDecrease).toBe(false);
  });

  it("renders fixed tray slots and hides the unused ones", () => {
    const state = normalizeDiceTrayState({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 3,
        exhaustion: 2,
        madness: 1,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 3,
        exhaustion: 3,
        madness: 1,
        pain: 0
      }
    });

    const context = createDiceTrayCardContext({
      isActorOwner: true,
      isGm: false,
      state
    });
    const exhaustion = context.poolSummaries.find((summary) => summary.key === "exhaustion");

    expect(exhaustion).toBeDefined();
    expect(exhaustion?.pips).toHaveLength(20);
    expect(exhaustion?.pips.slice(0, 3).every((pip) => pip.hidden === false)).toBe(true);
    expect(exhaustion?.pips[2]?.removable).toBe(false);
    expect(exhaustion?.controls.canDecrease).toBe(true);
    expect(exhaustion?.controls.canIncrease).toBe(false);
    expect(exhaustion?.pips.slice(3).every((pip) => pip.hidden === true)).toBe(true);
  });
});
