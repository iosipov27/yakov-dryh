import type { YakovDryhSharedPools } from "../../resources/index.js";

export interface YakovDryhHopeDespairTrackerContext {
  canEdit: boolean;
  despair: number;
  hasPendingHope: boolean;
  hope: number;
  pendingHope: number;
}

export function createHopeDespairTrackerContext(input: {
  isGm: boolean;
  sharedPools: YakovDryhSharedPools;
}): YakovDryhHopeDespairTrackerContext {
  const { isGm, sharedPools } = input;

  return {
    canEdit: isGm,
    despair: sharedPools.despair,
    hasPendingHope: sharedPools.pendingHope > 0,
    hope: sharedPools.hope,
    pendingHope: sharedPools.pendingHope
  };
}
