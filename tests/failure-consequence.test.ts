import { describe, expect, it } from "vitest";

import { createRollResult } from "../src/module/dice/index.ts";
import { getFailureConsequence } from "../src/module/chat/failure-consequence.ts";

describe("DRYH failure consequences", () => {
  it("forces marking a response when exhaustion dominates a failure", () => {
    const rollResult = createRollResult({
      discipline: [5],
      exhaustion: [6],
      madness: [4],
      pain: [1, 4]
    });

    expect(getFailureConsequence(rollResult)).toBe("mark-response");
  });

  it("forces exhaustion when madness dominates a failure", () => {
    const rollResult = createRollResult({
      discipline: [5],
      exhaustion: [4],
      madness: [6],
      pain: [1, 4]
    });

    expect(getFailureConsequence(rollResult)).toBe("gain-exhaustion");
  });

  it("keeps the choice open when failure is dominated by another pool", () => {
    const rollResult = createRollResult({
      discipline: [6],
      exhaustion: [4],
      madness: [5],
      pain: [1, 4]
    });

    expect(getFailureConsequence(rollResult)).toBe("gm-choice");
  });

  it("does not add a failure consequence on success", () => {
    const rollResult = createRollResult({
      discipline: [1, 6],
      exhaustion: [4],
      madness: [5],
      pain: [6]
    });

    expect(getFailureConsequence(rollResult)).toBeNull();
  });
});
