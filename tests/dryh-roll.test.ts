import { describe, expect, it } from "vitest";

import {
  applyGmActionToRollResult,
  createRollResult,
  getDominantPool
} from "../src/module/dice/index.ts";

describe("DRYH roll logic", () => {
  it("counts player successes against pain successes", () => {
    const result = createRollResult({
      discipline: [1, 4, 6],
      exhaustion: [2],
      madness: [3, 5],
      pain: [1, 4]
    });

    expect(result.successes.player).toBe(4);
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
});
