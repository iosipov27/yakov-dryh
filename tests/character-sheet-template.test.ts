import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const templateSource = readFileSync(
  "templates/sheets/parts/character-sheet-story-column.hbs",
  "utf8"
);

const localizations: Record<string, string> = {
  "YAKOV_DRYH.SHEETS.Actor.Character.Actions.ChangeAvatar": "Change avatar",
  "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Concept": "Concept",
  "YAKOV_DRYH.SHEETS.Actor.Character.Fields.ExhaustionTalent":
    "Exhaustion Talent",
  "YAKOV_DRYH.SHEETS.Actor.Character.Fields.MadnessTalent": "Madness Talent",
  "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Name": "Name",
  "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Scars": "Scars"
};

function renderTemplate(context: Record<string, unknown>): string {
  const template = Handlebars.compile(templateSource);

  return template(context, {
    helpers: {
      localize: (key: string) => localizations[key] ?? key
    }
  });
}

describe("character sheet story column template", () => {
  it("keeps the avatar trigger out of form submit data", () => {
    const html = renderTemplate({
      actorData: {
        concept: "Sleepless detective",
        talents: {
          exhaustion: "",
          madness: ""
        }
      },
      actorImg: "icons/svg/mystery-man.svg",
      actorName: "Soeniel",
      scarsText: ""
    });

    expect(html).toContain('data-yakov-dryh-action="avatar-change"');
    expect(html).not.toContain('data-edit="img"');
    expect(html).not.toContain('data-action="editImage"');
    expect(html).not.toContain("yakov-dryh-avatar-overlay");
  });
});
