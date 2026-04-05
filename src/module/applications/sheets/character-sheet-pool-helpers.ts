import { localize } from "./character-sheet-localization.js";
import type {
  EditableSheetPoolControls,
  SheetPip
} from "./character-sheet-types.js";

const SHEET_DICE_POOL_BASE_TOTAL = 6;

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
