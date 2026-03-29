import { localize } from "./character-sheet-localization.js";
import type {
  EditableSheetPoolControls,
  SheetPip
} from "./character-sheet-types.js";

const SHEET_DICE_POOL_BASE_TOTAL = 6;
const STRESS_CARD_VISUAL_MAX = 6;

export function createDisplayPips(
  value: number,
  total: number
): SheetPip[] {
  return Array.from({ length: Math.max(total, 0) }, (_entry, index) => ({
    filled: index < value
  }));
}

export function createEditablePoolControls(
  value: number,
  label: string,
  isEditMode: boolean
): EditableSheetPoolControls {
  const maxValue = getEditablePoolTotal(value);

  return {
    canDecrease: isEditMode && value > 0,
    canIncrease: isEditMode && value < maxValue,
    decreaseLabel: `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`,
    increaseLabel: `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
  };
}

export function getEditablePoolTotal(value: number): number {
  return Math.max(value, SHEET_DICE_POOL_BASE_TOTAL);
}

export function createStressCardStyle(value: number): string {
  const clampedValue = Math.min(Math.max(value, 0), STRESS_CARD_VISUAL_MAX);
  const intensity = clampedValue / STRESS_CARD_VISUAL_MAX;
  const dangerStop = `${(intensity * 100).toFixed(2)}%`;
  const safeStop = `${(100 - intensity * 100).toFixed(2)}%`;
  const sheen = (0.86 - intensity * 0.16).toFixed(3);

  return [
    `--yd-stress-intensity: ${intensity.toFixed(3)}`,
    `--yd-stress-sheen: ${sheen}`,
    `--yd-stress-safe-stop: ${safeStop}`,
    `--yd-stress-danger-stop: ${dangerStop}`
  ].join("; ");
}
