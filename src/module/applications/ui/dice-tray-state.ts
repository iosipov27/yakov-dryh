import { DRYH_SETTINGS, SYSTEM_ID } from "../../constants.js";
import {
  DRYH_TEMP_MADNESS_MAX,
  normalizeCharacterSystemData
} from "../../data/index.js";
import { canAddPreRollExhaustion } from "../dialogs/roll-dialog-rules.js";

export type YakovDryhDiceTrayPool =
  | "discipline"
  | "exhaustion"
  | "madness"
  | "pain";

export interface YakovDryhDiceTrayPools {
  discipline: number;
  exhaustion: number;
  madness: number;
  pain: number;
}

export interface YakovDryhDiceTrayState {
  actorId: string | null;
  actorName: string;
  actorUuid: string | null;
  basePools: YakovDryhDiceTrayPools;
  confirmed: boolean;
  pools: YakovDryhDiceTrayPools;
}

const EMPTY_POOLS: YakovDryhDiceTrayPools = {
  discipline: 0,
  exhaustion: 0,
  madness: 0,
  pain: 0
};

export function createDefaultDiceTrayState(): YakovDryhDiceTrayState {
  return {
    actorId: null,
    actorName: "",
    actorUuid: null,
    basePools: { ...EMPTY_POOLS },
    confirmed: false,
    pools: { ...EMPTY_POOLS }
  };
}

export function createDiceTrayStateForActor(
  actor: Actor.Implementation
): YakovDryhDiceTrayState {
  const actorData = normalizeCharacterSystemData(actor.system);

  return normalizeDiceTrayState({
    actorId: actor.id ?? null,
    actorName: actor.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor",
    actorUuid: actor.uuid,
    basePools: {
      discipline: actorData.discipline,
      exhaustion: actorData.exhaustion,
      madness: actorData.madnessPermanent,
      pain: 0
    },
    confirmed: false,
    pools: {
      discipline: actorData.discipline,
      exhaustion: actorData.exhaustion,
      madness: actorData.madnessPermanent,
      pain: 0
    }
  });
}

export function normalizeDiceTrayState(state: unknown): YakovDryhDiceTrayState {
  const fallback = createDefaultDiceTrayState();
  const rawState = asRecord(parseStateValue(state));
  const actorId = normalizeNullableString(rawState?.actorId);
  const actorName = normalizeString(rawState?.actorName);
  const actorUuid = normalizeNullableString(rawState?.actorUuid);
  const normalizedBasePools = normalizePools(rawState?.basePools);
  const confirmed = rawState?.confirmed === true;

  if (!actorId || !actorUuid || !actorName) {
    return fallback;
  }

  const basePools: YakovDryhDiceTrayPools = {
    discipline: normalizedBasePools.discipline,
    exhaustion: normalizedBasePools.exhaustion,
    madness: normalizedBasePools.madness,
    pain: 0
  };
  const rawPools = normalizePools(rawState?.pools);
  const maxPools = getDiceTrayMaxPools({
    actorId,
    basePools
  });
  const minPools = getDiceTrayMinPools({
    actorId,
    actorName,
    actorUuid,
    basePools,
    confirmed,
    pools: { ...basePools }
  });

  return {
    actorId,
    actorName,
    actorUuid,
    basePools,
    confirmed,
    pools: {
      discipline: clampInteger(rawPools.discipline, minPools.discipline, maxPools.discipline),
      exhaustion: clampInteger(rawPools.exhaustion, minPools.exhaustion, maxPools.exhaustion),
      madness: clampInteger(rawPools.madness, minPools.madness, maxPools.madness),
      pain: Math.max(rawPools.pain, 0)
    }
  };
}

export function getDiceTrayState(): YakovDryhDiceTrayState {
  const state = game.settings?.get(SYSTEM_ID, DRYH_SETTINGS.diceTrayState);

  return normalizeDiceTrayState(state);
}

export async function setDiceTrayState(
  state: YakovDryhDiceTrayState
): Promise<YakovDryhDiceTrayState> {
  const normalizedState = normalizeDiceTrayState(state);

  await game.settings?.set(
    SYSTEM_ID,
    DRYH_SETTINGS.diceTrayState,
    JSON.stringify(normalizedState)
  );

  return normalizedState;
}

export async function resetDiceTrayState(): Promise<YakovDryhDiceTrayState> {
  return setDiceTrayState(createDefaultDiceTrayState());
}

export async function loadActorIntoDiceTray(
  actor: Actor.Implementation
): Promise<YakovDryhDiceTrayState> {
  return setDiceTrayState(createDiceTrayStateForActor(actor));
}

export async function setDiceTrayConfirmed(
  confirmed: boolean
): Promise<YakovDryhDiceTrayState | null> {
  const state = getDiceTrayState();

  if (!state.actorId) {
    return null;
  }

  return setDiceTrayState({
    ...state,
    confirmed
  });
}

export async function adjustDiceTrayPool(
  pool: YakovDryhDiceTrayPool,
  delta: number
): Promise<YakovDryhDiceTrayState | null> {
  const state = getDiceTrayState();

  if (!canAdjustDiceTrayPool(state, pool, delta)) {
    return null;
  }

  return setDiceTrayState({
    ...state,
    pools: {
      ...state.pools,
      [pool]: state.pools[pool] + Math.trunc(delta)
    }
  });
}

export function canAdjustDiceTrayPool(
  state: YakovDryhDiceTrayState,
  pool: YakovDryhDiceTrayPool,
  delta: number
): boolean {
  if (!state.actorId || state.confirmed) {
    return false;
  }

  const normalizedDelta = Math.trunc(delta);

  if (normalizedDelta === 0) {
    return false;
  }

  if (normalizedDelta > 0) {
    return canIncreaseDiceTrayPool(state, pool);
  }

  return canDecreaseDiceTrayPool(state, pool);
}

export function canIncreaseDiceTrayPool(
  state: YakovDryhDiceTrayState,
  pool: YakovDryhDiceTrayPool
): boolean {
  if (!state.actorId || state.confirmed) {
    return false;
  }

  return state.pools[pool] < getDiceTrayMaxPools(state)[pool];
}

export function canDecreaseDiceTrayPool(
  state: YakovDryhDiceTrayState,
  pool: YakovDryhDiceTrayPool
): boolean {
  if (!state.actorId || state.confirmed) {
    return false;
  }

  return state.pools[pool] > getDiceTrayMinPools(state)[pool];
}

export function getDiceTrayMinPools(
  state: YakovDryhDiceTrayState
): YakovDryhDiceTrayPools {
  if (!state.actorId) {
    return { ...EMPTY_POOLS };
  }

  return {
    discipline: state.basePools.discipline,
    exhaustion: state.basePools.exhaustion,
    madness: state.basePools.madness,
    pain: 0
  };
}

export function getDiceTrayMaxPools(
  state: Pick<YakovDryhDiceTrayState, "actorId" | "basePools">
): YakovDryhDiceTrayPools {
  if (!state.actorId) {
    return { ...EMPTY_POOLS };
  }

  const exhaustionBonus = canAddPreRollExhaustion(state.basePools.exhaustion) ? 1 : 0;

  return {
    discipline: state.basePools.discipline,
    exhaustion: state.basePools.exhaustion + exhaustionBonus,
    madness: state.basePools.madness + DRYH_TEMP_MADNESS_MAX,
    pain: Number.MAX_SAFE_INTEGER
  };
}

export function hasLoadedDiceTrayActor(state: YakovDryhDiceTrayState): boolean {
  return Boolean(state.actorId);
}

function normalizePools(value: unknown): YakovDryhDiceTrayPools {
  const record = asRecord(value);

  return {
    discipline: Math.max(normalizeInteger(record?.discipline), 0),
    exhaustion: Math.max(normalizeInteger(record?.exhaustion), 0),
    madness: Math.max(normalizeInteger(record?.madness), 0),
    pain: Math.max(normalizeInteger(record?.pain), 0)
  };
}

function parseStateValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeInteger(value: unknown): number {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.trunc(numericValue);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value: unknown): string | null {
  const normalizedValue = normalizeString(value);
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.trunc(value), min), max);
}
