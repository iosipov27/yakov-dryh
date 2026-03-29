import { advanceChatCardStatus, createDefaultChatCardData, formatChatCardStatus, getChatCardData, updateChatCardContent } from "../../chat/chat-card-service.js";
import { CHAT_CARD_STATUSES, SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
export class YakovDryhChatInteractionDialog extends BaseApplication {
    boundRoot = null;
    handleRootClickBound;
    static DEFAULT_OPTIONS = {
        classes: [SYSTEM_ID, "yakov-dryh-dialog"],
        position: {
            height: "auto",
            width: 560
        },
        tag: "section",
        window: {
            icon: "fa-solid fa-comments",
            resizable: true,
            title: "Yakov Dryh Chat Interaction"
        }
    };
    static PARTS = {
        content: {
            root: true,
            template: TEMPLATE_PATHS.chatInteractionDialog
        }
    };
    messageId;
    constructor(message) {
        super();
        this.messageId = message.id ?? "";
        this.handleRootClickBound = this.handleRootClick.bind(this);
    }
    get message() {
        if (!this.messageId) {
            return null;
        }
        return game.messages?.get(this.messageId) ?? null;
    }
    get title() {
        const speakerLabel = this.message?.speaker.alias ?? this.message?.author?.name ?? "Chat";
        return `${SYSTEM_TITLE}: ${speakerLabel}`;
    }
    async _prepareContext(_options) {
        const card = this.message
            ? getChatCardData(this.message)
            : createDefaultChatCardData();
        const context = {
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
        return context;
    }
    async _onRender(context, options) {
        await super._onRender(context, options);
        const root = this.element;
        if (!(root instanceof HTMLElement)) {
            return;
        }
        this.bindRootListeners(root);
    }
    async applyUpdates(root) {
        const message = this.message;
        if (!message) {
            ui.notifications?.warn(game.i18n?.localize("YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable") ??
                "Chat message is no longer available.");
            return;
        }
        const summaryInput = root.querySelector('input[name="summary"]');
        const detailInput = root.querySelector('textarea[name="detail"]');
        const statusInput = root.querySelector('select[name="status"]');
        await updateChatCardContent(message, {
            detail: detailInput?.value ?? "",
            status: statusInput?.value,
            summary: summaryInput?.value ?? ""
        });
        await this.render({ force: true });
    }
    async advanceStatus() {
        const message = this.message;
        if (!message) {
            ui.notifications?.warn(game.i18n?.localize("YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable") ??
                "Chat message is no longer available.");
            return;
        }
        await advanceChatCardStatus(message);
        await this.render({ force: true });
    }
    bindRootListeners(root) {
        if (this.boundRoot === root) {
            return;
        }
        this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
        root.addEventListener("click", this.handleRootClickBound);
        this.boundRoot = root;
    }
    handleRootClick(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const actionElement = target.closest("[data-yakov-dryh-action]");
        if (!actionElement) {
            return;
        }
        const root = this.boundRoot;
        event.preventDefault();
        switch (actionElement.dataset.yakovDryhAction) {
            case "apply-updates":
                if (root) {
                    void this.applyUpdates(root);
                }
                break;
            case "advance-status":
                void this.advanceStatus();
                break;
        }
    }
}
//# sourceMappingURL=chat-interaction-dialog.js.map