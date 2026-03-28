import { createDryhInitialRollMessage } from "../../chat/roll-card-service.js";
import { SYSTEM_ID, TEMPLATE_PATHS } from "../../constants.js";
import { rollDryhCheck } from "../../dice/index.js";
import { adjustSharedPool, endHopeScene, getSharedPools } from "../../resources/index.js";
import { adjustDiceTrayPool, canDecreaseDiceTrayPool, canIncreaseDiceTrayPool, getDiceTrayState, hasLoadedDiceTrayActor, resetDiceTrayState, setDiceTrayConfirmed } from "./dice-tray-state.js";
const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
let trayApplication = null;
const DRAGGING_CLASS = "yakov-dryh-dice-tray--dragging";
export class YakovDryhDiceTray extends BaseApplication {
    static DEFAULT_OPTIONS = {
        id: `${SYSTEM_ID}-dice-tray`,
        classes: [SYSTEM_ID, "yakov-dryh-dice-tray"],
        tag: "section",
        window: {
            frame: false,
            minimizable: false,
            positioned: false,
            resizable: false
        }
    };
    static PARTS = {
        content: {
            root: true,
            template: TEMPLATE_PATHS.diceTray
        }
    };
    handlePointerMoveBound;
    handlePointerUpBound;
    handleRootClickBound;
    handleRootPointerDownBound;
    handleSettingUpdateBound;
    boundRoot;
    dragPosition;
    dragState;
    settingRenderTimeout;
    constructor(options = {}) {
        super(options);
        this.handlePointerMoveBound = this.handlePointerMove.bind(this);
        this.handlePointerUpBound = this.handlePointerUp.bind(this);
        this.handleRootClickBound = this.handleRootClick.bind(this);
        this.handleRootPointerDownBound = this.handleRootPointerDown.bind(this);
        this.handleSettingUpdateBound = this.handleSettingUpdate.bind(this);
        this.boundRoot = null;
        this.dragPosition = null;
        this.dragState = null;
        this.settingRenderTimeout = null;
        Hooks.on("updateSetting", this.handleSettingUpdateBound);
    }
    async _prepareContext(options) {
        const context = (await super._prepareContext(options));
        const sharedPools = getSharedPools();
        const trayState = getDiceTrayState();
        const actor = trayState.actorId ? game.actors?.get(trayState.actorId) ?? null : null;
        const isGm = game.user?.isGM ?? false;
        const isActorOwner = actor?.isOwner ?? false;
        const hasActor = hasLoadedDiceTrayActor(trayState);
        Object.assign(context, {
            actorName: trayState.actorName,
            canEdit: isGm,
            canLockPools: isGm && hasActor && !trayState.confirmed,
            canRoll: hasActor && trayState.confirmed && (isActorOwner || isGm),
            despair: sharedPools.despair,
            hasActor,
            hasPendingHope: sharedPools.pendingHope > 0,
            hope: sharedPools.hope,
            pendingHope: sharedPools.pendingHope,
            paletteButtons: createPaletteButtons(trayState, { isActorOwner, isGm }),
            poolSummaries: createPoolSummaries(trayState, { isActorOwner, isGm }),
            showReadOnly: !isGm,
            statusLabel: getStatusLabel(trayState),
            trayTitle: hasActor
                ? trayState.actorName
                : localize("YAKOV_DRYH.TRAY.NoActor", "No active character")
        });
        return context;
    }
    async _onRender(context, options) {
        await super._onRender(context, options);
        const root = this.element;
        if (!(root instanceof HTMLElement)) {
            return;
        }
        if (root.parentElement !== document.body) {
            document.body.append(root);
        }
        this.applyDragPosition(root);
        this.bindRootListeners(root);
    }
    async close(options = {}) {
        if (options.closeKey) {
            return this;
        }
        this.stopDragging();
        this.clearScheduledRender();
        this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
        this.boundRoot?.removeEventListener("pointerdown", this.handleRootPointerDownBound);
        this.boundRoot = null;
        Hooks.off("updateSetting", this.handleSettingUpdateBound);
        return super.close(options);
    }
    bindRootListeners(root) {
        if (this.boundRoot === root) {
            return;
        }
        this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
        this.boundRoot?.removeEventListener("pointerdown", this.handleRootPointerDownBound);
        root.addEventListener("click", this.handleRootClickBound);
        root.addEventListener("pointerdown", this.handleRootPointerDownBound);
        this.boundRoot = root;
    }
    handleRootClick(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const actionElement = target.closest([
            "[data-yakov-dryh-resource-pool]",
            "[data-yakov-dryh-resource-action]",
            "[data-yakov-dryh-tray-action]",
            "[data-yakov-dryh-tray-pool]"
        ].join(", "));
        if (!actionElement) {
            return;
        }
        event.preventDefault();
        const trayAction = actionElement.dataset.yakovDryhTrayAction;
        if (trayAction === "lock-pools") {
            void this.lockPools();
            return;
        }
        if (trayAction === "roll") {
            void this.rollFromTray();
            return;
        }
        if (actionElement.dataset.yakovDryhResourceAction === "end-scene") {
            void this.endScene();
            return;
        }
        const resourcePool = actionElement.dataset.yakovDryhResourcePool;
        const resourceDelta = Number.parseInt(actionElement.dataset.yakovDryhResourceDelta ?? "0", 10);
        if (resourcePool && Number.isFinite(resourceDelta)) {
            void this.adjustSharedPool(resourcePool, resourceDelta);
            return;
        }
        const trayPool = actionElement.dataset.yakovDryhTrayPool;
        const trayDelta = Number.parseInt(actionElement.dataset.yakovDryhTrayDelta ?? "0", 10);
        if (trayPool && Number.isFinite(trayDelta)) {
            void this.adjustTrayPool(trayPool, trayDelta);
        }
    }
    handleRootPointerDown(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const dragHandle = target.closest("[data-yakov-dryh-drag-handle]");
        const root = this.boundRoot;
        if (!dragHandle || !root) {
            return;
        }
        this.beginDrag(event, root);
    }
    beginDrag(event, root) {
        if (event.button !== 0) {
            return;
        }
        const rect = root.getBoundingClientRect();
        this.dragPosition = {
            left: rect.left,
            top: rect.top
        };
        this.dragState = {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            pointerId: event.pointerId
        };
        root.classList.add(DRAGGING_CLASS);
        window.addEventListener("pointermove", this.handlePointerMoveBound);
        window.addEventListener("pointerup", this.handlePointerUpBound);
        window.addEventListener("pointercancel", this.handlePointerUpBound);
        event.preventDefault();
    }
    handlePointerMove(event) {
        if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
            return;
        }
        const root = this.element;
        if (!(root instanceof HTMLElement)) {
            return;
        }
        const maxLeft = Math.max(window.innerWidth - root.offsetWidth, 0);
        const maxTop = Math.max(window.innerHeight - root.offsetHeight, 0);
        this.dragPosition = {
            left: clampPosition(event.clientX - this.dragState.offsetX, 0, maxLeft),
            top: clampPosition(event.clientY - this.dragState.offsetY, 0, maxTop)
        };
        this.applyDragPosition(root);
    }
    handlePointerUp(event) {
        if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
            return;
        }
        this.stopDragging();
    }
    stopDragging() {
        this.dragState = null;
        window.removeEventListener("pointermove", this.handlePointerMoveBound);
        window.removeEventListener("pointerup", this.handlePointerUpBound);
        window.removeEventListener("pointercancel", this.handlePointerUpBound);
        const root = this.element;
        if (root instanceof HTMLElement) {
            root.classList.remove(DRAGGING_CLASS);
        }
    }
    applyDragPosition(root) {
        if (!this.dragPosition) {
            return;
        }
        const maxLeft = Math.max(window.innerWidth - root.offsetWidth, 0);
        const maxTop = Math.max(window.innerHeight - root.offsetHeight, 0);
        const left = clampPosition(this.dragPosition.left, 0, maxLeft);
        const top = clampPosition(this.dragPosition.top, 0, maxTop);
        this.dragPosition = { left, top };
        root.style.left = `${left}px`;
        root.style.right = "auto";
        root.style.top = `${top}px`;
    }
    async adjustSharedPool(pool, delta) {
        if (!game.user?.isGM) {
            this.showGmOnlyWarning();
            return;
        }
        await adjustSharedPool(pool, delta);
    }
    async endScene() {
        if (!game.user?.isGM) {
            this.showGmOnlyWarning();
            return;
        }
        await endHopeScene();
    }
    async adjustTrayPool(pool, delta) {
        const state = getDiceTrayState();
        const actor = state.actorId ? game.actors?.get(state.actorId) ?? null : null;
        const isActorOwner = actor?.isOwner ?? false;
        const isGm = game.user?.isGM ?? false;
        const canEditPlayerPools = isActorOwner || isGm;
        if (pool === "pain") {
            if (!isGm) {
                this.showGmOnlyWarning();
                return;
            }
        }
        else if (!canEditPlayerPools) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly", "Only the actor owner can change these dice."));
            return;
        }
        await adjustDiceTrayPool(pool, delta);
    }
    async lockPools() {
        if (!game.user?.isGM) {
            this.showGmOnlyWarning();
            return;
        }
        await setDiceTrayConfirmed(true);
    }
    async rollFromTray() {
        const state = getDiceTrayState();
        if (!state.confirmed || !state.actorId) {
            return;
        }
        const actor = game.actors?.get(state.actorId) ??
            (state.actorUuid ? ((await fromUuid(state.actorUuid)) ?? null) : null);
        if (!(actor instanceof Actor)) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
            return;
        }
        const isActorOwner = actor.isOwner;
        const isGm = game.user?.isGM ?? false;
        if (!isActorOwner && !isGm) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly", "Only the actor owner can change these dice."));
            return;
        }
        const preRollExhaustionTaken = state.pools.exhaustion > state.basePools.exhaustion;
        if (preRollExhaustionTaken) {
            await actor.update({
                "system.exhaustion": state.pools.exhaustion
            });
        }
        await createDryhInitialRollMessage({
            actor,
            painRolled: true,
            preRollExhaustionTaken,
            rollResult: rollDryhCheck({
                discipline: state.pools.discipline,
                exhaustion: state.pools.exhaustion,
                madness: state.pools.madness,
                pain: state.pools.pain
            })
        });
        await resetDiceTrayState();
    }
    showGmOnlyWarning() {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly", "Only the GM can change Hope / Despair."));
    }
    handleSettingUpdate(setting) {
        if (!setting || typeof setting !== "object") {
            return;
        }
        if (setting.key !== `${SYSTEM_ID}.sharedHope` &&
            setting.key !== `${SYSTEM_ID}.pendingHope` &&
            setting.key !== `${SYSTEM_ID}.gmDespair` &&
            setting.key !== `${SYSTEM_ID}.diceTrayState`) {
            return;
        }
        if (this.settingRenderTimeout !== null) {
            return;
        }
        this.settingRenderTimeout = window.setTimeout(() => {
            this.settingRenderTimeout = null;
            void this.render();
        }, 0);
    }
    clearScheduledRender() {
        if (this.settingRenderTimeout === null) {
            return;
        }
        window.clearTimeout(this.settingRenderTimeout);
        this.settingRenderTimeout = null;
    }
}
export async function renderDiceTray() {
    trayApplication ??= new YakovDryhDiceTray();
    await trayApplication.render({ force: true });
    return trayApplication;
}
export { YakovDryhDiceTray as YakovDryhHopeDespairTracker, renderDiceTray as renderHopeDespairTracker };
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
    if (!state.actorId) {
        return localize("YAKOV_DRYH.TRAY.Status.Empty", "Load a character pool from the sheet.");
    }
    return state.confirmed
        ? localize("YAKOV_DRYH.TRAY.Status.Ready", "Ready to roll.")
        : localize("YAKOV_DRYH.TRAY.Status.WaitingForGm", "Waiting for GM to lock pools.");
}
function formatPool(pool) {
    return localize(`YAKOV_DRYH.ROLL.Pools.${pool}`, pool.charAt(0).toUpperCase() + pool.slice(1));
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function clampPosition(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=dice-tray.js.map