import { YakovDryhActor } from "../documents/index.js";

export function registerDocumentClasses(): void {
  CONFIG.Actor.documentClass = YakovDryhActor;
}
