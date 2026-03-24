import { finalizeDryhRollWithPain, getDryhRollCardData } from "../../chat/roll-card-service.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
export class YakovDryhPainRollDialog extends BaseApplication {
    boundRoot = null;
    handleRootClickBound;
    static DEFAULT_OPTIONS = {
        classes: [SYSTEM_ID, "yakov-dryh-dialog", "yakov-dryh-pain-roll-dialog"],
        form: {
            closeOnSubmit: false
        },
        position: {
            height: "auto",
            width: 420
        },
        tag: "form",
        window: {
            icon: "fa-solid fa-dice-d6",
            resizable: false,
            title: "Yakov Dryh Pain Roll"
        }
    };
    static PARTS = {
        content: {
            root: true,
            template: TEMPLATE_PATHS.dryhPainRollDialog
        }
    };
    messageId;
    constructor(message) {
        super();
        this.messageId = message.id ?? "";
        this.handleRootClickBound = this.handleRootClick.bind(this);
    }
    static async openForMessage(message) {
        const dialog = new YakovDryhPainRollDialog(message);
        await dialog.render({ force: true });
        return dialog;
    }
    get message() {
        if (!this.messageId) {
            return null;
        }
        return game.messages?.get(this.messageId) ?? null;
    }
    get title() {
        const actorName = this.message
            ? getDryhRollCardData(this.message).actorName
            : localize("DOCUMENT.Actor", "Actor");
        return `${SYSTEM_TITLE}: ${actorName}`;
    }
    async _prepareContext(_options) {
        const actorName = this.message
            ? getDryhRollCardData(this.message).actorName
            : localize("DOCUMENT.Actor", "Actor");
        const context = {
            actorName,
            moduleId: SYSTEM_ID
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
    async submitPainRoll() {
        const message = this.message;
        if (!message) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ChatMessageUnavailable", "Chat message is no longer available."));
            return;
        }
        const painInput = this.form?.elements.namedItem("painDice");
        const painDice = Math.max(Number.parseInt(painInput?.value ?? "1", 10) || 1, 1);
        await finalizeDryhRollWithPain(message, painDice);
        await this.close();
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
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
//# sourceMappingURL=pain-roll-dialog.js.map