import { canDecreaseDiceTrayPool, canIncreaseDiceTrayPool, hasLoadedDiceTrayActor } from "../applications/ui/dice-tray-state.js";
export function createDiceTrayCardContext(input) {
    const { isActorOwner, isGm, state } = input;
    const hasActor = hasLoadedDiceTrayActor(state);
    const canRoll = hasActor && state.pools.pain > 0 && (isActorOwner || isGm);
    return {
        actorName: state.actorName,
        paletteButtons: createPaletteButtons(state, { isActorOwner, isGm }),
        poolSummaries: createPoolSummaries(state, { isActorOwner, isGm }),
        rollDisabled: !canRoll,
        statusLabel: getStatusLabel(state),
        trayTitle: state.actorName
            || localize("YAKOV_DRYH.TRAY.NoActor", "No active character")
    };
}
function createPoolSummaries(state, permissions) {
    const canEditPlayerPools = permissions.isActorOwner || permissions.isGm;
    return ["discipline", "exhaustion", "madness", "pain"].map((key) => {
        const removable = key === "pain"
            ? permissions.isGm && canDecreaseDiceTrayPool(state, key)
            : canEditPlayerPools && canDecreaseDiceTrayPool(state, key);
        const pipCount = state.pools[key];
        const pips = Array.from({ length: pipCount }, (_entry, index) => {
            const isLastRemovable = removable && index === pipCount - 1;
            return {
                removable: isLastRemovable,
                tooltip: isLastRemovable
                    ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${formatPool(key)})`
                    : null
            };
        });
        return {
            empty: pips.length === 0,
            key,
            label: formatPool(key),
            pips,
            trackClass: getPoolTrackClass(key)
        };
    });
}
function createPaletteButtons(state, permissions) {
    const canEditPlayerPools = permissions.isActorOwner || permissions.isGm;
    return ["discipline", "exhaustion", "madness", "pain"].map((key) => ({
        disabled: key === "pain"
            ? !permissions.isGm || !canIncreaseDiceTrayPool(state, key)
            : !canEditPlayerPools || !canIncreaseDiceTrayPool(state, key),
        key,
        label: `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${formatPool(key)})`,
        modifierClass: `yakov-dryh-dice-tray__palette-button--${key}`
    }));
}
function getPoolTrackClass(pool) {
    switch (pool) {
        case "exhaustion":
            return "yakov-dryh-pip-track--exhaustion";
        case "madness":
            return "yakov-dryh-pip-track--madness";
        case "pain":
            return "yakov-dryh-pip-track--pain";
        default:
            return null;
    }
}
function getStatusLabel(state) {
    return state.pools.pain > 0
        ? localize("YAKOV_DRYH.TRAY.Status.Ready", "Ready to roll.")
        : "";
}
function formatPool(pool) {
    return localize(`YAKOV_DRYH.ROLL.Pools.${pool}`, pool.charAt(0).toUpperCase() + pool.slice(1));
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
//# sourceMappingURL=dice-tray-card-presentation.js.map
