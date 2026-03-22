import { SYSTEM_ID, TEMPLATE_PATHS } from "../../constants.js";
import {
  adjustSharedPool,
  getSharedPools,
  type YakovDryhSharedPool
} from "../../resources/index.js";

const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface HopeDespairTrackerContext extends Record<string, unknown> {
  canEdit: boolean;
  despair: number;
  hope: number;
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

interface SettingDocumentLike {
  key?: string;
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

  private readonly handleSettingUpdateBound: (setting: SettingDocumentLike) => void;
  private readonly handlePointerMoveBound: (event: PointerEvent) => void;
  private readonly handlePointerUpBound: (event: PointerEvent) => void;
  private dragPosition: TrackerDragPosition | null;
  private dragState: TrackerDragState | null;

  constructor(options: object = {}) {
    super(options);
    this.handleSettingUpdateBound = this.handleSettingUpdate.bind(this);
    this.handlePointerMoveBound = this.handlePointerMove.bind(this);
    this.handlePointerUpBound = this.handlePointerUp.bind(this);
    this.dragPosition = null;
    this.dragState = null;
    Hooks.on("updateSetting", this.handleSettingUpdateBound);
  }

  protected override async _prepareContext(
    options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const context =
      (await super._prepareContext(options as never)) as HopeDespairTrackerContext;
    const sharedPools = getSharedPools();

    context.canEdit = game.user?.isGM ?? false;
    context.despair = sharedPools.despair;
    context.hope = sharedPools.hope;

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

    this.applyDragPosition(root);

    const dragHandle = root.querySelector(
      "[data-yakov-dryh-drag-handle]"
    ) as HTMLElement | null;
    const actionButtons = root.querySelectorAll<HTMLElement>(
      "[data-yakov-dryh-resource-pool]"
    );

    dragHandle?.addEventListener("pointerdown", (event) => {
      this.beginDrag(event, root);
    });

    actionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const pool = button.dataset.yakovDryhResourcePool as
          | YakovDryhSharedPool
          | undefined;
        const delta = Number.parseInt(
          button.dataset.yakovDryhResourceDelta ?? "0",
          10
        );

        if (!pool || !Number.isFinite(delta)) {
          return;
        }

        void this.adjustPool(pool, delta);
      });
    });
  }

  override async close(
    options: Partial<foundry.applications.api.ApplicationV2.ClosingOptions> = {}
  ): Promise<this> {
    if (options.closeKey) {
      return this;
    }

    this.stopDragging();
    Hooks.off("updateSetting", this.handleSettingUpdateBound);

    return super.close(
      options as foundry.applications.api.ApplicationV2.ClosingOptions
    );
  }

  private async adjustPool(
    pool: YakovDryhSharedPool,
    delta: number
  ): Promise<void> {
    if (!game.user?.isGM) {
      ui.notifications?.warn(
        game.i18n?.localize("YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly") ??
          "Only the GM can change Hope / Despair."
      );
      return;
    }

    await adjustSharedPool(pool, delta);
    await this.render({ force: true });
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
    const nextLeft = clampPosition(
      event.clientX - this.dragState.offsetX,
      0,
      maxLeft
    );
    const nextTop = clampPosition(
      event.clientY - this.dragState.offsetY,
      0,
      maxTop
    );

    this.dragPosition = {
      left: nextLeft,
      top: nextTop
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

  private handleSettingUpdate(setting: SettingDocumentLike): void {
    if (!setting || typeof setting !== "object") {
      return;
    }

    if (
      setting.key !== `${SYSTEM_ID}.sharedHope` &&
      setting.key !== `${SYSTEM_ID}.gmDespair`
    ) {
      return;
    }

    void this.render();
  }
}

export async function renderHopeDespairTracker(): Promise<YakovDryhHopeDespairTracker> {
  trackerApplication ??= new YakovDryhHopeDespairTracker();
  await trackerApplication.render({ force: true });

  return trackerApplication;
}

function clampPosition(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
