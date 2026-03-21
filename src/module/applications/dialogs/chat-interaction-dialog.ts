import {
  advanceChatCardStatus,
  createDefaultChatCardData,
  formatChatCardStatus,
  getChatCardData,
  updateChatCardContent,
  type YakovDryhChatCardData
} from "../../chat/chat-card-service.js";
import {
  CHAT_CARD_STATUSES,
  SYSTEM_ID,
  SYSTEM_TITLE,
  TEMPLATE_PATHS,
  type YakovDryhChatCardStatus
} from "../../constants.js";

const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
);

interface ChatInteractionDialogContext extends Record<string, unknown> {
  card: YakovDryhChatCardData;
  messageId: string;
  moduleId: string;
  statusLabel: string;
  statusOptions: Array<{
    label: string;
    selected: boolean;
    value: YakovDryhChatCardStatus;
  }>;
}

export class YakovDryhChatInteractionDialog extends BaseApplication {
  static override DEFAULT_OPTIONS = {
    classes: [SYSTEM_ID, "yakov-dryh-dialog"],
    position: {
      height: "auto" as const,
      width: 560
    },
    tag: "section",
    window: {
      icon: "fa-solid fa-comments",
      resizable: true,
      title: "Yakov Dryh Chat Interaction"
    }
  };

  static override PARTS = {
    content: {
      root: true,
      template: TEMPLATE_PATHS.chatInteractionDialog
    }
  };

  readonly messageId: string;

  constructor(message: ChatMessage.Implementation) {
    super();
    this.messageId = message.id ?? "";
  }

  get message(): ChatMessage.Implementation | null {
    if (!this.messageId) {
      return null;
    }

    return game.messages?.get(this.messageId) ?? null;
  }

  override get title(): string {
    const speakerLabel =
      this.message?.speaker.alias ?? this.message?.author?.name ?? "Chat";

    return `${SYSTEM_TITLE}: ${speakerLabel}`;
  }

  protected override async _prepareContext(
    _options: object
  ): Promise<foundry.applications.api.HandlebarsApplicationMixin.RenderContext> {
    const card = this.message
      ? getChatCardData(this.message)
      : createDefaultChatCardData();
    const context: ChatInteractionDialogContext = {
      card,
      messageId: this.messageId,
      moduleId: SYSTEM_ID,
      statusLabel: formatChatCardStatus(card.status),
      statusOptions: CHAT_CARD_STATUSES.map((status) => ({
        label: formatChatCardStatus(status),
        selected: card.status === status,
        value: status
      }))
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

    const applyButton = root.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="apply-updates"]'
    );
    const advanceButton = root.querySelector<HTMLElement>(
      '[data-yakov-dryh-action="advance-status"]'
    );

    applyButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.applyUpdates(root);
    });

    advanceButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void this.advanceStatus();
    });
  }

  private async applyUpdates(root: HTMLElement): Promise<void> {
    const message = this.message;

    if (!message) {
      ui.notifications?.warn(
        game.i18n?.localize("YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable") ??
          "Chat message is no longer available."
      );

      return;
    }

    const summaryInput = root.querySelector<HTMLInputElement>(
      'input[name="summary"]'
    );
    const detailInput = root.querySelector<HTMLTextAreaElement>(
      'textarea[name="detail"]'
    );
    const statusInput = root.querySelector<HTMLSelectElement>(
      'select[name="status"]'
    );

    await updateChatCardContent(message, {
      detail: detailInput?.value ?? "",
      status: statusInput?.value as YakovDryhChatCardStatus | undefined,
      summary: summaryInput?.value ?? ""
    });

    await this.render({ force: true });
  }

  private async advanceStatus(): Promise<void> {
    const message = this.message;

    if (!message) {
      ui.notifications?.warn(
        game.i18n?.localize("YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable") ??
          "Chat message is no longer available."
      );

      return;
    }

    await advanceChatCardStatus(message);
    await this.render({ force: true });
  }
}
