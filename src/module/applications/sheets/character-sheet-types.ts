import type { YakovDryhResponseType } from "../../data/index.js";

export interface SheetPip {
  filled: boolean;
}

export type EditableSheetPoolField = "discipline" | "exhaustion" | "madnessPermanent";

export interface EditableSheetPip extends SheetPip {
  action: "decrease" | "increase" | null;
  field: EditableSheetPoolField;
  iconClass: string | null;
  tooltip: string | null;
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
