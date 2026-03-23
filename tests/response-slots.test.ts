import { describe, expect, it } from "vitest";

import {
  addResponseSlot,
  countConfiguredResponses,
  countResponsesByType,
  createDefaultResponsesData,
  hasCheckedResponses
} from "../src/module/data/index.ts";

describe("response slot helpers", () => {
  it("starts with three empty response slots", () => {
    expect(createDefaultResponsesData()).toEqual({
      max: 3,
      slots: [
        { checked: false, type: "" },
        { checked: false, type: "" },
        { checked: false, type: "" }
      ]
    });
  });

  it("adds response slots into the first open position", () => {
    expect(
      addResponseSlot(
        {
          max: 3,
          slots: [
            { checked: false, type: "fight" },
            { checked: true, type: "flight" },
            { checked: false, type: "" }
          ]
        },
        "fight"
      )
    ).toEqual({
      max: 3,
      slots: [
        { checked: false, type: "fight" },
        { checked: true, type: "flight" },
        { checked: false, type: "fight" }
      ]
    });
  });

  it("returns null when no response slots remain", () => {
    expect(
      addResponseSlot(
        {
          max: 3,
          slots: [
            { checked: false, type: "fight" },
            { checked: false, type: "flight" },
            { checked: false, type: "fight" }
          ]
        },
        "flight"
      )
    ).toBeNull();
  });

  it("counts configured responses and per-type allocations", () => {
    const responses = {
      max: 3,
      slots: [
        { checked: false, type: "fight" },
        { checked: true, type: "fight" },
        { checked: false, type: "" }
      ]
    };

    expect(countConfiguredResponses(responses)).toBe(2);
    expect(countResponsesByType(responses, "fight")).toBe(2);
    expect(countResponsesByType(responses, "flight")).toBe(0);
  });

  it("detects whether any responses are currently checked", () => {
    expect(
      hasCheckedResponses({
        max: 3,
        slots: [
          { checked: false, type: "fight" },
          { checked: false, type: "flight" },
          { checked: false, type: "" }
        ]
      })
    ).toBe(false);

    expect(
      hasCheckedResponses({
        max: 3,
        slots: [
          { checked: false, type: "fight" },
          { checked: true, type: "flight" },
          { checked: false, type: "" }
        ]
      })
    ).toBe(true);
  });
});
