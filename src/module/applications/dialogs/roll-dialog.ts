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
  actorData: ReturnType<typeof normalizeCharacterSystemData>;
  actorName: string;
  disciplineDots: string;
  exhaustionDots: string;
  madnessDots: string;
  moduleId: string;
}

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
    const context: RollDialogContext = {
      actorData,
      actorName: actor?.name ?? localize("DOCUMENT.Actor", "Actor"),
      disciplineDots: renderDots(actorData.discipline),
      exhaustionDots: renderDots(actorData.exhaustion),
      madnessDots: renderDots(actorData.madnessPermanent),
      moduleId: SYSTEM_ID
    };

    return context as foundry.applications.api.HandlebarsApplicationMixin.RenderContext;
  }

  protected override async _onRender(
    context: object,
    options: object
  ): Promise<void> {
    await super._onRender(context, options as never);

    const madnessInput = this.element.querySelector<HTMLInputElement>(
      'input[name="madnessTemp"]'
    );
    const madnessOutput = this.element.querySelector<HTMLOutputElement>(
      "[data-yakov-dryh-madness-output]"
    );
    const cancelButton = this.element.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="cancel-roll"]'
    );
    const rollButton = this.element.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="submit-roll"]'
    );
    const syncMadnessValue = () => {
      const currentValue = madnessInput?.value ?? "0";

      if (madnessOutput) {
        madnessOutput.textContent = currentValue;
        madnessOutput.value = currentValue;
      }
    };

    madnessInput?.addEventListener("input", syncMadnessValue);
    cancelButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.close();
    });
    rollButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.submitRoll();
    });

    syncMadnessValue();
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
    const painInput = this.form?.elements.namedItem("painDice") as
      | HTMLInputElement
      | null;
    const actorData = normalizeCharacterSystemData(actor.system);
    const addExhaustion = addExhaustionInput?.checked ?? false;
    const madnessTemp = Math.min(
      Math.max(Number.parseInt(madnessInput?.value ?? "0", 10) || 0, 0),
      DRYH_TEMP_MADNESS_MAX
    );
    const painDice = Math.max(Number.parseInt(painInput?.value ?? "0", 10) || 0, 0);
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
        pain: painDice
      })
    });

    await this.close();
  }
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;
  return localizedValue === key ? fallback : localizedValue;
}

function renderDots(value: number): string {
  if (value <= 0) {
    return "0";
  }

  return "●".repeat(value);
}
