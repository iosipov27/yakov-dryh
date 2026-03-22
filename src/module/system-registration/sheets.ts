import { YakovDryhCharacterSheet } from "../applications/index.js";
import { SYSTEM_ID } from "../constants.js";
import { YAKOV_DRYH_ACTOR_TYPES } from "../data/index.js";

export function registerApplicationSheets(): void {
  const { Actors } = foundry.documents.collections;

  Actors.registerSheet(SYSTEM_ID, YakovDryhCharacterSheet as any, {
    types: [YAKOV_DRYH_ACTOR_TYPES.character],
    makeDefault: true,
    label:
      game.i18n?.localize("YAKOV_DRYH.SHEETS.Actor.Character.Label") ??
      "Yakov Dryh Character Sheet"
  });
}
