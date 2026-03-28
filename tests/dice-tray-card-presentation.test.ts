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

  it("keeps the roll button visible but disabled until the GM locks the pools", () => {
    const unlockedState = normalizeDiceTrayState({
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
        pain: 1
      }
    });
    const lockedState = normalizeDiceTrayState({
      ...unlockedState,
      confirmed: true
    });

    expect(
      createDiceTrayCardContext({
        isActorOwner: true,
        isGm: false,
        state: unlockedState
      }).rollDisabled
    ).toBe(true);
    expect(
      createDiceTrayCardContext({
        isActorOwner: true,
        isGm: false,
        state: lockedState
      }).rollDisabled
    ).toBe(false);
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
