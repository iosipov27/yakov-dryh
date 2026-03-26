import {
  clearResponseChecks,
  getUncheckedResponseTypes,
  type YakovDryhCharacterSystemData,
  type YakovDryhResponsesData
} from "../data/index.js";
import type { YakovDryhDominantPool } from "../dice/index.js";
import type { YakovDryhFailureConsequence } from "./failure-consequence.js";

export interface YakovDryhSnapTrigger {
  dominant: YakovDryhDominantPool;
  failureConsequence: YakovDryhFailureConsequence;
  responses: YakovDryhResponsesData;
}

export function hasNoUncheckedResponses(
  responses: YakovDryhResponsesData
): boolean {
  return getUncheckedResponseTypes(responses).length === 0;
}

export function shouldAutoApplySnap(
  trigger: YakovDryhSnapTrigger
): boolean {
  if (!hasNoUncheckedResponses(trigger.responses)) {
    return false;
  }

  return (
    trigger.dominant === "madness" ||
    trigger.failureConsequence === "mark-response"
  );
}

export function applySnapToCharacterData(
  actorData: YakovDryhCharacterSystemData
): YakovDryhCharacterSystemData {
  return {
    ...actorData,
    discipline: Math.max(actorData.discipline - 1, 0),
    madnessPermanent: actorData.madnessPermanent + 1,
    responses: clearResponseChecks(actorData.responses)
  };
}
