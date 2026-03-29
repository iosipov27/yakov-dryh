import type { YakovDryhResponseType } from "../../data/index.js";

export interface SheetPip {
  filled: boolean;
}

export type EditableSheetPoolField = "discipline" | "exhaustion" | "madnessPermanent";
export type EditableSheetPoolDrafts = Partial<Record<EditableSheetPoolField, number>>;

export interface EditableSheetPoolControls {
  canDecrease: boolean;
  canIncrease: boolean;
  decreaseLabel: string;
  increaseLabel: string;
}

export interface SheetResponseAllocationIndicator {
  label: string;
}

export interface SheetResponseAllocationRow {
  addLabel: string;
  checkboxes: SheetResponseAllocationIndicator[];
  label: string;
  type: YakovDryhResponseType;
}

export interface SheetResponsePlayCheckbox {
  checked: boolean;
  index: number;
  label: string;
}

export interface SheetResponsePlayRow {
  checkboxes: SheetResponsePlayCheckbox[];
  label: string;
  type: YakovDryhResponseType;
}
