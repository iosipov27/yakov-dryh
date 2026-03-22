import type { YakovDryhRollResult } from "../dice/index.js";

export type YakovDryhFailureConsequence =
  | "gain-exhaustion"
  | "gm-choice"
  | "mark-response"
  | null;

export function getFailureConsequence(
  rollResult: YakovDryhRollResult
): YakovDryhFailureConsequence {
  if (rollResult.outcome !== "failure") {
    return null;
  }

  switch (rollResult.dominant) {
    case "exhaustion":
      return "mark-response";

    case "madness":
      return "gain-exhaustion";

    default:
      return "gm-choice";
  }
}
