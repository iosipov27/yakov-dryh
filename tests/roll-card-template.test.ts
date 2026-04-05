import Handlebars from "handlebars";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const templateSource = readFileSync("templates/chat/roll-card.hbs", "utf8");

function renderRollCardTemplate(context: Record<string, unknown>): string {
  const template = Handlebars.compile(templateSource);

  return template(context, {
    helpers: {
      localize: (key: string) => key
    }
  });
}

describe("DRYH roll-card template", () => {
  it("renders the outcome summary without a duplicated Successes label", () => {
    const html = renderRollCardTemplate({
      actorName: "Test Actor",
      canAffordAdjustment: false,
      canFinalize: false,
      canRollPain: false,
      crashEffectText: null,
      crashLabel: "Crash",
      crashResolutionButtons: [],
      crashResolutionPrompt: null,
      dominantEffectText: null,
      dominantLabel: "Discipline",
      dominantResolutionButtons: [],
      dominantResolutionPrompt: null,
      failureEffectText: null,
      failureResolutionButtons: [],
      failureResolutionPrompt: null,
      finalMessageId: null,
      hasCrashResolutionButtons: false,
      hasDominantResolutionButtons: false,
      hasEffectText: false,
      hasFailureResolutionButtons: false,
      hasPendingCrash: false,
      hasPlayerActionButtons: false,
      isFinal: false,
      isInitial: true,
      isResolved: false,
      outcomeLabel: "Success",
      playerActionButtons: [],
      playerActionPrompt: null,
      poolSummaries: [],
      rollResult: {
        outcome: "success",
        successes: {
          pain: 0,
          player: 2
        }
      },
      showAdjustments: false,
      showDominant: false,
      showOutcome: true,
      showPainRollWaiting: false,
      snapEffectText: null,
      stageLabel: "Roll Result",
      waitingForPainLabel: "Waiting"
    });

    expect(html).toContain("2");
    expect(html).toContain("vs");
    expect(html).toContain("0");
    expect(html).toContain("Success");
    expect(html).not.toContain("Successes:");
  });
});
