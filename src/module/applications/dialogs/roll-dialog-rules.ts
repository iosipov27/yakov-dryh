import { DRYH_EXHAUSTION_MAX } from "../../data/index.js";

export function canAddPreRollExhaustion(exhaustion: number): boolean {
  return exhaustion < DRYH_EXHAUSTION_MAX;
}
