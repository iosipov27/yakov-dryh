import { localize } from "./character-sheet-localization.js";
import type {
  EditableSheetPip,
  EditableSheetPoolField
} from "./character-sheet-types.js";

const SHEET_DICE_POOL_BASE_TOTAL = 6;
const STRESS_CARD_VISUAL_MAX = 6;

export function createEditablePips(
  field: EditableSheetPoolField,
  value: number,
  total: number,
  label: string
): EditableSheetPip[] {
  const normalizedTotal = Math.max(total, 0);

  return Array.from({ length: normalizedTotal }, (_entry, index) => {
    const filled = index < value;
    const canDecrease = value > 0 && index === value - 1;
    const canIncrease = index === value && value < normalizedTotal;

    return {
      action: canDecrease ? "decrease" : canIncrease ? "increase" : null,
      field,
      filled,
      iconClass: canDecrease ? "fa-solid fa-trash-can" : canIncrease ? "fa-solid fa-plus" : null,
      tooltip: canDecrease
        ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
        : canIncrease
          ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
          : null
    };
  });
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
    `--yakov-dryh-stress-intensity: ${intensity.toFixed(3)}`,
    `--yakov-dryh-stress-sheen: ${sheen}`,
    `--yakov-dryh-stress-safe-stop: ${safeStop}`,
    `--yakov-dryh-stress-danger-stop: ${dangerStop}`
  ].join("; ");
}
