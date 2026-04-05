import { describe, expect, it } from "vitest";

import { ADDABLE_DICE_TRAY_POOLS } from "../src/module/applications/ui/dice-tray-rules.ts";

describe("dice tray rules", () => {
  it("allows pre-roll add buttons only for exhaustion, madness, and pain", () => {
    expect(ADDABLE_DICE_TRAY_POOLS).toEqual(["exhaustion", "madness", "pain"]);
  });
});
