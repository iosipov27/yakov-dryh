import { YakovDryhRollDialog } from "../dialogs/roll-dialog.js";
import { DRYH_EXHAUSTION_MAX, DRYH_RESPONSE_MAX, YAKOV_DRYH_RESPONSE_TYPES, normalizeCharacterSystemData, YAKOV_DRYH_ACTOR_TYPES } from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { formatLineList, parseLineList } from "../../utils/index.js";
const BaseSheet = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
const SHEET_DICE_POOL_BASE_TOTAL = 6;
const STRESS_CARD_VISUAL_MAX = 6;
export class YakovDryhCharacterSheet extends BaseSheet {
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
        const responseRows = actorData.responses.slots.map((slot, index) => createResponseRow(slot, index, responsesLabel));
        Object.assign(context, {
            actorData,
            actorName: actor?.name ?? "",
            actorType,
            actorTypeLabel: localizeActorType(actorType),
            disciplinePips: createEditablePips("discipline", actorData.discipline, getEditablePoolTotal(actorData.discipline), disciplineLabel),
            disciplinePipTotal: getEditablePoolTotal(actorData.discipline),
            exhaustionPips: createEditablePips("exhaustion", actorData.exhaustion, DRYH_EXHAUSTION_MAX, exhaustionLabel),
            exhaustionCardStyle: createStressCardStyle(actorData.exhaustion),
            exhaustionPipTotal: DRYH_EXHAUSTION_MAX,
            madnessPips: createEditablePips("madnessPermanent", actorData.madnessPermanent, getEditablePoolTotal(actorData.madnessPermanent), madnessLabel),
            madnessCardStyle: createStressCardStyle(actorData.madnessPermanent),
            madnessPipTotal: getEditablePoolTotal(actorData.madnessPermanent),
            moduleId: SYSTEM_ID,
            responseRows,
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
        const rollButton = root.querySelector('[data-yakov-dryh-action="open-roll-dialog"]');
        const responseChecks = root.querySelectorAll("[data-yakov-dryh-response-check]");
        const responseTypes = root.querySelectorAll("[data-yakov-dryh-response-type]");
        const poolButtons = root.querySelectorAll("[data-yakov-dryh-pool-action]");
        const scarsInput = root.querySelector('textarea[data-yakov-dryh-field="scars"]');
        rollButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.openRollDialog();
        });
        responseChecks.forEach((input) => {
            input.addEventListener("change", () => {
                void this.updateResponseChecked(Number.parseInt(input.dataset.yakovDryhResponseCheck ?? "", 10), input.checked);
            });
        });
        responseTypes.forEach((input) => {
            input.addEventListener("change", () => {
                void this.updateResponseType(Number.parseInt(input.dataset.yakovDryhResponseType ?? "", 10), input.value);
            });
        });
        poolButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                void this.updatePoolFromAction(button.dataset.yakovDryhPoolField, button.dataset.yakovDryhPoolAction);
            });
        });
        scarsInput?.addEventListener("change", () => {
            void this.updateScars(scarsInput.value);
        });
    }
    async openRollDialog() {
        if (!this.actor) {
            return;
        }
        await YakovDryhRollDialog.openForActor(this.actor);
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
    async updateResponseType(slotIndex, value) {
        const actor = this.actor;
        if (!actor || !Number.isInteger(slotIndex) || slotIndex < 0) {
            return;
        }
        const currentData = normalizeCharacterSystemData(actor.system);
        const currentSlot = currentData.responses.slots[slotIndex];
        if (!currentSlot) {
            return;
        }
        const type = normalizeResponseType(value);
        if (currentSlot.type === type) {
            return;
        }
        await actor.update({
            "system.responses.slots": currentData.responses.slots.map((slot, index) => index === slotIndex
                ? {
                    checked: type === "" ? false : slot.checked,
                    type
                }
                : slot),
            "system.responses.max": DRYH_RESPONSE_MAX
        });
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
function createResponseRow(slot, index, label) {
    return {
        checked: slot.checked,
        index,
        isConfigured: slot.type !== "",
        isFight: slot.type === YAKOV_DRYH_RESPONSE_TYPES.fight,
        isFlight: slot.type === YAKOV_DRYH_RESPONSE_TYPES.flight,
        label: `${label} ${index + 1}`
    };
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
function normalizeResponseType(value) {
    return value === YAKOV_DRYH_RESPONSE_TYPES.fight ||
        value === YAKOV_DRYH_RESPONSE_TYPES.flight
        ? value
        : "";
}
//# sourceMappingURL=character-sheet.js.map