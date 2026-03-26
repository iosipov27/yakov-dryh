import {
  getCheckedResponseTypes,
  getUncheckedResponseTypes,
  type YakovDryhResponseType,
  type YakovDryhResponsesData
} from "../data/index.js";
import type { YakovDryhDominantPool } from "../dice/index.js";

export interface YakovDryhDominantResolutionAction {
  responseType: YakovDryhResponseType | null;
  type: "check-response" | "remove-exhaustion" | "uncheck-response";
}

export function getDominantResolutionActions(
  dominant: YakovDryhDominantPool,
  responses: YakovDryhResponsesData,
  exhaustion: number
): YakovDryhDominantResolutionAction[] {
  switch (dominant) {
    case "discipline":
      return [
        ...(exhaustion > 0
          ? [
              {
                responseType: null,
                type: "remove-exhaustion" as const
              }
            ]
          : []),
        ...getCheckedResponseTypes(responses).map((responseType) => ({
          responseType,
          type: "uncheck-response" as const
        }))
      ];

    case "madness":
      return getUncheckedResponseTypes(responses).map((responseType) => ({
        responseType,
        type: "check-response" as const
      }));

    default:
      return [];
  }
}
