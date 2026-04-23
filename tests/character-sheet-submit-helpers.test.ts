import { describe, expect, it } from "vitest";

import { normalizeCharacterSheetSubmitData } from "../src/module/applications/sheets/character-sheet-submit-helpers.ts";

describe("character sheet submit data normalization", () => {
  it("trims non-empty names before submit", () => {
    const result = normalizeCharacterSheetSubmitData({
      currentName: "Ada",
      submitData: {
        name: "  Nadia  ",
        "system.concept": "Sleepless detective"
      }
    });

    expect(result).toEqual({
      shouldWarnEmptyName: false,
      submitData: {
        name: "Nadia",
        "system.concept": "Sleepless detective"
      }
    });
  });

  it("restores the current actor name and warns when the submitted name is blank", () => {
    const result = normalizeCharacterSheetSubmitData({
      currentName: "Ada",
      submitData: {
        name: "   ",
        "system.concept": "Sleepless detective"
      }
    });

    expect(result).toEqual({
      shouldWarnEmptyName: true,
      submitData: {
        name: "Ada",
        "system.concept": "Sleepless detective"
      }
    });
  });

  it("drops the name update when both the submitted and current names are blank", () => {
    const result = normalizeCharacterSheetSubmitData({
      currentName: "  ",
      submitData: {
        name: "   ",
        "system.concept": "Sleepless detective"
      }
    });

    expect(result).toEqual({
      shouldWarnEmptyName: true,
      submitData: {
        "system.concept": "Sleepless detective"
      }
    });
  });

  it("restores the current actor name when submit data contains name as undefined", () => {
    const result = normalizeCharacterSheetSubmitData({
      currentName: "Ada",
      submitData: {
        name: undefined,
        "system.concept": "Sleepless detective"
      }
    });

    expect(result).toEqual({
      shouldWarnEmptyName: true,
      submitData: {
        name: "Ada",
        "system.concept": "Sleepless detective"
      }
    });
  });
});
