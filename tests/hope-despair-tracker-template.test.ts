import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const templateSource = readFileSync("templates/ui/hope-despair-tracker.hbs", "utf8");

const localizations: Record<string, string> = {
  "YAKOV_DRYH.RESOURCES.Despair": "Despair",
  "YAKOV_DRYH.RESOURCES.Eyebrow": "Shared Pools",
  "YAKOV_DRYH.RESOURCES.EndScene": "End Scene",
  "YAKOV_DRYH.RESOURCES.Hope": "Hope",
  "YAKOV_DRYH.RESOURCES.NextScene": "next scene",
  "YAKOV_DRYH.RESOURCES.ReadOnly": "Only the GM can change shared pools.",
  "YAKOV_DRYH.RESOURCES.Title": "Hope / Despair"
};

function renderTemplate(context: Record<string, unknown>): string {
  const template = Handlebars.compile(templateSource);

  return template(context, {
    helpers: {
      localize: (key: string) => localizations[key] ?? key
    }
  });
}

describe("hope despair tracker template", () => {
  it("renders the coin-based pool layout with pending hope note", () => {
    const html = renderTemplate({
      canEdit: true,
      despair: 8,
      hasPendingHope: true,
      hope: 1,
      pendingHope: 2
    });

    expect(html).toContain("yakov-dryh-resource-tracker__coin");
    expect(html).toContain("data-yakov-dryh-resource-pool=\"hope\"");
    expect(html).toContain("data-yakov-dryh-resource-pool=\"despair\"");
    expect(html).toContain("+2 next scene");
    expect(html).toContain("yakov-dryh-resource-tracker__scene-button");
    expect(
      html.match(/<button[\s\S]*?data-yakov-dryh-resource-pool="(?:hope|despair)"[\s\S]*?disabled[\s\S]*?>/g)
    ).toBeNull();
  });

  it("hides hope and despair adjusters for non-gm users", () => {
    const html = renderTemplate({
      canEdit: false,
      despair: 3,
      hasPendingHope: true,
      hope: 2,
      pendingHope: 1
    });

    expect(html).not.toContain('data-yakov-dryh-resource-pool="hope"');
    expect(html).not.toContain('data-yakov-dryh-resource-pool="despair"');
    expect(html).not.toContain("yakov-dryh-resource-tracker__scene-button");
    expect(html).toContain("Only the GM can change shared pools.");
  });
});
