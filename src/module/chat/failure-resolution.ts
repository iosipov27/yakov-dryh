import {
  getUncheckedResponseTypes,
  type YakovDryhResponseType,
  type YakovDryhResponsesData
} from "../data/index.js";
import type { YakovDryhFailureConsequence } from "./failure-consequence.js";

export interface YakovDryhFailureResolutionAction {
  responseType: YakovDryhResponseType | null;
  type: "check-response" | "gain-exhaustion" | "snap";
}

export function getFailureResolutionActions(
  consequence: YakovDryhFailureConsequence,
  responses: YakovDryhResponsesData
): YakovDryhFailureResolutionAction[] {
  const responseActions = getUncheckedResponseTypes(responses).map((responseType) => ({
    responseType,
    type: "check-response" as const
  }));
  const snapAction: YakovDryhFailureResolutionAction = {
    responseType: null,
    type: "snap"
  };

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
        ...(responseActions.length > 0 ? responseActions : [snapAction])
      ];

    case "mark-response":
      return responseActions.length > 0 ? responseActions : [snapAction];

    default:
      return [];
  }
}
