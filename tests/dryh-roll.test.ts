import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyPainRollToRollResult,
  applyGmActionToRollResult,
  createRollResult,
  getDominantPool
} from "../src/module/dice/index.ts";

const testGlobal = globalThis as typeof globalThis & {
  CONFIG?: {
    Dice: {
      randomUniform: () => number;
    };
  };
};
const originalConfig = testGlobal.CONFIG;

afterEach(() => {
  testGlobal.CONFIG = originalConfig;
  vi.restoreAllMocks();
});

describe("DRYH roll logic", () => {
  it("counts player successes against pain successes", () => {
    const result = createRollResult({
      discipline: [1, 4, 6],
      exhaustion: [2],
      madness: [3, 5],
      pain: [1, 4]
    });

    expect(result.successes.player).toBe(3);
    expect(result.successes.pain).toBe(1);
    expect(result.outcome).toBe("success");
  });

  it("uses the documented dominant priority when sorted dice tie", () => {
    const dominant = getDominantPool({
      discipline: [6, 4],
      exhaustion: [6, 4],
      madness: [6, 4],
      pain: [6, 4]
    });

    expect(dominant).toBe("discipline");
  });

  it("recalculates the result after a GM adds a six", () => {
    const initialResult = createRollResult({
      discipline: [4],
      exhaustion: [5],
      madness: [2],
      pain: [6]
    });
    const modifiedResult = applyGmActionToRollResult(initialResult, {
      type: "add6",
      targetPool: "madness"
    });

    expect(modifiedResult.pools.madness).toEqual([2, 6]);
    expect(modifiedResult.dominant).toBe("madness");
  });

  it("appends rolled pain dice to the current pain pool before finalizing", () => {
    testGlobal.CONFIG = {
      Dice: {
        randomUniform: vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.9)
      }
    };

    const initialResult = createRollResult({
      discipline: [2, 4],
      exhaustion: [5],
      madness: [6],
      pain: [6]
    });
    const modifiedResult = applyPainRollToRollResult(initialResult, 2);

    expect(modifiedResult.pools.pain).toEqual([6, 2, 6]);
    expect(modifiedResult.successes.pain).toBe(1);
  });

  it("allows GM six adjustments on the pain pool after pain is rolled", () => {
    const initialResult = createRollResult({
      discipline: [3],
      exhaustion: [5],
      madness: [4],
      pain: [2, 6]
    });
    const modifiedResult = applyGmActionToRollResult(initialResult, {
      type: "remove6",
      targetPool: "pain"
    });

    expect(modifiedResult.pools.pain).toEqual([2]);
    expect(modifiedResult.successes.pain).toBe(1);
  });
});
