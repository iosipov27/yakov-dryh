import { DRYH_SETTINGS, SYSTEM_ID } from "../constants.js";
export function getSharedHopeTotal() {
    const hope = game.settings?.get(SYSTEM_ID, DRYH_SETTINGS.sharedHope);
    return normalizeSharedPoolTotal(hope);
}
export function getSharedDespairTotal() {
    const despair = game.settings?.get(SYSTEM_ID, DRYH_SETTINGS.gmDespair);
    return normalizeSharedPoolTotal(despair);
}
export function getSharedPools() {
    return {
        despair: getSharedDespairTotal(),
        hope: getSharedHopeTotal()
    };
}
export async function adjustSharedPool(pool, delta) {
    const normalizedDelta = Math.trunc(delta);
    const currentValue = pool === "hope" ? getSharedHopeTotal() : getSharedDespairTotal();
    const nextValue = Math.max(currentValue + normalizedDelta, 0);
    await setSharedPoolTotal(pool, nextValue);
    return nextValue;
}
export async function addDespair(value) {
    return adjustSharedPool("despair", value);
}
export async function spendHope() {
    const currentHope = getSharedHopeTotal();
    if (currentHope < 1) {
        return null;
    }
    const nextHope = currentHope - 1;
    await setSharedPoolTotal("hope", nextHope);
    return nextHope;
}
export async function spendDespairForHope() {
    const currentDespair = getSharedDespairTotal();
    if (currentDespair < 1) {
        return null;
    }
    const nextDespair = currentDespair - 1;
    const nextHope = getSharedHopeTotal() + 1;
    await setSharedPoolTotal("despair", nextDespair);
    await setSharedPoolTotal("hope", nextHope);
    return {
        despair: nextDespair,
        hope: nextHope
    };
}
function normalizeSharedPoolTotal(value) {
    const numericValue = typeof value === "number" ? value : Number.parseInt(String(value), 10);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }
    return Math.max(Math.trunc(numericValue), 0);
}
async function setSharedPoolTotal(pool, value) {
    const settingKey = pool === "hope" ? DRYH_SETTINGS.sharedHope : DRYH_SETTINGS.gmDespair;
    await game.settings?.set(SYSTEM_ID, settingKey, Math.max(Math.trunc(value), 0));
}
//# sourceMappingURL=shared-pools.js.map