import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";

export type YakovDryhSharedPool = "hope" | "despair";

export interface YakovDryhSharedPools {
  despair: number;
  hope: number;
}

export function getSharedHopeTotal(): number {
  const hope = game.settings?.get(SYSTEM_ID, DRYH_SETTINGS.sharedHope);

  return normalizeSharedPoolTotal(hope);
}

export function getSharedDespairTotal(): number {
  const despair = game.settings?.get(SYSTEM_ID, DRYH_SETTINGS.gmDespair);

  return normalizeSharedPoolTotal(despair);
}

export function getSharedPools(): YakovDryhSharedPools {
  return {
    despair: getSharedDespairTotal(),
    hope: getSharedHopeTotal()
  };
}

export async function adjustSharedPool(
  pool: YakovDryhSharedPool,
  delta: number
): Promise<number> {
  const normalizedDelta = Math.trunc(delta);
  const currentValue =
    pool === "hope" ? getSharedHopeTotal() : getSharedDespairTotal();
  const nextValue = Math.max(currentValue + normalizedDelta, 0);

  await setSharedPoolTotal(pool, nextValue);

  return nextValue;
}

export async function addDespair(value: number): Promise<number> {
  return adjustSharedPool("despair", value);
}

export async function addHope(value: number): Promise<number> {
  return adjustSharedPool("hope", value);
}

export async function spendHope(): Promise<number | null> {
  const currentHope = getSharedHopeTotal();

  if (currentHope < 1) {
    return null;
  }

  const nextHope = currentHope - 1;

  await setSharedPoolTotal("hope", nextHope);

  return nextHope;
}

export async function spendDespair(): Promise<number | null> {
  const currentDespair = getSharedDespairTotal();

  if (currentDespair < 1) {
    return null;
  }

  const nextDespair = currentDespair - 1;

  await setSharedPoolTotal("despair", nextDespair);

  return nextDespair;
}

function normalizeSharedPoolTotal(value: unknown): number {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(Math.trunc(numericValue), 0);
}

async function setSharedPoolTotal(
  pool: YakovDryhSharedPool,
  value: number
): Promise<void> {
  const settingKey =
    pool === "hope" ? DRYH_SETTINGS.sharedHope : DRYH_SETTINGS.gmDespair;

  await game.settings?.set(SYSTEM_ID, settingKey, Math.max(Math.trunc(value), 0));
}
