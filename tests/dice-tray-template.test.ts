import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const templateSource = readFileSync("templates/ui/dice-tray.hbs", "utf8");

const localizations: Record<string, string> = {
  "YAKOV_DRYH.RESOURCES.Despair": "Despair",
  "YAKOV_DRYH.RESOURCES.Eyebrow": "Shared Pools",
  "YAKOV_DRYH.RESOURCES.EndScene": "End Scene",
  "YAKOV_DRYH.RESOURCES.Hope": "Hope",
  "YAKOV_DRYH.RESOURCES.NextScene": "next scene",
  "YAKOV_DRYH.RESOURCES.ReadOnly": "Only the GM can change shared pools.",
  "YAKOV_DRYH.RESOURCES.Title": "Hope / Despair",
  "YAKOV_DRYH.TRAY.EmptyState": "Load a character to build a pool."
};

function renderTemplate(context: Record<string, unknown>): string {
  const template = Handlebars.compile(templateSource);

  return template(context, {
    helpers: {
      localize: (key: string) => localizations[key] ?? key
    }
  });
}

describe("dice tray template", () => {
  it("disables shared-pool adjusters for non-gm users", () => {
    const html = renderTemplate({
      actorName: "",
      canEdit: false,
      canRoll: false,
      despair: 3,
      hasActor: false,
      hasPendingHope: true,
      hope: 2,
      pendingHope: 1,
      paletteButtons: [],
      poolSummaries: [],
      showReadOnly: true,
      statusLabel: "",
      trayTitle: "No active character"
    });

    expect(
      html.match(/<button[\s\S]*?data-yakov-dryh-resource-pool="(?:hope|despair)"[\s\S]*?disabled[\s\S]*?>/g)
    ).toHaveLength(4);
    expect(html).toContain("Only the GM can change shared pools.");
  });
});
