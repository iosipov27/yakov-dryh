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
  "YAKOV_DRYH.RESOURCES.Title": "Hope / Despair",
  "YAKOV_DRYH.TRAY.EmptyState": "Load a character to build a pool.",
  "YAKOV_DRYH.TRAY.Roll": "Roll"
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
      poolSummaries: [],
      statusLabel: "",
      trayTitle: "No active character"
    });

    expect(
      html.match(/<button[\s\S]*?data-yakov-dryh-resource-pool="(?:hope|despair)"[\s\S]*?disabled[\s\S]*?>/g)
    ).toHaveLength(4);
    expect(html).not.toContain("YAKOV_DRYH.RESOURCES.ReadOnly");
  });

  it("renders always-visible header adjusters and no add-die palette", () => {
    const html = renderTemplate({
      actorName: "Samewere",
      canEdit: true,
      canRoll: true,
      despair: 1,
      hasActor: true,
      hasPendingHope: false,
      hope: 2,
      pendingHope: 0,
      poolSummaries: [
        {
          controls: {
            canDecrease: false,
            canIncrease: false,
            decreaseLabel: "Remove 1 die (Discipline)",
            increaseLabel: "Add 1 die (Discipline)"
          },
          empty: false,
          key: "discipline",
          label: "Discipline",
          pips: [{ filled: true, hidden: false, removable: false, tooltip: null }],
          showControls: false,
          trackClass: null
        },
        {
          controls: {
            canDecrease: true,
            canIncrease: true,
            decreaseLabel: "Remove 1 die (Pain)",
            increaseLabel: "Add 1 die (Pain)"
          },
          empty: false,
          key: "pain",
          label: "Pain",
          pips: [{ filled: true, hidden: false, removable: false, tooltip: null }],
          showControls: true,
          trackClass: "yakov-dryh-pip-track--pain"
        }
      ],
      statusLabel: "",
      trayTitle: "Samewere"
    });

    expect(html).not.toContain("yakov-dryh-dice-tray__palette");
    expect(html).not.toContain('data-yakov-dryh-tray-pool="discipline"');
    expect(html.match(/data-yakov-dryh-tray-pool="pain"/g)).toHaveLength(2);
    expect(html).toContain('data-yakov-dryh-tray-delta="-1"');
    expect(html).toContain('data-yakov-dryh-tray-delta="1"');
    expect(html).toContain("Roll");
  });
});
