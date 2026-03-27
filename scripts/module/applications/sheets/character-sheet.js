import { YakovDryhRollDialog } from "../dialogs/roll-dialog.js";
import { addResponseSlot as addResponseSlotData, DRYH_EXHAUSTION_MAX, DRYH_RESPONSE_MAX, YAKOV_DRYH_RESPONSE_TYPES, countConfiguredResponses, countResponsesByType, createDefaultResponsesData, hasCheckedResponses, normalizeCharacterSystemData, YAKOV_DRYH_ACTOR_TYPES } from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { formatLineList, parseLineList } from "../../utils/index.js";
const BaseSheet = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
const SHEET_DICE_POOL_BASE_TOTAL = 6;
const STRESS_CARD_VISUAL_MAX = 6;
const RESPONSE_TYPE_ORDER = [
    YAKOV_DRYH_RESPONSE_TYPES.fight,
    YAKOV_DRYH_RESPONSE_TYPES.flight
];
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
    get title() {
        const actorName = this.actor?.name ?? game.i18n?.localize("DOCUMENT.Actor") ?? "Actor";
        return `${SYSTEM_TITLE}: ${actorName}`;
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const actor = this.actor;
        const actorData = normalizeCharacterSystemData(actor?.system);
        const actorType = actor?.type ?? YAKOV_DRYH_ACTOR_TYPES.character;
        const disciplineLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Discipline", "Discipline");
        const exhaustionLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Exhaustion", "Exhaustion");
        const madnessLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.PermanentMadness", "Madness");
        const responsesLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Responses", "Responses");
        const fightLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Fight", "Fight");
        const flightLabel = localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Flight", "Flight");
        const liveResponses = actorData.responses;
        const responseEditorData = createResponseEditorData(this.responseEditSlots, liveResponses);
        const configuredResponseCount = countConfiguredResponses(responseEditorData);
        const isEditingResponses = this.responseEditSlots !== null;
        const isPlayMode = !isEditingResponses && configuredResponseCount === DRYH_RESPONSE_MAX;
        const responseRemaining = Math.max(DRYH_RESPONSE_MAX - configuredResponseCount, 0);
        Object.assign(context, {
            actorData,
            actorName: actor?.name ?? "",
            actorType,
            actorTypeLabel: localizeActorType(actorType),
            disciplinePips: createEditablePips("discipline", actorData.discipline, getEditablePoolTotal(actorData.discipline), disciplineLabel),
            disciplinePipTotal: getEditablePoolTotal(actorData.discipline),
            exhaustionPips: createEditablePips("exhaustion", actorData.exhaustion, getEditablePoolTotal(actorData.exhaustion), exhaustionLabel),
            exhaustionCardStyle: createStressCardStyle(actorData.exhaustion),
            exhaustionPipTotal: getEditablePoolTotal(actorData.exhaustion),
            madnessPips: createEditablePips("madnessPermanent", actorData.madnessPermanent, getEditablePoolTotal(actorData.madnessPermanent), madnessLabel),
            madnessCardStyle: createStressCardStyle(actorData.madnessPermanent),
            madnessPipTotal: getEditablePoolTotal(actorData.madnessPermanent),
            moduleId: SYSTEM_ID,
            responseAllocationRows: createResponseAllocationRows(responseEditorData, {
                fightLabel,
                flightLabel
            }),
            responseCanAddMore: configuredResponseCount < DRYH_RESPONSE_MAX,
            responseCanSave: isEditingResponses && configuredResponseCount === DRYH_RESPONSE_MAX,
            responseIsAllocationMode: !isEditingResponses && configuredResponseCount < DRYH_RESPONSE_MAX,
            responseIsEditMode: isEditingResponses,
            responseIsPlayMode: isPlayMode,
            responseMax: DRYH_RESPONSE_MAX,
            responsePlayRows: createResponsePlayRows(liveResponses, {
                fightLabel,
                flightLabel,
                responsesLabel
            }),
            responseRemainingLabel: formatLocalization("YAKOV_DRYH.SHEETS.Actor.Character.Fields.ResponsesRemaining", { remaining: responseRemaining }, `Remaining: ${responseRemaining}`),
            scarsText: formatLineList(actorData.scars)
        });
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
    async openRollDialog() {
        if (!this.actor) {
            return;
        }
        await YakovDryhRollDialog.openForActor(this.actor);
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
        if (actionElement.dataset.yakovDryhAction === "open-roll-dialog") {
            void this.openRollDialog();
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
        if (target instanceof HTMLInputElement && target.dataset.yakovDryhResponseToggle) {
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
        if (!currentSlot || currentSlot.type === "" || currentSlot.checked === checked) {
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
function createResponseEditorData(editSlots, liveResponses) {
    return editSlots === null
        ? liveResponses
        : {
            max: DRYH_RESPONSE_MAX,
            slots: editSlots
        };
}
function createResponseAllocationRows(responses, labels) {
    const configuredCount = countConfiguredResponses(responses);
    return RESPONSE_TYPE_ORDER
        .map((type) => {
        const count = countResponsesByType(responses, type);
        if (configuredCount === DRYH_RESPONSE_MAX && count === 0) {
            return null;
        }
        const label = type === YAKOV_DRYH_RESPONSE_TYPES.fight ? labels.fightLabel : labels.flightLabel;
        return {
            addLabel: `${localize("YAKOV_DRYH.SHEETS.Actor.Character.Actions.AddResponse", "Add Response")} (${label})`,
            checkboxes: Array.from({ length: count }, (_entry, index) => ({
                label: `${label} ${index + 1}`
            })),
            label,
            type
        };
    })
        .filter((row) => row !== null);
}
function createResponsePlayRows(responses, labels) {
    return RESPONSE_TYPE_ORDER
        .map((type) => {
        const label = type === YAKOV_DRYH_RESPONSE_TYPES.fight ? labels.fightLabel : labels.flightLabel;
        const checkboxes = responses.slots
            .map((slot, index) => ({ index, slot }))
            .filter(({ slot }) => slot.type === type)
            .map(({ index, slot }, slotIndex) => ({
            checked: slot.checked,
            index,
            label: `${labels.responsesLabel} ${label} ${slotIndex + 1}`
        }));
        return checkboxes.length > 0
            ? {
                checkboxes,
                label,
                type
            }
            : null;
    })
        .filter((row) => row !== null);
}
function createEditablePips(field, value, total, label) {
    const normalizedTotal = Math.max(total, 0);
    return Array.from({ length: normalizedTotal }, (_entry, index) => {
        const filled = index < value;
        const canDecrease = value > 0 && index === value - 1;
        const canIncrease = index === value && value < normalizedTotal;
        return {
            action: canDecrease ? "decrease" : canIncrease ? "increase" : null,
            field,
            filled,
            iconClass: canDecrease ? "fa-solid fa-trash-can" : canIncrease ? "fa-solid fa-plus" : null,
            tooltip: canDecrease
                ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
                : canIncrease
                    ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
                    : null
        };
    });
}
function getEditablePoolTotal(value) {
    return Math.max(value, SHEET_DICE_POOL_BASE_TOTAL);
}
function createStressCardStyle(value) {
    const clampedValue = Math.min(Math.max(value, 0), STRESS_CARD_VISUAL_MAX);
    const intensity = clampedValue / STRESS_CARD_VISUAL_MAX;
    const dangerStop = `${(intensity * 100).toFixed(2)}%`;
    const safeStop = `${(100 - intensity * 100).toFixed(2)}%`;
    const sheen = (0.86 - intensity * 0.16).toFixed(3);
    return [
        `--yakov-dryh-stress-intensity: ${intensity.toFixed(3)}`,
        `--yakov-dryh-stress-sheen: ${sheen}`,
        `--yakov-dryh-stress-safe-stop: ${safeStop}`,
        `--yakov-dryh-stress-danger-stop: ${dangerStop}`
    ].join("; ");
}
function localizeActorType(actorType) {
    const localizationKey = `TYPES.Actor.${actorType}`;
    const localizedActorType = game.i18n?.localize(localizationKey) ?? localizationKey;
    return localizedActorType === localizationKey ? actorType : localizedActorType;
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function formatLocalization(key, data, fallback) {
    const formatData = Object.fromEntries(Object.entries(data).map(([entryKey, value]) => [entryKey, String(value)]));
    const localizedValue = game.i18n?.format(key, formatData) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function normalizeResponseType(value) {
    return value === YAKOV_DRYH_RESPONSE_TYPES.fight ||
        value === YAKOV_DRYH_RESPONSE_TYPES.flight
        ? value
        : "";
}
//# sourceMappingURL=character-sheet.js.map