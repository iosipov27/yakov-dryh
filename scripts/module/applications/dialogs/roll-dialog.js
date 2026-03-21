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
        const context = {
            actorData,
            actorName: actor?.name ?? localize("DOCUMENT.Actor", "Actor"),
            disciplineDots: renderDots(actorData.discipline),
            exhaustionDots: renderDots(actorData.exhaustion),
            madnessDots: renderDots(actorData.madnessPermanent),
            moduleId: SYSTEM_ID
        };
        return context;
    }
    async _onRender(context, options) {
        await super._onRender(context, options);
        const madnessInput = this.element.querySelector('input[name="madnessTemp"]');
        const madnessOutput = this.element.querySelector("[data-yakov-dryh-madness-output]");
        const cancelButton = this.element.querySelector('[data-yakov-dryh-action="cancel-roll"]');
        const rollButton = this.element.querySelector('[data-yakov-dryh-action="submit-roll"]');
        const syncMadnessValue = () => {
            const currentValue = madnessInput?.value ?? "0";
            if (madnessOutput) {
                madnessOutput.textContent = currentValue;
                madnessOutput.value = currentValue;
            }
        };
        madnessInput?.addEventListener("input", syncMadnessValue);
        cancelButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.close();
        });
        rollButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.submitRoll();
        });
        syncMadnessValue();
    }
    async submitRoll() {
        const actor = this.actor;
        if (!actor) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
            return;
        }
        const addExhaustionInput = this.form?.elements.namedItem("addExhaustion");
        const madnessInput = this.form?.elements.namedItem("madnessTemp");
        const painInput = this.form?.elements.namedItem("painDice");
        const actorData = normalizeCharacterSystemData(actor.system);
        const addExhaustion = addExhaustionInput?.checked ?? false;
        const madnessTemp = Math.min(Math.max(Number.parseInt(madnessInput?.value ?? "0", 10) || 0, 0), DRYH_TEMP_MADNESS_MAX);
        const painDice = Math.max(Number.parseInt(painInput?.value ?? "0", 10) || 0, 0);
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
                pain: painDice
            })
        });
        await this.close();
    }
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function renderDots(value) {
    if (value <= 0) {
        return "0";
    }
    return "●".repeat(value);
}
//# sourceMappingURL=roll-dialog.js.map
