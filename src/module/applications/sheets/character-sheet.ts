import { createInteractiveChatMessage } from "../../chat/chat-card-service.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";

const BaseSheet = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface CharacterSheetContext extends Record<string, unknown> {
  actorName: string;
  actorType: string;
  chatCapability: string;
  dialogCapability: string;
  moduleId: string;
  sheetCapability: string;
}

export class YakovDryhCharacterSheet extends BaseSheet {
  static override DEFAULT_OPTIONS = {
    classes: [SYSTEM_ID, "yakov-dryh-sheet"],
    position: {
      height: "auto" as const,
      width: 720
    },
    tag: "section",
    window: {
      icon: "fa-solid fa-address-card",
      resizable: true,
      title: "Yakov Dryh Character Sheet"
    }
  };

  static override PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.characterSheet
    }
  };

  readonly actorId: string;

  constructor(actor: Actor.Implementation) {
    super();
    this.actorId = actor.id ?? "";
  }

  get actor(): Actor.Implementation | null {
    if (!this.actorId) {
      return null;
    }

    return game.actors?.get(this.actorId) ?? null;
  }

  override get title(): string {
    const actorName = this.actor?.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor";

    return `${SYSTEM_TITLE}: ${actorName}`;
  }

  protected override async _prepareContext(
    options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const context = (await super._prepareContext(options as never)) as CharacterSheetContext;
    const actor = this.actor;

    context.actorName = actor?.name ?? "Unbound actor";
    context.actorType = actor?.type ?? "unknown";
    context.chatCapability =
      "Chat cards are designed as mutable views that can react to later user actions and popup workflows.";
    context.dialogCapability =
      "Complex popup windows should orchestrate focused editing, validation and multi-step interactions.";
    context.moduleId = SYSTEM_ID;
    context.sheetCapability =
      "Character sheets are the stable anchor for actor-centric workflows and future command surfaces.";

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

    const createChatCardButton = root.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="create-chat-card"]'
    );

    createChatCardButton?.addEventListener("click", (event) => {
      event.preventDefault();

      const actor = this.actor;

      if (!actor) {
        ui.notifications?.warn("Actor is no longer available.");
        return;
      }

      void createInteractiveChatMessage({
        actorName: actor.name ?? null,
        actorUuid: actor.uuid,
        summary: `Interactive workflow opened from ${actor.name ?? "actor"}`
      });
    });
  }
}
