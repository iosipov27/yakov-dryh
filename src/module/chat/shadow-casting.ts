import type { YakovDryhRollResult } from "../dice/index.js";

export interface YakovDryhShadowCastingData {
  deferredHope: number;
  madePainDominant: boolean;
}

export interface YakovDryhPainDominantEffectTextOptions {
  gainsDespairText: string;
  despairTotalText: string;
  nextDespairTotal: number;
  noDespairFromShadowCastingText: string;
  shadowCastingMadePainDominant: boolean;
}

export function createDefaultShadowCastingData(): YakovDryhShadowCastingData {
  return {
    deferredHope: 0,
    madePainDominant: false
  };
}

export function didShadowCastingMakePainDominant(
  previousResult: YakovDryhRollResult,
  nextResult: YakovDryhRollResult
): boolean {
  return previousResult.dominant !== "pain" && nextResult.dominant === "pain";
}

export function updateShadowCastingData(
  current: YakovDryhShadowCastingData,
  previousResult: YakovDryhRollResult,
  nextResult: YakovDryhRollResult
): YakovDryhShadowCastingData {
  return {
    deferredHope: current.deferredHope + 1,
    madePainDominant:
      current.madePainDominant ||
      didShadowCastingMakePainDominant(previousResult, nextResult)
  };
}

export function shouldAwardPainDominantDespair(
  shadowCasting: YakovDryhShadowCastingData
): boolean {
  return !shadowCasting.madePainDominant;
}

export function createPainDominantEffectText(
  options: YakovDryhPainDominantEffectTextOptions
): string {
  if (options.shadowCastingMadePainDominant) {
    return options.noDespairFromShadowCastingText;
  }

  return `${options.gainsDespairText} ${options.despairTotalText} ${options.nextDespairTotal}`;
}
