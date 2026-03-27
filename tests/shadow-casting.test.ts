import { describe, expect, it } from "vitest";

import {
  applyGmActionToRollResult,
  createRollResult
} from "../src/module/dice/index.ts";
import {
  appendEffectText,
  createDefaultShadowCastingData,
  createHopeEffectText,
  createPainDominantEffectText,
  shouldAwardPainDominantDespair,
  updateShadowCastingData
} from "../src/module/chat/shadow-casting.ts";

describe("DRYH shadow-casting", () => {
  it("tracks when shadow-casting makes Pain dominant", () => {
    const initialResult = createRollResult({
      discipline: [6, 4],
      exhaustion: [2],
      madness: [5],
      pain: [6, 3]
    });
    const modifiedResult = applyGmActionToRollResult(initialResult, {
      type: "add6",
      targetPool: "pain"
    });

    expect(
      updateShadowCastingData(
        createDefaultShadowCastingData(),
        initialResult,
        modifiedResult
      )
    ).toEqual({
      deferredHope: 1,
      madePainDominant: true
    });
  });

  it("does not mark Pain as newly dominant when it already dominated before shadow-casting", () => {
    const initialResult = createRollResult({
      discipline: [6, 4],
      exhaustion: [2],
      madness: [5],
      pain: [6, 5]
    });
    const modifiedResult = applyGmActionToRollResult(initialResult, {
      type: "add6",
      targetPool: "pain"
    });

    expect(
      updateShadowCastingData(
        createDefaultShadowCastingData(),
        initialResult,
        modifiedResult
      )
    ).toEqual({
      deferredHope: 1,
      madePainDominant: false
    });
  });

  it("suppresses the Despair gain when shadow-casting made Pain dominant", () => {
    expect(
      shouldAwardPainDominantDespair({
        deferredHope: 1,
        madePainDominant: true
      })
    ).toBe(false);
    expect(
      createPainDominantEffectText({
        despairTotalText: "Total Despair:",
        gainsDespairText: "GM gains +1 Despair.",
        nextDespairTotal: 3,
        noDespairFromShadowCastingText:
          "GM does not gain +1 Despair because Pain was made dominant by shadow-casting.",
        shadowCastingMadePainDominant: true
      })
    ).toBe(
      "GM does not gain +1 Despair because Pain was made dominant by shadow-casting."
    );
  });

  it("keeps the normal Pain effect text when Pain dominance was not created by shadow-casting", () => {
    expect(
      shouldAwardPainDominantDespair({
        deferredHope: 1,
        madePainDominant: false
      })
    ).toBe(true);
    expect(
      createPainDominantEffectText({
        despairTotalText: "Total Despair:",
        gainsDespairText: "GM gains +1 Despair.",
        nextDespairTotal: 3,
        noDespairFromShadowCastingText:
          "GM does not gain +1 Despair because Pain was made dominant by shadow-casting.",
        shadowCastingMadePainDominant: false
      })
    ).toBe("GM gains +1 Despair. Total Despair: 3");
  });

  it("describes Hope gains on the final card when shadow-casting generated Hope", () => {
    expect(
      createHopeEffectText({
        availabilityNoteText: "This Hope token can only be used starting next scene.",
        gainedHope: 1,
        gainsHopeText: "Players gain +{amount} Hope.",
        pendingHopeText: "Pending Hope:",
        pendingHopeTotal: 1
      })
    ).toBe("Players gain +1 Hope. Pending Hope: 1 This Hope token can only be used starting next scene.");
  });

  it("appends Hope gain text to another effect when both apply", () => {
    expect(
      appendEffectText(
        "GM gains +1 Despair. Total Despair: 3",
        "Players gain +1 Hope. Pending Hope: 1 This Hope token can only be used starting next scene."
      )
    ).toBe("GM gains +1 Despair. Total Despair: 3 Players gain +1 Hope. Pending Hope: 1 This Hope token can only be used starting next scene.");
  });
});
