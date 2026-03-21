import { YakovDryhRollDialog } from "../dialogs/roll-dialog.js";
import { DRYH_EXHAUSTION_MAX, DRYH_RESPONSE_MAX, normalizeCharacterSystemData, normalizeResponses, YAKOV_DRYH_ACTOR_TYPES } from "../../data/index.js";
import { SYSTEM_ID, SYSTEM_TITLE, TEMPLATE_PATHS } from "../../constants.js";
import { formatLineList, parseLineList } from "../../utils/index.js";
const BaseSheet = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
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
        context.actorData = actorData;
        context.actorName = actor?.name ?? "";
        context.actorType = actorType;
        context.actorTypeLabel = localizeActorType(actorType);
        context.disciplinePips = createPips(actorData.discipline, Math.max(actorData.discipline, 3));
        context.exhaustionPips = createPips(actorData.exhaustion, DRYH_EXHAUSTION_MAX);
        context.madnessPips = createPips(actorData.madnessPermanent, Math.max(actorData.madnessPermanent, 3));
        context.moduleId = SYSTEM_ID;
        context.responseFightPips = createPips(actorData.responses.fight, actorData.responses.max);
        context.responseFlightPips = createPips(actorData.responses.flight, actorData.responses.max);
        context.responsesRemaining = Math.max(actorData.responses.max -
            actorData.responses.fight -
            actorData.responses.flight, 0);
        context.scarsText = formatLineList(actorData.scars);
        return context;
    }
    async _onRender(context, options) {
        await super._onRender(context, options);
        const rollButton = this.element.querySelector('[data-yakov-dryh-action="open-roll-dialog"]');
        const responseInputs = this.element.querySelectorAll("[data-yakov-dryh-response]");
        const scarsInput = this.element.querySelector('textarea[data-yakov-dryh-field="scars"]');
        rollButton?.addEventListener("click", (event) => {
            event.preventDefault();
            void this.openRollDialog();
        });
        responseInputs.forEach((input) => {
            input.addEventListener("change", () => {
                void this.updateResponses(input.dataset.yakovDryhResponse, input.value);
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
    async updateResponses(changedField, value) {
        const actor = this.actor;
        if (!actor) {
            return;
        }
        const currentData = normalizeCharacterSystemData(actor.system);
        const numericValue = Number.parseInt(value, 10);
        const responses = normalizeResponses({
            ...currentData.responses,
            [changedField]: Number.isFinite(numericValue) ? numericValue : 0
        }, changedField);
        await actor.update({
            "system.responses.fight": responses.fight,
            "system.responses.flight": responses.flight,
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
function createPips(value, total) {
    return Array.from({ length: Math.max(total, 0) }, (_entry, index) => ({
        filled: index < value
    }));
}
function localizeActorType(actorType) {
    const localizationKey = `TYPES.Actor.${actorType}`;
    const localizedActorType = game.i18n?.localize(localizationKey) ?? localizationKey;
    return localizedActorType === localizationKey ? actorType : localizedActorType;
}
//# sourceMappingURL=character-sheet.js.map
