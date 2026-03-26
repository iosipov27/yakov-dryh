import { describe, expect, it } from "vitest";

import { getDominantResolutionActions } from "../src/module/chat/dominant-resolution.ts";

describe("DRYH dominant resolution actions", () => {
  it("offers Discipline dominant choices for checked responses and exhaustion", () => {
    expect(
      getDominantResolutionActions(
        "discipline",
        {
          max: 3,
          slots: [
            { checked: true, type: "fight" },
            { checked: true, type: "flight" },
            { checked: false, type: "fight" }
          ]
        },
        2
      )
    ).toEqual([
      {
        responseType: null,
        type: "remove-exhaustion"
      },
      {
        responseType: "fight",
        type: "uncheck-response"
      },
      {
        responseType: "flight",
        type: "uncheck-response"
      }
    ]);
  });

  it("offers one or two Madness dominant response buttons based on unchecked responses", () => {
    expect(
      getDominantResolutionActions(
        "madness",
        {
          max: 3,
          slots: [
            { checked: true, type: "fight" },
            { checked: false, type: "flight" },
            { checked: true, type: "fight" }
          ]
        },
        0
      )
    ).toEqual([
      {
        responseType: "flight",
        type: "check-response"
      }
    ]);

    expect(
      getDominantResolutionActions(
        "madness",
        {
          max: 3,
          slots: [
            { checked: false, type: "fight" },
            { checked: false, type: "flight" },
            { checked: true, type: "fight" }
          ]
        },
        0
      )
    ).toEqual([
      {
        responseType: "fight",
        type: "check-response"
      },
      {
        responseType: "flight",
        type: "check-response"
      }
    ]);
  });

  it("returns no dominant resolution actions for non-interactive dominant pools", () => {
    expect(
      getDominantResolutionActions(
        "pain",
        {
          max: 3,
          slots: [
            { checked: false, type: "fight" },
            { checked: false, type: "flight" },
            { checked: true, type: "fight" }
          ]
        },
        1
      )
    ).toEqual([]);
  });
});
