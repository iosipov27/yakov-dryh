import { YakovDryhRollDialog } from "../dialogs/roll-dialog.js";
import {
  DRYH_EXHAUSTION_MAX,
  DRYH_RESPONSE_MAX,
  normalizeCharacterSystemData,
  normalizeResponses,
  YAKOV_DRYH_ACTOR_TYPES
} from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { formatLineList, parseLineList } from "../../utils/index.js";

const BaseSheet: any = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
);

interface SheetPip {
  filled: boolean;
}

export class YakovDryhCharacterSheet extends BaseSheet {
  static DEFAULT_OPTIONS = {
    classes: ["actor", SYSTEM_ID, "yakov-dryh-sheet"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },
    position: {
      height: "auto" as const,
      width: 860
    },
    tag: "form",
    window: {
      icon: "fa-solid fa-address-card",
      resizable: true,
      title: "Yakov Dryh Character Sheet"
    }
  };

  static PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.characterSheet
    }
  };

  get title(): string {
    const actorName = this.actor?.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor";

    return `${SYSTEM_TITLE}: ${actorName}`;
  }

  protected async _prepareContext(
    options: any
  ): Promise<any> {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const actorData = normalizeCharacterSystemData(actor?.system);
    const actorType = actor?.type ?? YAKOV_DRYH_ACTOR_TYPES.character;
    const responseFightPips = createPips(
      actorData.responses.fight,
      actorData.responses.max
    );
    const responseFlightPips = createPips(
      actorData.responses.flight,
      actorData.responses.max
    );
    const responsesRemaining = Math.max(
      actorData.responses.max -
        actorData.responses.fight -
        actorData.responses.flight,
      0
    );

    Object.assign(context, {
      actorData,
      actorName: actor?.name ?? "",
      actorType,
      actorTypeLabel: localizeActorType(actorType),
      disciplinePips: createPips(actorData.discipline, Math.max(actorData.discipline, 3)),
      exhaustionPips: createPips(actorData.exhaustion, DRYH_EXHAUSTION_MAX),
      madnessPips: createPips(
        actorData.madnessPermanent,
        Math.max(actorData.madnessPermanent, 3)
      ),
      moduleId: SYSTEM_ID,
      responseFightPips,
      responseFlightPips,
      responsesRemaining,
      scarsText: formatLineList(actorData.scars)
    });

    return context;
  }

  protected async _onRender(
    context: any,
    options: any
  ): Promise<void> {
    await super._onRender(context, options);

    const root = this.element as HTMLElement | null;

    if (!(root instanceof HTMLElement)) {
      return;
    }

    const rollButton = root.querySelector(
      '[data-yakov-dryh-action="open-roll-dialog"]'
    ) as HTMLElement | null;
    const responseInputs = root.querySelectorAll(
      "[data-yakov-dryh-response]"
    ) as NodeListOf<HTMLInputElement>;
    const scarsInput = root.querySelector(
      'textarea[data-yakov-dryh-field="scars"]'
    ) as HTMLTextAreaElement | null;

    rollButton?.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      void this.openRollDialog();
    });
    responseInputs.forEach((input: HTMLInputElement) => {
      input.addEventListener("change", () => {
        void this.updateResponses(
          input.dataset.yakovDryhResponse as "fight" | "flight",
          input.value
        );
      });
    });
    scarsInput?.addEventListener("change", () => {
      void this.updateScars(scarsInput.value);
    });
  }

  private async openRollDialog(): Promise<void> {
    if (!this.actor) {
      return;
    }

    await YakovDryhRollDialog.openForActor(this.actor);
  }

  private async updateResponses(
    changedField: "fight" | "flight",
    value: string
  ): Promise<void> {
    const actor = this.actor;

    if (!actor) {
      return;
    }

    const currentData = normalizeCharacterSystemData(actor.system);
    const numericValue = Number.parseInt(value, 10);
    const responses = normalizeResponses(
      {
        ...currentData.responses,
        [changedField]: Number.isFinite(numericValue) ? numericValue : 0
      },
      changedField
    );

    await actor.update({
      "system.responses.fight": responses.fight,
      "system.responses.flight": responses.flight,
      "system.responses.max": DRYH_RESPONSE_MAX
    } as Record<string, unknown>);
  }

  private async updateScars(value: string): Promise<void> {
    if (!this.actor) {
      return;
    }

    await this.actor.update({
      "system.scars": parseLineList(value)
    } as Record<string, unknown>);
  }
}

function createPips(value: number, total: number): SheetPip[] {
  return Array.from({ length: Math.max(total, 0) }, (_entry, index) => ({
    filled: index < value
  }));
}

function localizeActorType(actorType: string): string {
  const localizationKey = `TYPES.Actor.${actorType}`;
  const localizedActorType = game.i18n?.localize(localizationKey) ?? localizationKey;

  return localizedActorType === localizationKey ? actorType : localizedActorType;
}
