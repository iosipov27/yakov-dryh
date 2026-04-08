import { createDryhInitialRollMessage } from "../../chat/roll-card-service.js";
import {
  DRYH_EXHAUSTION_MAX,
  DRYH_TEMP_MADNESS_MAX,
  normalizeCharacterSystemData
} from "../../data/index.js";
import { rollDryhCheck } from "../../dice/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { canAddPreRollExhaustion } from "./roll-dialog-rules.js";

const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface RollDialogContext extends Record<string, unknown> {
  addExhaustionPips: RollDialogPip[];
  addExhaustionMax: number;
  actorData: ReturnType<typeof normalizeCharacterSystemData>;
  actorName: string;
  addExhaustionValue: number;
  disciplinePips: RollDialogDisplayPip[];
  exhaustionPips: RollDialogDisplayPip[];
  madnessPips: RollDialogDisplayPip[];
  madnessTempPips: RollDialogPip[];
  madnessTempValue: number;
  moduleId: string;
}

interface RollDialogPip {
  action: "decrease" | "increase" | null;
  filled: boolean;
  iconClass: string | null;
  index: number;
  tooltip: string | null;
}

interface RollDialogDisplayPip {
  filled: boolean;
}

type RollDialogPoolName = "addExhaustion" | "madnessTemp";

export class YakovDryhRollDialog extends BaseApplication {
  private boundRoot: HTMLElement | null = null;
  private readonly handleRootClickBound: (event: MouseEvent) => void;

  static override DEFAULT_OPTIONS = {
    classes: [SYSTEM_ID, "yakov-dryh-dialog", "yakov-dryh-roll-dialog"],
    form: {
      closeOnSubmit: false
    },
    position: {
      height: "auto" as const,
      width: 480
    },
    tag: "form",
    window: {
      icon: "fa-solid fa-dice-d6",
      resizable: false,
      title: "Don't Rest Your Head Roll"
    }
  };

  static override PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.dryhRollDialog
    }
  };

  readonly actorDocument: Actor.Implementation;

  constructor(actor: Actor.Implementation) {
    super();
    this.actorDocument = actor;
    this.handleRootClickBound = this.handleRootClick.bind(this);
  }

  static async openForActor(actor: Actor.Implementation): Promise<YakovDryhRollDialog> {
    const dialog = new YakovDryhRollDialog(actor);

    await dialog.render({ force: true });

    return dialog;
  }

  get actor(): Actor.Implementation | null {
    return this.actorDocument;
  }

  override get title(): string {
    const actorName = this.actor?.name ?? localize("DOCUMENT.Actor", "Actor");
    return `${SYSTEM_TITLE}: ${actorName}`;
  }

  protected override async _prepareContext(
    _options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const actor = this.actor;
    const actorData = normalizeCharacterSystemData(actor?.system);
    const addExhaustionMax = canAddPreRollExhaustion(actorData.exhaustion) ? 1 : 0;
    const addExhaustionLabel = localize(
      "YAKOV_DRYH.ROLL.Dialog.AddExhaustion",
      "Take +1 Exhaustion"
    );
    const temporaryMadnessLabel = localize(
      "YAKOV_DRYH.ROLL.Dialog.TemporaryMadness",
      "Temporary Madness"
    );
    const context: RollDialogContext = {
      addExhaustionPips: createRollDialogPips(0, addExhaustionMax, addExhaustionLabel),
      addExhaustionMax,
      actorData,
      actorName: actor?.name ?? localize("DOCUMENT.Actor", "Actor"),
      addExhaustionValue: 0,
      disciplinePips: createDisplayPips(
        actorData.discipline,
        actorData.discipline
      ),
      exhaustionPips: createDisplayPips(
        actorData.exhaustion,
        actorData.exhaustion
      ),
      madnessPips: createDisplayPips(
        actorData.madnessPermanent,
        actorData.madnessPermanent
      ),
      madnessTempPips: createRollDialogPips(0, DRYH_TEMP_MADNESS_MAX, temporaryMadnessLabel),
      madnessTempValue: 0,
      moduleId: SYSTEM_ID
    };

    return context as foundry.applications.api.HandlebarsApplicationMixin.RenderContext;
  }

  protected override async _onRender(
    context: object,
    options: object
  ): Promise<void> {
    await super._onRender(context, options as never);
    const actorData = normalizeCharacterSystemData(this.actor?.system);
    const root = this.element;

    if (!(root instanceof HTMLElement)) {
      return;
    }

    const addExhaustionInput = root.querySelector<HTMLInputElement>(
      'input[name="addExhaustion"]'
    );
    const madnessInput = root.querySelector<HTMLInputElement>(
      'input[name="madnessTemp"]'
    );
    const syncDialogPools = () => {
      syncAddExhaustionPool(
        root,
        actorData.exhaustion,
        addExhaustionInput?.value ?? "0",
        getDialogPoolMax(root, "addExhaustion"),
        localize("YAKOV_DRYH.ROLL.Dialog.AddExhaustion", "Take +1 Exhaustion")
      );
      syncMadnessPool(
        root,
        actorData.madnessPermanent,
        madnessInput?.value ?? "0",
        DRYH_TEMP_MADNESS_MAX,
        localize("YAKOV_DRYH.ROLL.Dialog.TemporaryMadness", "Temporary Madness")
      );
    };

    this.bindRootListeners(root);
    syncDialogPools();
  }

  private async submitRoll(): Promise<void> {
    const actor = this.actor;

    if (!actor) {
      ui.notifications?.warn(
        localize(
          "YAKOV_DRYH.UI.Warnings.ActorUnavailable",
          "Actor is no longer available."
        )
      );

      return;
    }

    const addExhaustionInput = this.form?.elements.namedItem(
      "addExhaustion"
    ) as HTMLInputElement | null;
    const madnessInput = this.form?.elements.namedItem(
      "madnessTemp"
    ) as HTMLInputElement | null;
    const actorData = normalizeCharacterSystemData(actor.system);
    const addExhaustionRequested =
      (Number.parseInt(addExhaustionInput?.value ?? "0", 10) || 0) > 0;
    const addExhaustion =
      addExhaustionRequested && canAddPreRollExhaustion(actorData.exhaustion);
    const madnessTemp = Math.min(
      Math.max(Number.parseInt(madnessInput?.value ?? "0", 10) || 0, 0),
      DRYH_TEMP_MADNESS_MAX
    );
    const nextExhaustion = addExhaustion
      ? actorData.exhaustion + 1
      : actorData.exhaustion;

    if (addExhaustion && nextExhaustion !== actorData.exhaustion) {
      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);
    }

    await createDryhInitialRollMessage({
      actor,
      preRollExhaustionTaken: addExhaustion,
      rollResult: rollDryhCheck({
        discipline: actorData.discipline,
        exhaustion: nextExhaustion,
        madness: actorData.madnessPermanent + madnessTemp,
        pain: 0
      })
    });

    await this.close();
  }

  private bindRootListeners(root: HTMLElement): void {
    if (this.boundRoot === root) {
      return;
    }

    this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
    root.addEventListener("click", this.handleRootClickBound);
    this.boundRoot = root;
  }

  private handleRootClick(event: MouseEvent): void {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>(
      "[data-yakov-dryh-dialog-pool], [data-yakov-dryh-action]"
    );

    if (!actionElement) {
      return;
    }

    event.preventDefault();

    if (actionElement.dataset.yakovDryhAction === "cancel-roll") {
      void this.close();
      return;
    }

    if (actionElement.dataset.yakovDryhAction === "submit-roll") {
      void this.submitRoll();
      return;
    }

    const poolName = actionElement.dataset.yakovDryhDialogPool as
      | RollDialogPoolName
      | undefined;
    const action = actionElement.dataset.yakovDryhDialogPoolAction as
      | "decrease"
      | "increase"
      | undefined;

    if (!poolName || !action) {
      return;
    }

    const root = this.boundRoot;
    const input = this.form?.elements.namedItem(poolName) as HTMLInputElement | null;

    if (!root || !input) {
      return;
    }

    const maxValue =
      poolName === "addExhaustion"
        ? getDialogPoolMax(root, "addExhaustion")
        : DRYH_TEMP_MADNESS_MAX;
    const currentValue = Math.min(
      Math.max(Number.parseInt(input.value, 10) || 0, 0),
      maxValue
    );
    const nextValue =
      action === "increase"
        ? Math.min(currentValue + 1, maxValue)
        : Math.max(currentValue - 1, 0);

    input.value = String(nextValue);
    syncRootDialogPools(root, this.actor?.system);
  }
}

function createRollDialogPips(
  value: number,
  total: number,
  label: string
): RollDialogPip[] {
  const normalizedValue = Math.min(Math.max(value, 0), total);

  return Array.from({ length: total }, (_entry, index) => {
    const filled = index < normalizedValue;
    const canDecrease = normalizedValue > 0 && index === normalizedValue - 1;
    const canIncrease = normalizedValue < total && index === normalizedValue;
    const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;

    return {
      action,
      filled,
      iconClass: canDecrease ? "fa-solid fa-trash-can" : canIncrease ? "fa-solid fa-plus" : null,
      index,
      tooltip: canDecrease
        ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
        : canIncrease
          ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
          : null
    };
  });
}

function createDisplayPips(
  value: number,
  total: number
): RollDialogDisplayPip[] {
  return Array.from({ length: total }, (_entry, index) => ({
    filled: index < value
  }));
}

function syncRootDialogPools(
  root: HTMLElement,
  actorSystem: unknown
): void {
  const actorData = normalizeCharacterSystemData(actorSystem);
  const addExhaustionInput = root.querySelector<HTMLInputElement>(
    'input[name="addExhaustion"]'
  );
  const madnessInput = root.querySelector<HTMLInputElement>(
    'input[name="madnessTemp"]'
  );

  syncAddExhaustionPool(
    root,
    actorData.exhaustion,
    addExhaustionInput?.value ?? "0",
    getDialogPoolMax(root, "addExhaustion"),
    localize("YAKOV_DRYH.ROLL.Dialog.AddExhaustion", "Take +1 Exhaustion")
  );
  syncMadnessPool(
    root,
    actorData.madnessPermanent,
    madnessInput?.value ?? "0",
    DRYH_TEMP_MADNESS_MAX,
    localize("YAKOV_DRYH.ROLL.Dialog.TemporaryMadness", "Temporary Madness")
  );
}

function syncAddExhaustionPool(
  root: HTMLElement,
  currentExhaustion: number,
  rawValue: string,
  total: number,
  label: string
): void {
  const normalizedValue = Math.min(
    Math.max(Number.parseInt(rawValue, 10) || 0, 0),
    total
  );
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    '[data-yakov-dryh-dialog-pool="addExhaustion"]'
  );

  buttons.forEach((button) => {
    const pip = button.querySelector<HTMLElement>(".yakov-dryh-pip");
    const icon = button.querySelector<HTMLElement>(".yakov-dryh-dice-picker__action-icon");
    const canDecrease = normalizedValue > 0;
    const canIncrease = normalizedValue < total;
    const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;
    const tooltip = canDecrease
      ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
      : canIncrease
        ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
        : "";

    button.disabled = action === null;
    button.dataset.yakovDryhDialogPoolAction = action ?? "";
    button.classList.toggle("yakov-dryh-dice-picker__pip-control--increase", action === "increase");
    button.classList.toggle("yakov-dryh-dice-picker__pip-control--decrease", action === "decrease");
    button.title = tooltip;
    if (tooltip) {
      button.setAttribute("aria-label", tooltip);
    } else {
      button.removeAttribute("aria-label");
    }
    pip?.classList.toggle("yakov-dryh-pip--filled", normalizedValue > 0);

    if (icon) {
      icon.classList.remove(
        "yakov-dryh-dice-picker__action-icon--increase",
        "yakov-dryh-dice-picker__action-icon--decrease"
      );
      icon.innerHTML =
        action === "increase"
          ? '<i class="fa-solid fa-plus"></i>'
          : action === "decrease"
            ? '<i class="fa-solid fa-trash-can"></i>'
            : "";

      if (action) {
        icon.classList.add(`yakov-dryh-dice-picker__action-icon--${action}`);
      }
    }
  });
}

function syncMadnessPool(
  root: HTMLElement,
  permanentMadness: number,
  rawValue: string,
  total: number,
  label: string
): void {
  const normalizedValue = Math.min(
    Math.max(Number.parseInt(rawValue, 10) || 0, 0),
    total
  );
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    '[data-yakov-dryh-dialog-pool="madnessTemp"]'
  );

  buttons.forEach((button, index) => {
    const pip = button.querySelector<HTMLElement>(".yakov-dryh-pip");
    const icon = button.querySelector<HTMLElement>(".yakov-dryh-dice-picker__action-icon");
    const canDecrease = normalizedValue > 0 && index === normalizedValue - 1;
    const canIncrease = normalizedValue < total && index === normalizedValue;
    const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;
    const tooltip = canDecrease
      ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
      : canIncrease
        ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
        : "";

    button.disabled = action === null;
    button.dataset.yakovDryhDialogPoolAction = action ?? "";
    button.classList.toggle("yakov-dryh-dice-picker__pip-control--increase", action === "increase");
    button.classList.toggle("yakov-dryh-dice-picker__pip-control--decrease", action === "decrease");
    button.title = tooltip;
    if (tooltip) {
      button.setAttribute("aria-label", tooltip);
    } else {
      button.removeAttribute("aria-label");
    }
    pip?.classList.toggle("yakov-dryh-pip--filled", index < normalizedValue);

    if (icon) {
      icon.classList.remove(
        "yakov-dryh-dice-picker__action-icon--increase",
        "yakov-dryh-dice-picker__action-icon--decrease"
      );
      icon.innerHTML =
        action === "increase"
          ? '<i class="fa-solid fa-plus"></i>'
          : action === "decrease"
            ? '<i class="fa-solid fa-trash-can"></i>'
            : "";

      if (action) {
        icon.classList.add(`yakov-dryh-dice-picker__action-icon--${action}`);
      }
    }
  });
}

function getDialogPoolMax(
  root: HTMLElement,
  poolName: Extract<RollDialogPoolName, "addExhaustion">
): number {
  return (
    Number.parseInt(
      root.querySelector<HTMLInputElement>(
        `[data-yakov-dryh-dialog-pool-max="${poolName}"]`
      )?.value ?? "0",
      10
    ) || 0
  );
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;
  return localizedValue === key ? fallback : localizedValue;
}
