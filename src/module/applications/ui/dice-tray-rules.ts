import type { YakovDryhDiceTrayPool } from "./dice-tray-state.js";

export const ADDABLE_DICE_TRAY_POOLS = [
  "exhaustion",
  "madness",
  "pain"
] as const satisfies YakovDryhDiceTrayPool[];
