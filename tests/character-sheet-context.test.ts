import { beforeEach, describe, expect, it } from "vitest";

import { createCharacterSheetContext } from "../src/module/applications/sheets/character-sheet-context.ts";

describe("character sheet pool edit context", () => {
  beforeEach(() => {
    globalThis.game = {
      i18n: {
        format: (key: string, data: Record<string, string>) =>
          key === "YAKOV_DRYH.SHEETS.Actor.Character.Fields.ResponsesRemaining"
            ? `Remaining: ${data.remaining}`
            : key,
        localize: (key: string) =>
          (
            {
              "TYPES.Actor.character": "Character",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Discipline": "Discipline",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Exhaustion": "Exhaustion",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.PermanentMadness": "Madness",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Responses": "Responses",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Fight": "Fight",
              "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Flight": "Flight"
            } as Record<string, string>
          )[key] ?? key
      }
    } as typeof globalThis.game;
  });

  it("renders static pool pips while the sheet is in normal mode", () => {
    const context = createCharacterSheetContext({
      actor: {
        name: "Ada",
        system: {
          discipline: 3,
          exhaustion: 2,
          madnessPermanent: 1,
          responses: {
            max: 3,
            slots: [
              { checked: false, type: "fight" },
              { checked: false, type: "flight" },
              { checked: false, type: "fight" }
            ]
          }
        },
        type: "character"
      } as Actor.Implementation,
      poolEditValues: {},
      responseEditSlots: null
    });

    expect(context.disciplineIsEditMode).toBe(false);
    expect(context.exhaustionIsEditMode).toBe(false);
    expect(context.madnessIsEditMode).toBe(false);
    expect(
      (context.disciplinePips as Array<{ action: string | null }>).every(
        (pip) => pip.action === null
      )
    ).toBe(true);
    expect(
      (context.exhaustionPips as Array<{ action: string | null }>).every(
        (pip) => pip.action === null
      )
    ).toBe(true);
    expect(
      (context.madnessPips as Array<{ action: string | null }>).every(
        (pip) => pip.action === null
      )
    ).toBe(true);
  });

  it("keeps actions visible only for pools that are currently being edited", () => {
    const context = createCharacterSheetContext({
      actor: {
        name: "Ada",
        system: {
          discipline: 3,
          exhaustion: 5,
          madnessPermanent: 2,
          responses: {
            max: 3,
            slots: [
              { checked: false, type: "fight" },
              { checked: false, type: "flight" },
              { checked: false, type: "fight" }
            ]
          }
        },
        type: "character"
      } as Actor.Implementation,
      poolEditValues: {
        discipline: 4,
        exhaustion: 6
      },
      responseEditSlots: null
    });

    expect(context.disciplineIsEditMode).toBe(true);
    expect(context.exhaustionIsEditMode).toBe(true);
    expect(context.madnessIsEditMode).toBe(false);
    expect(
      (context.disciplinePips as Array<{ action: string | null }>).map(
        (pip) => pip.action
      )
    ).toEqual([null, null, null, "decrease", "increase", null]);
    expect(
      (context.exhaustionPips as Array<{ action: string | null }>).map(
        (pip) => pip.action
      )
    ).toEqual([null, null, null, null, null, "decrease"]);
    expect(
      (context.madnessPips as Array<{ action: string | null }>).every(
        (pip) => pip.action === null
      )
    ).toBe(true);
  });
});
