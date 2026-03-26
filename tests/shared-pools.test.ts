import { afterEach, describe, expect, it, vi } from "vitest";

import { DRYH_SETTINGS, SYSTEM_ID } from "../src/module/constants.ts";
import {
  addHope,
  adjustSharedPool,
  getSharedPools,
  spendDespair,
  spendHope,
} from "../src/module/resources/index.ts";

interface MockSettingsApi {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

const testGlobal = globalThis as typeof globalThis & {
  game?: {
    settings: MockSettingsApi;
  };
};

afterEach(() => {
  delete testGlobal.game;
  vi.restoreAllMocks();
});

describe("shared DRYH pools", () => {
  it("clamps manual pool adjustments at zero", async () => {
    const values = new Map<string, number>([[DRYH_SETTINGS.sharedHope, 1]]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    const nextHope = await adjustSharedPool("hope", -4);

    expect(nextHope).toBe(0);
    expect(settings.set).toHaveBeenCalledWith(
      SYSTEM_ID,
      DRYH_SETTINGS.sharedHope,
      0
    );
  });

  it("reads both shared pools from world settings", () => {
    const values = new Map<string, number>([
      [DRYH_SETTINGS.sharedHope, 3],
      [DRYH_SETTINGS.gmDespair, 2]
    ]);

    testGlobal.game = { settings: createMockSettings(values) };

    expect(getSharedPools()).toEqual({
      despair: 2,
      hope: 3
    });
  });

  it("spends one Despair for GM intervention without adding Hope immediately", async () => {
    const values = new Map<string, number>([
      [DRYH_SETTINGS.sharedHope, 2],
      [DRYH_SETTINGS.gmDespair, 1]
    ]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    await expect(spendDespair()).resolves.toBe(0);
    expect(settings.set).toHaveBeenCalledTimes(1);
    expect(settings.set).toHaveBeenCalledWith(
      SYSTEM_ID,
      DRYH_SETTINGS.gmDespair,
      0
    );
    expect(values.get(DRYH_SETTINGS.sharedHope)).toBe(2);
  });

  it("blocks the conversion when no Despair is available", async () => {
    const values = new Map<string, number>([
      [DRYH_SETTINGS.sharedHope, 2],
      [DRYH_SETTINGS.gmDespair, 0]
    ]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    await expect(spendDespair()).resolves.toBeNull();
    expect(settings.set).not.toHaveBeenCalled();
  });

  it("adds deferred Hope when the conflict is finalized", async () => {
    const values = new Map<string, number>([[DRYH_SETTINGS.sharedHope, 2]]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    await expect(addHope(1)).resolves.toBe(3);
    expect(settings.set).toHaveBeenCalledWith(
      SYSTEM_ID,
      DRYH_SETTINGS.sharedHope,
      3
    );
  });

  it("spends one Hope when the player improves Discipline", async () => {
    const values = new Map<string, number>([[DRYH_SETTINGS.sharedHope, 2]]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    await expect(spendHope()).resolves.toBe(1);
    expect(settings.set).toHaveBeenCalledWith(
      SYSTEM_ID,
      DRYH_SETTINGS.sharedHope,
      1
    );
  });

  it("blocks spending Hope when none is available", async () => {
    const values = new Map<string, number>([[DRYH_SETTINGS.sharedHope, 0]]);
    const settings = createMockSettings(values);

    testGlobal.game = { settings };

    await expect(spendHope()).resolves.toBeNull();
    expect(settings.set).not.toHaveBeenCalled();
  });
});

function createMockSettings(values: Map<string, number>): MockSettingsApi {
  return {
    get: vi.fn((_scope: string, key: string) => values.get(key) ?? 0),
    set: vi.fn(async (_scope: string, key: string, value: number) => {
      values.set(key, value);
      return value;
    })
  };
}
