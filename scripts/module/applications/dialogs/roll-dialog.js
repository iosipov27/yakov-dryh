import { createDryhInitialRollMessage } from "../../chat/roll-card-service.js";
import { DRYH_EXHAUSTION_MAX, DRYH_TEMP_MADNESS_MAX, normalizeCharacterSystemData } from "../../data/index.js";
import { rollDryhCheck } from "../../dice/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
const BaseApplication = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
export class YakovDryhRollDialog extends BaseApplication {
    static DEFAULT_OPTIONS = {
        classes: [SYSTEM_ID, "yakov-dryh-dialog", "yakov-dryh-roll-dialog"],
        form: {
            closeOnSubmit: false
        },
        position: {
            height: "auto",
            width: 480
        },
        tag: "form",
        window: {
            icon: "fa-solid fa-dice-d6",
            resizable: false,
            title: "Yakov Dryh Roll"
        }
    };
    static PARTS = {
        content: {
            root: true,
            template: TEMPLATE_PATHS.dryhRollDialog
        }
    };
    actorDocument;
    constructor(actor) {
        super();
        this.actorDocument = actor;
    }
    static async openForActor(actor) {
        const dialog = new YakovDryhRollDialog(actor);
        await dialog.render({ force: true });
        return dialog;
    }
    get actor() {
        return this.actorDocument;
    }
    get title() {
        const actorName = this.actor?.name ?? localize("DOCUMENT.Actor", "Actor");
        return `${SYSTEM_TITLE}: ${actorName}`;
    }
    async _prepareContext(_options) {
        const actor = this.actor;
        const actorData = normalizeCharacterSystemData(actor?.system);
        const addExhaustionMax = actorData.exhaustion < DRYH_EXHAUSTION_MAX ? 1 : 0;
        const addExhaustionLabel = localize("YAKOV_DRYH.ROLL.Dialog.AddExhaustion", "Take +1 Exhaustion");
        const temporaryMadnessLabel = localize("YAKOV_DRYH.ROLL.Dialog.TemporaryMadness", "Temporary Madness");
        const context = {
            addExhaustionPips: createRollDialogPips(0, addExhaustionMax, addExhaustionLabel),
            addExhaustionMax,
            actorData,
            actorName: actor?.name ?? localize("DOCUMENT.Actor", "Actor"),
            addExhaustionValue: 0,
            disciplinePips: createDisplayPips(actorData.discipline, actorData.discipline),
            exhaustionPips: createDisplayPips(actorData.exhaustion, actorData.exhaustion),
            madnessPips: createDisplayPips(actorData.madnessPermanent, actorData.madnessPermanent),
            madnessTempPips: createRollDialogPips(0, DRYH_TEMP_MADNESS_MAX, temporaryMadnessLabel),
            madnessTempValue: 0,
            moduleId: SYSTEM_ID
        };
        return context;
    }
    async _onRender(context, options) {
        await super._onRender(context, options);
        const actorData = normalizeCharacterSystemData(this.actor?.system);
        const addExhaustionInput = this.element.querySelector('input[name="addExhaustion"]');
        const madnessInput = this.element.querySelector('input[name="madnessTemp"]');
        const poolButtons = this.element.querySelectorAll("[data-yakov-dryh-dialog-pool]");
        const cancelButton = this.element.querySelector('[data-yakov-dryh-action="cancel-roll"]');
        const rollButton = this.element.querySelector('[data-yakov-dryh-action="submit-roll"]');
        const syncDialogPools = () => {
            syncAddExhaustionPool(this.element, actorData.exhaustion, addExhaustionInput?.value ?? "0", getDialogPoolMax(this.element, "addExhaustion"), localize("YAKOV_DRYH.ROLL.Dialog.AddExhaustion", "Take +1 Exhaustion"));
            syncMadnessPool(this.element, actorData.madnessPermanent, madnessInput?.value ?? "0", DRYH_TEMP_MADNESS_MAX, localize("YAKOV_DRYH.ROLL.Dialog.TemporaryMadness", "Temporary Madness"));
        };
        poolButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const poolName = button.dataset.yakovDryhDialogPool;
                const action = button.dataset.yakovDryhDialogPoolAction;
                if (!poolName || !action) {
                    return;
                }
                const input = this.form?.elements.namedItem(poolName);
                if (!input) {
                    return;
                }
                const maxValue = poolName === "addExhaustion"
                    ? getDialogPoolMax(this.element, "addExhaustion")
                    : DRYH_TEMP_MADNESS_MAX;
                const currentValue = Math.min(Math.max(Number.parseInt(input.value, 10) || 0, 0), maxValue);
                const nextValue = action === "increase"
                    ? Math.min(currentValue + 1, maxValue)
                    : Math.max(currentValue - 1, 0);
                input.value = String(nextValue);
                syncDialogPools();
            });
        });
        cancelButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.close();
        });
        rollButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.submitRoll();
        });
        syncDialogPools();
    }
    async submitRoll() {
        const actor = this.actor;
        if (!actor) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
            return;
        }
        const addExhaustionInput = this.form?.elements.namedItem("addExhaustion");
        const madnessInput = this.form?.elements.namedItem("madnessTemp");
        const actorData = normalizeCharacterSystemData(actor.system);
        const addExhaustion = (Number.parseInt(addExhaustionInput?.value ?? "0", 10) || 0) > 0;
        const madnessTemp = Math.min(Math.max(Number.parseInt(madnessInput?.value ?? "0", 10) || 0, 0), DRYH_TEMP_MADNESS_MAX);
        const nextExhaustion = addExhaustion
            ? Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX)
            : actorData.exhaustion;
        if (addExhaustion && nextExhaustion !== actorData.exhaustion) {
            await actor.update({
                "system.exhaustion": nextExhaustion
            });
        }
        await createDryhInitialRollMessage({
            actor,
            rollResult: rollDryhCheck({
                discipline: actorData.discipline,
                exhaustion: nextExhaustion,
                madness: actorData.madnessPermanent + madnessTemp,
                pain: 0
            })
        });
        await this.close();
    }
}
function createRollDialogPips(value, total, label) {
    const normalizedValue = Math.min(Math.max(value, 0), total);
    return Array.from({ length: total }, (_entry, index) => {
        const filled = index < normalizedValue;
        const canDecrease = normalizedValue > 0 && index === normalizedValue - 1;
        const canIncrease = normalizedValue < total && index === normalizedValue;
        const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;
        return {
            action,
            filled,
            iconClass: canDecrease ? "fa-solid fa-trash-can" : canIncrease ? "fa-solid fa-plus" : null,
            index,
            tooltip: canDecrease
                ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
                : canIncrease
                    ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
                    : null
        };
    });
}
function createDisplayPips(value, total) {
    return Array.from({ length: total }, (_entry, index) => ({
        filled: index < value
    }));
}
function syncAddExhaustionPool(root, currentExhaustion, rawValue, total, label) {
    const normalizedValue = Math.min(Math.max(Number.parseInt(rawValue, 10) || 0, 0), total);
    const buttons = root.querySelectorAll('[data-yakov-dryh-dialog-pool="addExhaustion"]');
    buttons.forEach((button) => {
        const pip = button.querySelector(".yakov-dryh-pip");
        const icon = button.querySelector(".yakov-dryh-dice-picker__action-icon");
        const canDecrease = normalizedValue > 0;
        const canIncrease = normalizedValue < total;
        const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;
        const tooltip = canDecrease
            ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
            : canIncrease
                ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
                : "";
        button.disabled = action === null;
        button.dataset.yakovDryhDialogPoolAction = action ?? "";
        button.classList.toggle("yakov-dryh-dice-picker__pip-control--increase", action === "increase");
        button.classList.toggle("yakov-dryh-dice-picker__pip-control--decrease", action === "decrease");
        button.title = tooltip;
        if (tooltip) {
            button.setAttribute("aria-label", tooltip);
        }
        else {
            button.removeAttribute("aria-label");
        }
        pip?.classList.toggle("yakov-dryh-pip--filled", normalizedValue > 0);
        if (icon) {
            icon.classList.remove("yakov-dryh-dice-picker__action-icon--increase", "yakov-dryh-dice-picker__action-icon--decrease");
            icon.innerHTML =
                action === "increase"
                    ? '<i class="fa-solid fa-plus"></i>'
                    : action === "decrease"
                        ? '<i class="fa-solid fa-trash-can"></i>'
                        : "";
            if (action) {
                icon.classList.add(`yakov-dryh-dice-picker__action-icon--${action}`);
            }
        }
    });
}
function syncMadnessPool(root, permanentMadness, rawValue, total, label) {
    const normalizedValue = Math.min(Math.max(Number.parseInt(rawValue, 10) || 0, 0), total);
    const buttons = root.querySelectorAll('[data-yakov-dryh-dialog-pool="madnessTemp"]');
    buttons.forEach((button, index) => {
        const pip = button.querySelector(".yakov-dryh-pip");
        const icon = button.querySelector(".yakov-dryh-dice-picker__action-icon");
        const canDecrease = normalizedValue > 0 && index === normalizedValue - 1;
        const canIncrease = normalizedValue < total && index === normalizedValue;
        const action = canDecrease ? "decrease" : canIncrease ? "increase" : null;
        const tooltip = canDecrease
            ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${label})`
            : canIncrease
                ? `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${label})`
                : "";
        button.disabled = action === null;
        button.dataset.yakovDryhDialogPoolAction = action ?? "";
        button.classList.toggle("yakov-dryh-dice-picker__pip-control--increase", action === "increase");
        button.classList.toggle("yakov-dryh-dice-picker__pip-control--decrease", action === "decrease");
        button.title = tooltip;
        if (tooltip) {
            button.setAttribute("aria-label", tooltip);
        }
        else {
            button.removeAttribute("aria-label");
        }
        pip?.classList.toggle("yakov-dryh-pip--filled", index < normalizedValue);
        if (icon) {
            icon.classList.remove("yakov-dryh-dice-picker__action-icon--increase", "yakov-dryh-dice-picker__action-icon--decrease");
            icon.innerHTML =
                action === "increase"
                    ? '<i class="fa-solid fa-plus"></i>'
                    : action === "decrease"
                        ? '<i class="fa-solid fa-trash-can"></i>'
                        : "";
            if (action) {
                icon.classList.add(`yakov-dryh-dice-picker__action-icon--${action}`);
            }
        }
    });
}
function getDialogPoolMax(root, poolName) {
    return (Number.parseInt(root.querySelector(`[data-yakov-dryh-dialog-pool-max="${poolName}"]`)?.value ?? "0", 10) || 0);
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
//# sourceMappingURL=roll-dialog.js.map