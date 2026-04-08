import {
  finalizeDryhRollWithPain,
  getDryhRollCardData
} from "../../chat/roll-card-service.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";

const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface PainRollDialogContext extends Record<string, unknown> {
  actorName: string;
  moduleId: string;
}

export class YakovDryhPainRollDialog extends BaseApplication {
  private boundRoot: HTMLElement | null = null;
  private readonly handleRootClickBound: (event: MouseEvent) => void;

  static override DEFAULT_OPTIONS = {
    classes: [SYSTEM_ID, "yakov-dryh-dialog", "yakov-dryh-pain-roll-dialog"],
    form: {
      closeOnSubmit: false
    },
    position: {
      height: "auto" as const,
      width: 420
    },
    tag: "form",
    window: {
      icon: "fa-solid fa-dice-d6",
      resizable: false,
      title: "Don't Rest Your Head Pain Roll"
    }
  };

  static override PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.dryhPainRollDialog
    }
  };

  readonly messageId: string;

  constructor(message: ChatMessage.Implementation) {
    super();
    this.messageId = message.id ?? "";
    this.handleRootClickBound = this.handleRootClick.bind(this);
  }

  static async openForMessage(
    message: ChatMessage.Implementation
  ): Promise<YakovDryhPainRollDialog> {
    const dialog = new YakovDryhPainRollDialog(message);

    await dialog.render({ force: true });

    return dialog;
  }

  get message(): ChatMessage.Implementation | null {
    if (!this.messageId) {
      return null;
    }

    return game.messages?.get(this.messageId) ?? null;
  }

  override get title(): string {
    const actorName = this.message
      ? getDryhRollCardData(this.message).actorName
      : localize("DOCUMENT.Actor", "Actor");

    return `${SYSTEM_TITLE}: ${actorName}`;
  }

  protected override async _prepareContext(
    _options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const actorName = this.message
      ? getDryhRollCardData(this.message).actorName
      : localize("DOCUMENT.Actor", "Actor");
    const context: PainRollDialogContext = {
      actorName,
      moduleId: SYSTEM_ID
    };

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

    this.bindRootListeners(root);
  }

  private async submitPainRoll(): Promise<void> {
    const message = this.message;

    if (!message) {
      ui.notifications?.warn(
        localize(
          "YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable",
          "Chat message is no longer available."
        )
      );

      return;
    }

    const painInput = this.form?.elements.namedItem("painDice") as
      | HTMLInputElement
      | null;
    const painDice = Math.max(Number.parseInt(painInput?.value ?? "1", 10) || 1, 1);

    await finalizeDryhRollWithPain(message, painDice);
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

    const actionElement = target.closest<HTMLElement>("[data-yakov-dryh-action]");

    if (!actionElement) {
      return;
    }

    event.preventDefault();

    switch (actionElement.dataset.yakovDryhAction) {
      case "cancel-pain-roll":
        void this.close();
        break;

      case "submit-pain-roll":
        void this.submitPainRoll();
        break;
    }
  }
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;
  return localizedValue === key ? fallback : localizedValue;
}
