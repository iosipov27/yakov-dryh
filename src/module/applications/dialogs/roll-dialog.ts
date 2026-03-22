import { createDryhInitialRollMessage } from "../../chat/roll-card-service.js";
import {
  DRYH_EXHAUSTION_MAX,
  DRYH_TEMP_MADNESS_MAX,
  normalizeCharacterSystemData
} from "../../data/index.js";
import { rollDryhCheck } from "../../dice/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";

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
      title: "Yakov Dryh Roll"
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
    const addExhaustionMax =
      actorData.exhaustion < DRYH_EXHAUSTION_MAX ? 1 : 0;
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

    const addExhaustionInput = this.element.querySelector<HTMLInputElement>(
      'input[name="addExhaustion"]'
    );
    const madnessInput = this.element.querySelector<HTMLInputElement>(
      'input[name="madnessTemp"]'
    );
    const poolButtons = this.element.querySelectorAll<HTMLButtonElement>(
      "[data-yakov-dryh-dialog-pool]"
    );
    const cancelButton = this.element.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="cancel-roll"]'
    );
    const rollButton = this.element.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="submit-roll"]'
    );
    const syncDialogPools = () => {
      syncAddExhaustionPool(
        this.element,
        actorData.exhaustion,
        addExhaustionInput?.value ?? "0",
        getDialogPoolMax(this.element, "addExhaustion"),
        localize("YAKOV_DRYH.ROLL.Dialog.AddExhaustion", "Take +1 Exhaustion")
      );
      syncMadnessPool(
        this.element,
        actorData.madnessPermanent,
        madnessInput?.value ?? "0",
        DRYH_TEMP_MADNESS_MAX,
        localize("YAKOV_DRYH.ROLL.Dialog.TemporaryMadness", "Temporary Madness")
      );
    };

    poolButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const poolName = button.dataset.yakovDryhDialogPool as RollDialogPoolName | undefined;
        const action = button.dataset.yakovDryhDialogPoolAction as
          | "decrease"
          | "increase"
          | undefined;

        if (!poolName || !action) {
          return;
        }

        const input = this.form?.elements.namedItem(poolName) as HTMLInputElement | null;

        if (!input) {
          return;
        }

        const maxValue =
          poolName === "addExhaustion"
            ? getDialogPoolMax(this.element, "addExhaustion")
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
        syncDialogPools();
      });
    });
    cancelButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.close();
    });
    rollButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.submitRoll();
    });

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
    const addExhaustion = (Number.parseInt(addExhaustionInput?.value ?? "0", 10) || 0) > 0;
    const madnessTemp = Math.min(
      Math.max(Number.parseInt(madnessInput?.value ?? "0", 10) || 0, 0),
      DRYH_TEMP_MADNESS_MAX
    );
    const nextExhaustion = addExhaustion
      ? Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX)
      : actorData.exhaustion;

    if (addExhaustion && nextExhaustion !== actorData.exhaustion) {
      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);
    }

    await createDryhInitialRollMessage({
      actor,
      rollResult: rollDryhCheck({
        discipline: actorData.discipline,
        exhaustion: nextExhaustion,
        madness: actorData.madnessPermanent + madnessTemp,
        pain: 0
      })
    });

    await this.close();
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
