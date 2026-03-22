import {
  getUncheckedResponseTypes,
  type YakovDryhResponseType,
  type YakovDryhResponsesData
} from "../data/index.js";
import type { YakovDryhFailureConsequence } from "./failure-consequence.js";

export interface YakovDryhFailureResolutionAction {
  responseType: YakovDryhResponseType | null;
  type: "check-response" | "gain-exhaustion";
}

export function getFailureResolutionActions(
  consequence: YakovDryhFailureConsequence,
  responses: YakovDryhResponsesData
): YakovDryhFailureResolutionAction[] {
  const responseActions = getUncheckedResponseTypes(responses).map((responseType) => ({
    responseType,
    type: "check-response" as const
  }));

  switch (consequence) {
    case "gain-exhaustion":
      return [
        {
          responseType: null,
          type: "gain-exhaustion"
        }
      ];

    case "gm-choice":
      return [
        {
          responseType: null,
          type: "gain-exhaustion"
        },
        ...responseActions
      ];

    case "mark-response":
      return responseActions;

    default:
      return [];
  }
}
