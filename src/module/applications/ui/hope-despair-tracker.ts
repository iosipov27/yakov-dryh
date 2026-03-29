import { SYSTEM_ID, TEMPLATE_PATHS } from "../../constants.js";
import {
  adjustSharedPool,
  endHopeScene,
  getSharedPools,
  type YakovDryhSharedPool
} from "../../resources/index.js";
import { createHopeDespairTrackerContext } from "./hope-despair-tracker-presentation.js";
import { isSharedPoolSettingChange } from "./setting-change.js";

const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface SettingDocumentLike {
  key?: string;
}

interface TrackerDragPosition {
  left: number;
  top: number;
}

interface TrackerDragState {
  offsetX: number;
  offsetY: number;
  pointerId: number;
}

let trackerApplication: YakovDryhHopeDespairTracker | null = null;
const DRAGGING_CLASS = "yakov-dryh-hope-despair-tracker--dragging";

export class YakovDryhHopeDespairTracker extends BaseApplication {
  static override DEFAULT_OPTIONS = {
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

  static override PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.hopeDespairTracker
    }
  };

  private readonly handlePointerMoveBound: (event: PointerEvent) => void;
  private readonly handlePointerUpBound: (event: PointerEvent) => void;
  private readonly handleRootClickBound: (event: MouseEvent) => void;
  private readonly handleRootPointerDownBound: (event: PointerEvent) => void;
  private readonly handleSettingUpdateBound: (setting: SettingDocumentLike) => void;
  private boundRoot: HTMLElement | null;
  private dragPosition: TrackerDragPosition | null;
  private dragState: TrackerDragState | null;
  private settingRenderTimeout: number | null;

  constructor(options: object = {}) {
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
    Hooks.on("createSetting", this.handleSettingUpdateBound);
    Hooks.on("updateSetting", this.handleSettingUpdateBound);
  }

  protected override async _prepareContext(
    options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const context = (await super._prepareContext(
      options as never
    )) as Record<string, unknown>;

    Object.assign(
      context,
      createHopeDespairTrackerContext({
        isGm: game.user?.isGM ?? false,
        sharedPools: getSharedPools()
      })
    );

    return context as foundry.applications.api.HandlebarsApplicationMixin.RenderContext;
  }

  protected override async _onRender(
    context: object,
    options: object
  ): Promise<void> {
    await super._onRender(context, options as never);

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

  override async close(
    options: Partial<foundry.applications.api.ApplicationV2.ClosingOptions> = {}
  ): Promise<this> {
    if (options.closeKey) {
      return this;
    }

    this.stopDragging();
    this.clearScheduledRender();
    this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
    this.boundRoot?.removeEventListener("pointerdown", this.handleRootPointerDownBound);
    this.boundRoot = null;
    Hooks.off("createSetting", this.handleSettingUpdateBound);
    Hooks.off("updateSetting", this.handleSettingUpdateBound);

    return super.close(
      options as foundry.applications.api.ApplicationV2.ClosingOptions
    );
  }

  private bindRootListeners(root: HTMLElement): void {
    if (this.boundRoot === root) {
      return;
    }

    this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
    this.boundRoot?.removeEventListener("pointerdown", this.handleRootPointerDownBound);
    root.addEventListener("click", this.handleRootClickBound);
    root.addEventListener("pointerdown", this.handleRootPointerDownBound);
    this.boundRoot = root;
  }

  private handleRootClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>(
      [
        "[data-yakov-dryh-resource-pool]",
        "[data-yakov-dryh-resource-action]"
      ].join(", ")
    );

    if (!actionElement) {
      return;
    }

    event.preventDefault();

    if (actionElement.dataset.yakovDryhResourceAction === "end-scene") {
      void this.endScene();
      return;
    }

    const resourcePool = actionElement.dataset.yakovDryhResourcePool as
      | YakovDryhSharedPool
      | undefined;
    const resourceDelta = Number.parseInt(
      actionElement.dataset.yakovDryhResourceDelta ?? "0",
      10
    );

    if (resourcePool && Number.isFinite(resourceDelta)) {
      void this.adjustSharedPool(resourcePool, resourceDelta);
    }
  }

  private handleRootPointerDown(event: PointerEvent): void {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const dragHandle = target.closest<HTMLElement>("[data-yakov-dryh-drag-handle]");
    const root = this.boundRoot;

    if (!dragHandle || !root) {
      return;
    }

    this.beginDrag(event, root);
  }

  private beginDrag(event: PointerEvent, root: HTMLElement): void {
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

  private handlePointerMove(event: PointerEvent): void {
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

  private handlePointerUp(event: PointerEvent): void {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    this.stopDragging();
  }

  private stopDragging(): void {
    this.dragState = null;

    window.removeEventListener("pointermove", this.handlePointerMoveBound);
    window.removeEventListener("pointerup", this.handlePointerUpBound);
    window.removeEventListener("pointercancel", this.handlePointerUpBound);

    const root = this.element;

    if (root instanceof HTMLElement) {
      root.classList.remove(DRAGGING_CLASS);
    }
  }

  private initializeCenteredPosition(root: HTMLElement): void {
    if (this.dragPosition) {
      return;
    }

    const defaultTop = Number.parseFloat(window.getComputedStyle(root).top || "0");

    this.dragPosition = {
      left: Math.max((window.innerWidth - root.offsetWidth) / 2, 0),
      top: Number.isFinite(defaultTop) ? Math.max(defaultTop, 0) : 0
    };
  }

  private applyDragPosition(root: HTMLElement): void {
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

  private async adjustSharedPool(
    pool: YakovDryhSharedPool,
    delta: number
  ): Promise<void> {
    if (!game.user?.isGM) {
      this.showGmOnlyWarning();
      return;
    }

    await adjustSharedPool(pool, delta);
  }

  private async endScene(): Promise<void> {
    if (!game.user?.isGM) {
      this.showGmOnlyWarning();
      return;
    }

    await endHopeScene();
  }

  private showGmOnlyWarning(): void {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly",
        "Only the GM can change Hope / Despair."
      )
    );
  }

  private handleSettingUpdate(setting: SettingDocumentLike): void {
    if (!isSharedPoolSettingChange(setting)) {
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

  private clearScheduledRender(): void {
    if (this.settingRenderTimeout === null) {
      return;
    }

    window.clearTimeout(this.settingRenderTimeout);
    this.settingRenderTimeout = null;
  }
}

export async function renderHopeDespairTracker(): Promise<YakovDryhHopeDespairTracker> {
  trackerApplication ??= new YakovDryhHopeDespairTracker();
  await trackerApplication.render({ force: true });

  return trackerApplication;
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;

  return localizedValue === key ? fallback : localizedValue;
}

function clampPosition(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
