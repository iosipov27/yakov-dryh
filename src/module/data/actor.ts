export const YAKOV_DRYH_ACTOR_TYPES = {
  character: "character"
} as const;

export type YakovDryhActorType =
  (typeof YAKOV_DRYH_ACTOR_TYPES)[keyof typeof YAKOV_DRYH_ACTOR_TYPES];

export interface YakovDryhCharacterSystemData extends Record<string, unknown> {
  biography: string;
  notes: string;
}

export function createDefaultCharacterSystemData(): YakovDryhCharacterSystemData {
  return {
    biography: "",
    notes: ""
  };
}
