import { openDryhDiceTrayForActor } from "../../chat/dice-tray-card-service.js";
import { addResponseSlot as addResponseSlotData, countConfiguredResponses, DRYH_EXHAUSTION_MAX, DRYH_RESPONSE_MAX, createDefaultResponsesData, hasCheckedResponses, normalizeCharacterSystemData } from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { parseLineList } from "../../utils/index.js";
import { createCharacterSheetContext } from "./character-sheet-context.js";
import { localize } from "./character-sheet-localization.js";
import { getEditablePoolTotal } from "./character-sheet-pool-helpers.js";
import { createResponseEditorData, normalizeResponseType } from "./character-sheet-response-helpers.js";
const BaseSheet = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
export class YakovDryhCharacterSheet extends BaseSheet {
    boundRoot = null;
    handleRootChangeBound = (event) => {
        this.handleRootChange(event);
    };
    handleRootClickBound = (event) => {
        this.handleRootClick(event);
    };
    responseEditSlots = null;
    static DEFAULT_OPTIONS = {
        classes: ["actor", SYSTEM_ID, "yakov-dryh-sheet"],
        form: {
            closeOnSubmit: false,
            submitOnChange: true
        },
        position: {
            height: "auto",
            width: 700
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
    get title() {
        const actorName = this.actor?.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor";
        return `${SYSTEM_TITLE}: ${actorName}`;
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        Object.assign(context, createCharacterSheetContext({
            actor: this.actor,
            responseEditSlots: this.responseEditSlots
        }));
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
    async addActorPoolToTray() {
        if (!this.actor) {
            return;
        }
        await openDryhDiceTrayForActor(this.actor);
    }
    bindRootListeners(root) {
        if (this.boundRoot === root) {
            return;
        }
        this.boundRoot?.removeEventListener("click", this.handleRootClickBound);
        this.boundRoot?.removeEventListener("change", this.handleRootChangeBound);
        root.addEventListener("click", this.handleRootClickBound);
        root.addEventListener("change", this.handleRootChangeBound);
        this.boundRoot = root;
    }
    handleRootClick(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const actionElement = target.closest("[data-yakov-dryh-action], [data-yakov-dryh-response-action], [data-yakov-dryh-response-add], [data-yakov-dryh-pool-action]");
        if (!actionElement) {
            return;
        }
        event.preventDefault();
        if (actionElement.dataset.yakovDryhAction === "add-pool-to-tray") {
            void this.addActorPoolToTray();
            return;
        }
        if (actionElement.dataset.yakovDryhResponseAdd) {
            void this.addResponseSlot(actionElement.dataset.yakovDryhResponseAdd);
            return;
        }
        switch (actionElement.dataset.yakovDryhResponseAction) {
            case "edit":
                void this.startResponseEdit();
                return;
            case "save":
                void this.saveResponseEdit();
                return;
        }
        const field = actionElement.dataset.yakovDryhPoolField;
        const action = actionElement.dataset.yakovDryhPoolAction;
        if (!field || !action) {
            return;
        }
        void this.updatePoolFromAction(field, action);
    }
    handleRootChange(event) {
        const target = event.target;
        if (target instanceof HTMLInputElement &&
            target.dataset.yakovDryhResponseToggle) {
            void this.updateResponseChecked(Number.parseInt(target.dataset.yakovDryhResponseToggle, 10), target.checked);
            return;
        }
        if (target instanceof HTMLTextAreaElement &&
            target.dataset.yakovDryhField === "scars") {
            void this.updateScars(target.value);
        }
    }
    async updatePoolFromAction(field, action) {
        const actor = this.actor;
        if (!actor) {
            return;
        }
        const actorData = normalizeCharacterSystemData(actor.system);
        const currentValue = actorData[field];
        const maxValue = field === "exhaustion"
            ? DRYH_EXHAUSTION_MAX
            : getEditablePoolTotal(currentValue);
        const nextValue = action === "increase"
            ? Math.min(currentValue + 1, maxValue)
            : Math.max(currentValue - 1, 0);
        if (nextValue === currentValue) {
            return;
        }
        await actor.update({
            [`system.${field}`]: nextValue
        });
    }
    async updateResponseChecked(slotIndex, checked) {
        const actor = this.actor;
        if (!actor || !Number.isInteger(slotIndex) || slotIndex < 0) {
            return;
        }
        const currentData = normalizeCharacterSystemData(actor.system);
        const currentSlot = currentData.responses.slots[slotIndex];
        if (!currentSlot ||
            currentSlot.type === "" ||
            currentSlot.checked === checked) {
            return;
        }
        await actor.update({
            "system.responses.slots": currentData.responses.slots.map((slot, index) => index === slotIndex
                ? {
                    ...slot,
                    checked
                }
                : slot),
            "system.responses.max": DRYH_RESPONSE_MAX
        });
    }
    async addResponseSlot(value) {
        const actor = this.actor;
        const type = normalizeResponseType(value);
        if (!actor || type === "") {
            return;
        }
        const currentResponses = createResponseEditorData(this.responseEditSlots, normalizeCharacterSystemData(actor.system).responses);
        const updatedResponses = addResponseSlotData(currentResponses, type);
        if (!updatedResponses) {
            return;
        }
        if (this.responseEditSlots !== null) {
            this.responseEditSlots = updatedResponses.slots;
            await this.render({ force: true });
            return;
        }
        await actor.update({
            "system.responses.slots": updatedResponses.slots,
            "system.responses.max": DRYH_RESPONSE_MAX
        });
    }
    async startResponseEdit() {
        const actor = this.actor;
        if (!actor) {
            return;
        }
        const currentResponses = normalizeCharacterSystemData(actor.system).responses;
        if (hasCheckedResponses(currentResponses)) {
            const confirmed = await this.confirmResponseEditReset();
            if (!confirmed) {
                return;
            }
        }
        this.responseEditSlots = createDefaultResponsesData().slots;
        await this.render({ force: true });
    }
    async saveResponseEdit() {
        const actor = this.actor;
        if (!actor || this.responseEditSlots === null) {
            return;
        }
        const updatedResponses = createResponseEditorData(this.responseEditSlots, normalizeCharacterSystemData(actor.system).responses);
        if (countConfiguredResponses(updatedResponses) !== DRYH_RESPONSE_MAX) {
            return;
        }
        const editSlots = this.responseEditSlots;
        this.responseEditSlots = null;
        try {
            await actor.update({
                "system.responses.slots": updatedResponses.slots,
                "system.responses.max": DRYH_RESPONSE_MAX
            });
        }
        catch (error) {
            this.responseEditSlots = editSlots;
            throw error;
        }
    }
    async confirmResponseEditReset() {
        const action = await foundry.applications.api.DialogV2.wait({
            buttons: [
                {
                    action: "cancel",
                    label: localize("YAKOV_DRYH.SHEETS.Actor.Character.Actions.Cancel", "Cancel")
                },
                {
                    action: "edit",
                    default: true,
                    label: localize("YAKOV_DRYH.SHEETS.Actor.Character.Actions.EditResponses", "Edit Responses")
                }
            ],
            content: [
                `<p>${localize("YAKOV_DRYH.SHEETS.Actor.Character.Prompts.EditResponses", "Edit Responses?")}</p>`,
                `<p>${localize("YAKOV_DRYH.SHEETS.Actor.Character.Prompts.EditResponsesWarning", "This will clear all marks.")}</p>`
            ].join(""),
            modal: true,
            rejectClose: false,
            window: {
                title: localize("YAKOV_DRYH.SHEETS.Actor.Character.Actions.EditResponses", "Edit Responses")
            }
        });
        return action === "edit";
    }
    async updateScars(value) {
        if (!this.actor) {
            return;
        }
        await this.actor.update({
            "system.scars": parseLineList(value)
        });
    }
}
//# sourceMappingURL=character-sheet.js.map