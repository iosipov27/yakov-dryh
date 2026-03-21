export const DRYH_POOL_PRIORITY = [
    "discipline",
    "madness",
    "exhaustion",
    "pain"
];
function sanitizePoolSize(value) {
    return Math.max(0, Math.trunc(value));
}
function clonePools(pools) {
    return {
        discipline: [...pools.discipline],
        exhaustion: [...pools.exhaustion],
        madness: [...pools.madness],
        pain: [...pools.pain]
    };
}
export function rollD6Pool(poolSize) {
    return Array.from({ length: sanitizePoolSize(poolSize) }, () => Math.ceil(CONFIG.Dice.randomUniform() * 6));
}
export function countSuccesses(dice) {
    return dice.filter((die) => die <= 3).length;
}
export function getSortedDice(dice) {
    return [...dice].sort((left, right) => right - left);
}
function comparePoolDice(left, right) {
    const sortedLeft = getSortedDice(left);
    const sortedRight = getSortedDice(right);
    const compareLength = Math.max(sortedLeft.length, sortedRight.length);
    for (let index = 0; index < compareLength; index += 1) {
        const leftValue = sortedLeft[index] ?? -1;
        const rightValue = sortedRight[index] ?? -1;
        if (leftValue !== rightValue) {
            return leftValue - rightValue;
        }
    }
    return 0;
}
export function getDominantPool(pools) {
    return DRYH_POOL_PRIORITY.reduce((dominantPool, candidatePool) => {
        if (comparePoolDice(pools[candidatePool], pools[dominantPool]) > 0) {
            return candidatePool;
        }
        return dominantPool;
    }, DRYH_POOL_PRIORITY[0]);
}
export function createRollResult(pools) {
    const normalizedPools = clonePools(pools);
    const playerSuccesses = countSuccesses(normalizedPools.discipline) +
        countSuccesses(normalizedPools.exhaustion) +
        countSuccesses(normalizedPools.madness);
    const painSuccesses = countSuccesses(normalizedPools.pain);
    return {
        pools: normalizedPools,
        successes: {
            pain: painSuccesses,
            player: playerSuccesses
        },
        outcome: playerSuccesses >= painSuccesses ? "success" : "failure",
        dominant: getDominantPool(normalizedPools)
    };
}
export function rollDryhCheck(poolSizes) {
    return createRollResult({
        discipline: rollD6Pool(poolSizes.discipline),
        exhaustion: rollD6Pool(poolSizes.exhaustion),
        madness: rollD6Pool(poolSizes.madness),
        pain: rollD6Pool(poolSizes.pain)
    });
}
export function applyGmActionToRollResult(rollResult, action) {
    const pools = clonePools(rollResult.pools);
    if (action.type === "add6") {
        pools[action.targetPool].push(6);
    }
    if (action.type === "remove6") {
        const sixIndex = pools[action.targetPool].indexOf(6);
        if (sixIndex >= 0) {
            pools[action.targetPool].splice(sixIndex, 1);
        }
    }
    return createRollResult(pools);
}
//# sourceMappingURL=roll.js.map
