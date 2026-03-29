import { afterEach, describe, expect, it, vi } from "vitest";

import {
  adjustDiceTrayPool,
  canDecreaseDiceTrayPool,
  canIncreaseDiceTrayPool,
  createDefaultDiceTrayState,
  createDiceTrayStateForActor,
  getDiceTrayMaxPools,
  getDiceTrayMinPools,
  getDiceTrayState,
  normalizeDiceTrayState,
  resetDiceTrayState,
  setDiceTrayState,
  subscribeToDiceTrayStateChanges
} from "../src/module/applications/ui/dice-tray-state.ts";

function createActorStub(system: Record<string, unknown>): Actor.Implementation {
  return {
    id: "actor-1",
    name: "Samewere",
    system,
    uuid: "Actor.actor-1"
  } as Actor.Implementation;
}

afterEach(async () => {
  await resetDiceTrayState();
  vi.restoreAllMocks();
});

describe("dice tray state", () => {
  it("creates an empty default tray state", () => {
    expect(createDefaultDiceTrayState()).toEqual({
      actorId: null,
      actorName: "",
      actorUuid: null,
      basePools: {
        discipline: 0,
        exhaustion: 0,
        madness: 0,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 0,
        exhaustion: 0,
        madness: 0,
        pain: 0
      }
    });
  });

  it("loads the actor sheet pools into the tray", () => {
    const state = createDiceTrayStateForActor(
      createActorStub({
        discipline: 2,
        exhaustion: 5,
        madnessPermanent: 4
      })
    );

    expect(state).toEqual({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 2,
        exhaustion: 5,
        madness: 4,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 2,
        exhaustion: 5,
        madness: 4,
        pain: 0
      }
    });
  });

  it("keeps pre-roll exhaustion capped at the sheet value when the actor already has 6 exhaustion", () => {
    const state = normalizeDiceTrayState({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 2,
        exhaustion: 6,
        madness: 1,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 2,
        exhaustion: 7,
        madness: 1,
        pain: 0
      }
    });

    expect(state.pools.exhaustion).toBe(6);
    expect(getDiceTrayMaxPools(state).exhaustion).toBe(6);
  });

  it("allows exactly one extra exhaustion die below 6 and up to six extra madness dice", () => {
    const state = normalizeDiceTrayState({
      actorId: "actor-1",
      actorName: "Samewere",
      actorUuid: "Actor.actor-1",
      basePools: {
        discipline: 2,
        exhaustion: 5,
        madness: 4,
        pain: 0
      },
      confirmed: false,
      pools: {
        discipline: 2,
        exhaustion: 6,
        madness: 10,
        pain: 0
      }
    });

    expect(getDiceTrayMaxPools(state)).toEqual({
      discipline: 2,
      exhaustion: 6,
      madness: 10,
      pain: Number.MAX_SAFE_INTEGER
    });
    expect(canIncreaseDiceTrayPool(state, "exhaustion")).toBe(false);
    expect(canIncreaseDiceTrayPool(state, "madness")).toBe(false);
  });

  it("only allows removing player dice above the loaded base pools", () => {
    const loadedState = normalizeDiceTrayState({
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
    const expandedState = normalizeDiceTrayState({
      ...loadedState,
      pools: {
        ...loadedState.pools,
        exhaustion: 3,
        madness: 5,
        pain: 2
      }
    });

    expect(getDiceTrayMinPools(loadedState)).toEqual({
      discipline: 2,
      exhaustion: 2,
      madness: 3,
      pain: 0
    });
    expect(canDecreaseDiceTrayPool(loadedState, "discipline")).toBe(false);
    expect(canDecreaseDiceTrayPool(loadedState, "exhaustion")).toBe(false);
    expect(canDecreaseDiceTrayPool(expandedState, "exhaustion")).toBe(true);
    expect(canDecreaseDiceTrayPool(expandedState, "madness")).toBe(true);
    expect(canDecreaseDiceTrayPool(expandedState, "pain")).toBe(true);
  });

  it("locks all tray editing once the GM confirms the pools", () => {
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
      confirmed: true,
      pools: {
        discipline: 2,
        exhaustion: 3,
        madness: 4,
        pain: 2
      }
    });

    expect(canIncreaseDiceTrayPool(state, "pain")).toBe(false);
    expect(canDecreaseDiceTrayPool(state, "pain")).toBe(false);
    expect(canIncreaseDiceTrayPool(state, "madness")).toBe(false);
    expect(canDecreaseDiceTrayPool(state, "madness")).toBe(false);
  });

  it("stores tray state in local memory without writing to world settings", async () => {
    const settingsSet = vi.fn();

    globalThis.game = {
      i18n: {
        localize: () => "Actor"
      },
      settings: {
        set: settingsSet
      }
    } as typeof game;

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
        pain: 1
      }
    });

    await setDiceTrayState(state);

    expect(getDiceTrayState()).toEqual(state);
    expect(settingsSet).not.toHaveBeenCalled();
  });

  it("emits debounced sync updates when tray pools change locally", async () => {
    const syncModes: string[] = [];
    const unsubscribe = subscribeToDiceTrayStateChanges((change) => {
      syncModes.push(change.syncMode);
    });

    await setDiceTrayState(
      normalizeDiceTrayState({
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
      }),
      { syncMode: "none" }
    );

    await adjustDiceTrayPool("pain", 1);

    unsubscribe();

    expect(syncModes).toEqual(["none", "debounced"]);
    expect(getDiceTrayState().pools.pain).toBe(1);
  });
});
