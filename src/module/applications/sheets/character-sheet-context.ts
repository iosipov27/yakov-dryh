import {
  DRYH_RESPONSE_MAX,
  normalizeCharacterSystemData,
  YAKOV_DRYH_ACTOR_TYPES,
  type YakovDryhResponseSlotData
} from "../../data/index.js";
import { SYSTEM_ID } from "../../constants.js";
import { formatLineList } from "../../utils/index.js";
import {
  formatLocalization,
  localize,
  localizeActorType
} from "./character-sheet-localization.js";
import {
  createEditablePips,
  createStressCardStyle,
  getEditablePoolTotal
} from "./character-sheet-pool-helpers.js";
import type { EditableSheetPoolDrafts } from "./character-sheet-types.js";
import {
  createResponseAllocationRows,
  createResponseEditorData,
  createResponsePlayRows
} from "./character-sheet-response-helpers.js";

export function createCharacterSheetContext(input: {
  actor: Actor.Implementation | null | undefined;
  poolEditValues: EditableSheetPoolDrafts;
  responseEditSlots: YakovDryhResponseSlotData[] | null;
}): Record<string, unknown> {
  const { actor, poolEditValues, responseEditSlots } = input;
  const actorData = normalizeCharacterSystemData(actor?.system);
  const actorType = actor?.type ?? YAKOV_DRYH_ACTOR_TYPES.character;
  const disciplineLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Discipline",
    "Discipline"
  );
  const exhaustionLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Exhaustion",
    "Exhaustion"
  );
  const madnessLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.PermanentMadness",
    "Madness"
  );
  const responsesLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Responses",
    "Responses"
  );
  const fightLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Fight",
    "Fight"
  );
  const flightLabel = localize(
    "YAKOV_DRYH.SHEETS.Actor.Character.Fields.Flight",
    "Flight"
  );
  const liveResponses = actorData.responses;
  const responseEditorData = createResponseEditorData(responseEditSlots, liveResponses);
  const configuredResponseCount = responseEditorData.slots.filter((slot) => slot.type !== "").length;
  const isEditingResponses = responseEditSlots !== null;
  const isPlayMode = !isEditingResponses && configuredResponseCount === DRYH_RESPONSE_MAX;
  const responseRemaining = Math.max(DRYH_RESPONSE_MAX - configuredResponseCount, 0);
  const disciplineIsEditMode = poolEditValues.discipline !== undefined;
  const disciplineValue = poolEditValues.discipline ?? actorData.discipline;
  const exhaustionIsEditMode = poolEditValues.exhaustion !== undefined;
  const exhaustionValue = poolEditValues.exhaustion ?? actorData.exhaustion;
  const madnessIsEditMode = poolEditValues.madnessPermanent !== undefined;
  const madnessValue = poolEditValues.madnessPermanent ?? actorData.madnessPermanent;

  return {
    actorData,
    actorName: actor?.name ?? "",
    actorType,
    actorTypeLabel: localizeActorType(actorType),
    disciplinePips: createEditablePips(
      "discipline",
      disciplineValue,
      getEditablePoolTotal(disciplineValue),
      disciplineLabel,
      disciplineIsEditMode
    ),
    disciplineIsEditMode,
    disciplinePipTotal: getEditablePoolTotal(disciplineValue),
    exhaustionPips: createEditablePips(
      "exhaustion",
      exhaustionValue,
      getEditablePoolTotal(exhaustionValue),
      exhaustionLabel,
      exhaustionIsEditMode
    ),
    exhaustionCardStyle: createStressCardStyle(exhaustionValue),
    exhaustionIsEditMode,
    exhaustionPipTotal: getEditablePoolTotal(exhaustionValue),
    madnessPips: createEditablePips(
      "madnessPermanent",
      madnessValue,
      getEditablePoolTotal(madnessValue),
      madnessLabel,
      madnessIsEditMode
    ),
    madnessCardStyle: createStressCardStyle(madnessValue),
    madnessIsEditMode,
    madnessPipTotal: getEditablePoolTotal(madnessValue),
    moduleId: SYSTEM_ID,
    responseAllocationRows: createResponseAllocationRows(responseEditorData, {
      fightLabel,
      flightLabel
    }),
    responseCanAddMore: configuredResponseCount < DRYH_RESPONSE_MAX,
    responseCanSave: isEditingResponses && configuredResponseCount === DRYH_RESPONSE_MAX,
    responseIsAllocationMode: !isEditingResponses && configuredResponseCount < DRYH_RESPONSE_MAX,
    responseIsEditMode: isEditingResponses,
    responseIsPlayMode: isPlayMode,
    responseMax: DRYH_RESPONSE_MAX,
    responsePlayRows: createResponsePlayRows(liveResponses, {
      fightLabel,
      flightLabel,
      responsesLabel
    }),
    responseRemainingLabel: formatLocalization(
      "YAKOV_DRYH.SHEETS.Actor.Character.Fields.ResponsesRemaining",
      { remaining: responseRemaining },
      `Remaining: ${responseRemaining}`
    ),
    scarsText: formatLineList(actorData.scars)
  };
}
