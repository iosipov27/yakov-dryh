import { describe, expect, it } from "vitest";

import {
  checkFirstUncheckedResponse,
  DRYH_RESPONSE_MAX,
  type YakovDryhResponsesData
} from "../src/module/data/index.ts";
import { getFailureResolutionActions } from "../src/module/chat/failure-resolution.ts";

describe("DRYH failure resolution actions", () => {
  it("offers exhaustion plus both response buttons when both types are available", () => {
    expect(
      getFailureResolutionActions("gm-choice", createResponses([
        { checked: false, type: "fight" },
        { checked: false, type: "flight" },
        { checked: true, type: "fight" }
      ]))
    ).toEqual([
      { responseType: null, type: "gain-exhaustion" },
      { responseType: "fight", type: "check-response" },
      { responseType: "flight", type: "check-response" }
    ]);
  });

  it("offers only the remaining response type when no choice remains", () => {
    expect(
      getFailureResolutionActions("mark-response", createResponses([
        { checked: true, type: "fight" },
        { checked: false, type: "flight" },
        { checked: true, type: "flight" }
      ]))
    ).toEqual([
      { responseType: "flight", type: "check-response" }
    ]);
  });

  it("offers snap when a response must be checked but none remain", () => {
    expect(
      getFailureResolutionActions("mark-response", createResponses([
        { checked: true, type: "fight" },
        { checked: true, type: "flight" },
        { checked: true, type: "fight" }
      ]))
    ).toEqual([
      { responseType: null, type: "snap" }
    ]);
  });

  it("keeps the GM choice between exhaustion and snap when all responses are already checked", () => {
    expect(
      getFailureResolutionActions("gm-choice", createResponses([
        { checked: true, type: "fight" },
        { checked: true, type: "flight" },
        { checked: true, type: "fight" }
      ]))
    ).toEqual([
      { responseType: null, type: "gain-exhaustion" },
      { responseType: null, type: "snap" }
    ]);
  });

  it("checks the first unchecked response of the selected type", () => {
    expect(
      checkFirstUncheckedResponse(
        createResponses([
          { checked: true, type: "fight" },
          { checked: false, type: "fight" },
          { checked: false, type: "flight" }
        ]),
        "fight"
      )
    ).toEqual(
      createResponses([
        { checked: true, type: "fight" },
        { checked: true, type: "fight" },
        { checked: false, type: "flight" }
      ])
    );
  });
});

function createResponses(
  slots: YakovDryhResponsesData["slots"]
): YakovDryhResponsesData {
  return {
    max: DRYH_RESPONSE_MAX,
    slots
  };
}
