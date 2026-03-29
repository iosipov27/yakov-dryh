import { SYSTEM_ID, TEMPLATE_PATHS } from "../../constants.js";
import { adjustSharedPool, endHopeScene, getSharedPools } from "../../resources/index.js";
import { createHopeDespairTrackerContext } from "./hope-despair-tracker-presentation.js";
const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
let trackerApplication = null;
const DRAGGING_CLASS = "yakov-dryh-hope-despair-tracker--dragging";
export class YakovDryhHopeDespairTracker extends BaseApplication {
    static DEFAULT_OPTIONS = {
        id: `${SYSTEM_ID}-hope-despair-tracker`,
        classes: [SYSTEM_ID, "yakov-dryh-hope-despair-tracker"],
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
            template: TEMPLATE_PATHS.hopeDespairTracker
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
        Object.assign(context, createHopeDespairTrackerContext({
            isGm: game.user?.isGM ?? false,
            sharedPools: getSharedPools()
        }));
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
        this.initializeCenteredPosition(root);
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
            "[data-yakov-dryh-resource-action]"
        ].join(", "));
        if (!actionElement) {
            return;
        }
        event.preventDefault();
        if (actionElement.dataset.yakovDryhResourceAction === "end-scene") {
            void this.endScene();
            return;
        }
        const resourcePool = actionElement.dataset.yakovDryhResourcePool;
        const resourceDelta = Number.parseInt(actionElement.dataset.yakovDryhResourceDelta ?? "0", 10);
        if (resourcePool && Number.isFinite(resourceDelta)) {
            void this.adjustSharedPool(resourcePool, resourceDelta);
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
    initializeCenteredPosition(root) {
        if (this.dragPosition) {
            return;
        }
        const defaultTop = Number.parseFloat(window.getComputedStyle(root).top || "0");
        this.dragPosition = {
            left: Math.max((window.innerWidth - root.offsetWidth) / 2, 0),
            top: Number.isFinite(defaultTop) ? Math.max(defaultTop, 0) : 0
        };
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
    showGmOnlyWarning() {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly", "Only the GM can change Hope / Despair."));
    }
    handleSettingUpdate(setting) {
        if (setting.key !== `${SYSTEM_ID}.sharedHope` &&
            setting.key !== `${SYSTEM_ID}.pendingHope` &&
            setting.key !== `${SYSTEM_ID}.gmDespair`) {
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
export async function renderHopeDespairTracker() {
    trackerApplication ??= new YakovDryhHopeDespairTracker();
    await trackerApplication.render({ force: true });
    return trackerApplication;
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function clampPosition(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=hope-despair-tracker.js.map