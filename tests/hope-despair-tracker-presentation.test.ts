import { describe, expect, it } from "vitest";

import { createHopeDespairTrackerContext } from "../src/module/applications/ui/hope-despair-tracker-presentation.ts";

describe("hope despair tracker presentation", () => {
  it("marks the tracker editable only for the GM", () => {
    expect(
      createHopeDespairTrackerContext({
        isGm: false,
        sharedPools: {
          despair: 2,
          hope: 5,
          pendingHope: 0
        }
      })
    ).toEqual({
      canEdit: false,
      despair: 2,
      hasPendingHope: false,
      hope: 5,
      pendingHope: 0
    });
  });

  it("shows pending hope when the next-scene pool is populated", () => {
    expect(
      createHopeDespairTrackerContext({
        isGm: true,
        sharedPools: {
          despair: 1,
          hope: 3,
          pendingHope: 2
        }
      }).hasPendingHope
    ).toBe(true);
  });
});
