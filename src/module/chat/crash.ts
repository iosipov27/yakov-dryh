import {
  clearResponseChecks,
  DRYH_EXHAUSTION_MAX,
  type YakovDryhCharacterSystemData
} from "../data/index.js";

export type YakovDryhCrashResolutionActionType = "die" | "sleep";

export interface YakovDryhCrashResolutionAction {
  type: YakovDryhCrashResolutionActionType;
}

export interface YakovDryhCrashResolutionAvailability {
  crashResolved: boolean;
  exhaustion: number;
  hasPendingDominantResolution: boolean;
  hasPendingFailureResolution: boolean;
}

export function shouldAutoApplyCrash(exhaustion: number): boolean {
  return exhaustion > DRYH_EXHAUSTION_MAX;
}

export function shouldOfferCrashResolution(
  options: YakovDryhCrashResolutionAvailability
): boolean {
  return (
    !options.crashResolved &&
    shouldAutoApplyCrash(options.exhaustion) &&
    !options.hasPendingDominantResolution &&
    !options.hasPendingFailureResolution
  );
}

export function applyCrashSleepToCharacterData(
  actorData: YakovDryhCharacterSystemData
): YakovDryhCharacterSystemData {
  return {
    ...actorData,
    discipline: 1,
    exhaustion: 0,
    responses: clearResponseChecks(actorData.responses)
  };
}
