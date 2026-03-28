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
    expect(readyOwnerContext.statusLabel).toBe("Ready to roll.");
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

    expect(
      observerContext.paletteButtons.find((button) => button.key === "madness")?.disabled
    ).toBe(true);
    expect(
      observerContext.paletteButtons.find((button) => button.key === "pain")?.disabled
    ).toBe(true);
    expect(
      gmContext.paletteButtons.find((button) => button.key === "pain")?.disabled
    ).toBe(false);
  });
});
