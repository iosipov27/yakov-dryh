import { checkFirstUncheckedResponse, DRYH_EXHAUSTION_MAX, getCheckedResponseTypes, normalizeCharacterSystemData, uncheckFirstCheckedResponse } from "../data/index.js";
import { DRYH_ROLL_FLAG, SYSTEM_PATH, SYSTEM_ID, TEMPLATE_PATHS } from "../constants.js";
import { applyHopeBoostToRollResult, applyPainRollToRollResult, applyPostRollExhaustionToRollResult, applyGmActionToRollResult } from "../dice/index.js";
import { addDespair, getSharedDespairTotal, getSharedHopeTotal, spendHope, spendDespairForHope } from "../resources/index.js";
import { getFailureConsequence } from "./failure-consequence.js";
import { getFailureResolutionActions } from "./failure-resolution.js";
function createDefaultPlayerAdjustmentsData() {
    return {
        hopeBoostUsed: false,
        postRollExhaustionTaken: false,
        preRollExhaustionTaken: false
    };
}
function cloneRollCardData(card) {
    if (card.stage === "initial") {
        const playerAdjustments = {
            ...createDefaultPlayerAdjustmentsData(),
            ...card.playerAdjustments
        };
        return {
            ...card,
            playerAdjustments,
            rollResult: {
                ...card.rollResult,
                pools: {
                    discipline: [...card.rollResult.pools.discipline],
                    exhaustion: [...card.rollResult.pools.exhaustion],
                    madness: [...card.rollResult.pools.madness],
                    pain: [...card.rollResult.pools.pain]
                },
                successes: { ...card.rollResult.successes }
            }
        };
    }
    return {
        ...card,
        modifiedResult: {
            ...card.modifiedResult,
            pools: {
                discipline: [...card.modifiedResult.pools.discipline],
                exhaustion: [...card.modifiedResult.pools.exhaustion],
                madness: [...card.modifiedResult.pools.madness],
                pain: [...card.modifiedResult.pools.pain]
            },
            successes: { ...card.modifiedResult.successes }
        }
    };
}
function getRollCardFlag(message) {
    const flag = message.getFlag(SYSTEM_ID, DRYH_ROLL_FLAG);
    if (!flag || typeof flag !== "object") {
        return undefined;
    }
    return cloneRollCardData(flag);
}
function getRollResult(card) {
    return card.stage === "initial" ? card.rollResult : card.modifiedResult;
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function formatOutcome(outcome) {
    return localize(`YAKOV_DRYH.ROLL.Outcomes.${outcome}`, outcome === "success" ? "Success" : "Failure");
}
function formatDominantPool(pool) {
    return localize(`YAKOV_DRYH.ROLL.Pools.${pool}`, pool.charAt(0).toUpperCase() + pool.slice(1));
}
function getRollDieIconStyle(pool) {
    return pool === "discipline" ? "outline" : "solid";
}
function getRollDieIconSrc(pool, value) {
    const dieValue = Math.min(Math.max(Math.trunc(value), 1), 6);
    return `${SYSTEM_PATH}/assets/d6-${getRollDieIconStyle(pool)}-${dieValue}.svg`;
}
function getRollDiceSummary(pool, dice) {
    const label = formatDominantPool(pool);
    return dice.map((value) => ({
        alt: `${label} ${value}`,
        src: getRollDieIconSrc(pool, value),
        value
    }));
}
function getPoolSummaries(rollResult) {
    return [
        {
            cssClass: "yakov-dryh-roll-pool--discipline",
            dice: getRollDiceSummary("discipline", rollResult.pools.discipline),
            hasDice: rollResult.pools.discipline.length > 0,
            hasSix: rollResult.pools.discipline.includes(6),
            key: "discipline",
            label: formatDominantPool("discipline"),
            successes: rollResult.pools.discipline.filter((die) => die <= 3).length
        },
        {
            cssClass: "yakov-dryh-roll-pool--exhaustion",
            dice: getRollDiceSummary("exhaustion", rollResult.pools.exhaustion),
            hasDice: rollResult.pools.exhaustion.length > 0,
            hasSix: rollResult.pools.exhaustion.includes(6),
            key: "exhaustion",
            label: formatDominantPool("exhaustion"),
            successes: rollResult.pools.exhaustion.filter((die) => die <= 3).length
        },
        {
            cssClass: "yakov-dryh-roll-pool--madness",
            dice: getRollDiceSummary("madness", rollResult.pools.madness),
            hasDice: rollResult.pools.madness.length > 0,
            hasSix: rollResult.pools.madness.includes(6),
            key: "madness",
            label: formatDominantPool("madness"),
            successes: rollResult.pools.madness.filter((die) => die <= 3).length
        },
        {
            cssClass: "yakov-dryh-roll-pool--pain",
            dice: getRollDiceSummary("pain", rollResult.pools.pain),
            hasDice: rollResult.pools.pain.length > 0,
            hasSix: rollResult.pools.pain.includes(6),
            key: "pain",
            label: formatDominantPool("pain"),
            successes: rollResult.pools.pain.filter((die) => die <= 3).length
        }
    ];
}
export function canTakePostRollExhaustion(card) {
    return (card.painRolled &&
        !card.playerAdjustments.preRollExhaustionTaken &&
        !card.playerAdjustments.postRollExhaustionTaken &&
        card.rollResult.pools.exhaustion.length < DRYH_EXHAUSTION_MAX);
}
export function canSpendHopeForDiscipline(card, hopeTotal = getSharedHopeTotal()) {
    return card.painRolled && !card.playerAdjustments.hopeBoostUsed && hopeTotal >= 1;
}
export function getAvailablePlayerRollActionTypes(card, hopeTotal = getSharedHopeTotal()) {
    const actions = [];
    if (canSpendHopeForDiscipline(card, hopeTotal)) {
        actions.push("spend-hope");
    }
    if (canTakePostRollExhaustion(card)) {
        actions.push("take-post-roll-exhaustion");
    }
    return actions;
}
function getPlayerActionButtons(card) {
    return getAvailablePlayerRollActionTypes(card).map((type) => ({
        label: type === "spend-hope"
            ? localize("YAKOV_DRYH.ROLL.Actions.SpendHopeForDiscipline", "-1 Hope -> add 1 to Discipline")
            : localize("YAKOV_DRYH.ROLL.Actions.TakePostRollExhaustion", "+1 Exhaustion after roll"),
        type
    }));
}
async function renderRollCard(card) {
    const rollResult = getRollResult(card);
    const isInitial = card.stage === "initial";
    const showAdjustments = isInitial
        ? !card.finalized && card.painRolled && !card.gmActionUsed
        : false;
    const canAffordAdjustment = showAdjustments ? getSharedDespairTotal() >= 1 : false;
    const canFinalize = isInitial ? !card.finalized && card.painRolled : false;
    const canRollPain = isInitial ? !card.finalized && !card.painRolled : false;
    const finalMessageId = isInitial ? card.finalMessageId : null;
    const isResolved = isInitial ? card.finalized : true;
    const legacyEffectText = isInitial
        ? null
        : (card.effectText ?? null);
    const dominantEffectText = isInitial
        ? null
        : card.dominantResolutionText ?? card.dominantEffectText ?? legacyEffectText;
    const failureEffectText = isInitial
        ? null
        : card.failureResolutionText ?? card.failureEffectText;
    const dominantResolutionButtons = isInitial
        ? []
        : await getDominantResolutionButtons(card);
    const dominantResolutionPrompt = dominantResolutionButtons.length > 1
        ? localize("YAKOV_DRYH.ROLL.Chat.ChooseOne", "Choose one:")
        : null;
    const failureResolutionButtons = isInitial
        ? []
        : await getFailureResolutionButtons(card);
    const playerActionButtons = isInitial ? getPlayerActionButtons(card) : [];
    const failureResolutionPrompt = failureResolutionButtons.length > 1
        ? localize("YAKOV_DRYH.ROLL.Chat.ChooseOne", "Choose one:")
        : null;
    const playerActionPrompt = playerActionButtons.length > 0
        ? localize("YAKOV_DRYH.ROLL.Chat.PlayerActions", "Player post-roll actions:")
        : null;
    return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATHS.dryhRollCard, {
        actorName: card.actorName,
        canAffordAdjustment,
        canFinalize,
        canRollPain,
        dominantLabel: formatDominantPool(rollResult.dominant),
        dominantEffectText,
        dominantResolutionButtons,
        dominantResolutionPrompt,
        failureEffectText,
        failureResolutionButtons,
        failureResolutionPrompt,
        finalMessageId,
        hasEffectText: Boolean(dominantEffectText || failureEffectText),
        hasDominantResolutionButtons: dominantResolutionButtons.length > 0,
        hasFailureResolutionButtons: failureResolutionButtons.length > 0,
        hasPlayerActionButtons: playerActionButtons.length > 0,
        isFinal: card.stage === "final",
        isInitial,
        isResolved,
        outcomeLabel: formatOutcome(rollResult.outcome),
        playerActionButtons,
        playerActionPrompt,
        poolSummaries: getPoolSummaries(rollResult),
        rollResult,
        showAdjustments,
        stageLabel: card.stage === "initial"
            ? localize("YAKOV_DRYH.ROLL.Chat.InitialTitle", "Roll Result")
            : localize("YAKOV_DRYH.ROLL.Chat.FinalTitle", "Final Result")
    });
}
async function resolveActor(actorUuid, actorId) {
    if (actorId) {
        const actor = game.actors?.get(actorId) ?? null;
        if (actor) {
            return actor;
        }
    }
    if (actorUuid) {
        const document = await fromUuid(actorUuid);
        if (document instanceof Actor) {
            return document;
        }
    }
    return null;
}
function createFailureResolutionButtonLabel(action) {
    switch (action.type) {
        case "gain-exhaustion":
            return localize("YAKOV_DRYH.ROLL.Actions.GainExhaustion", "+1 Exhaustion");
        case "check-response":
            return action.responseType === "flight"
                ? localize("YAKOV_DRYH.ROLL.Actions.CheckFlight", "Check Flight")
                : localize("YAKOV_DRYH.ROLL.Actions.CheckFight", "Check Fight");
    }
}
function createDominantResolutionButtonLabel(action) {
    switch (action.type) {
        case "remove-exhaustion":
            return localize("YAKOV_DRYH.ROLL.Actions.RemoveExhaustion", "Remove 1 Exhaustion");
        case "uncheck-response":
            return action.responseType === "flight"
                ? localize("YAKOV_DRYH.ROLL.Actions.UncheckFlightResponse", "Un-check Flight Response")
                : localize("YAKOV_DRYH.ROLL.Actions.UncheckFightResponse", "Un-check Fight Response");
    }
}
async function getDominantResolutionButtons(card) {
    if (card.modifiedResult.dominant !== "discipline" || card.dominantResolutionText) {
        return [];
    }
    const actor = await resolveActor(card.actorUuid, card.actorId);
    if (!actor) {
        return [];
    }
    const actorData = normalizeCharacterSystemData(actor.system);
    const buttons = [];
    if (actorData.exhaustion > 0) {
        buttons.push({
            label: createDominantResolutionButtonLabel({
                responseType: null,
                type: "remove-exhaustion"
            }),
            responseType: null,
            type: "remove-exhaustion"
        });
    }
    getCheckedResponseTypes(actorData.responses).forEach((responseType) => {
        buttons.push({
            label: createDominantResolutionButtonLabel({
                responseType,
                type: "uncheck-response"
            }),
            responseType,
            type: "uncheck-response"
        });
    });
    return buttons;
}
async function getFailureResolutionButtons(card) {
    if (card.failureConsequence === null || card.failureResolutionText) {
        return [];
    }
    const actor = await resolveActor(card.actorUuid, card.actorId);
    if (!actor) {
        return [];
    }
    const actorData = normalizeCharacterSystemData(actor.system);
    return getFailureResolutionActions(card.failureConsequence, actorData.responses).map((action) => ({
        label: createFailureResolutionButtonLabel(action),
        responseType: action.responseType,
        type: action.type
    }));
}
function getSpeaker(actor) {
    if (actor) {
        return ChatMessage.getSpeaker({ actor });
    }
    return ChatMessage.getSpeaker();
}
function createInitialRollCardData(input) {
    return {
        actorId: input.actor.id ?? null,
        actorName: input.actor.name ?? localize("DOCUMENT.Actor", "Actor"),
        actorUuid: input.actor.uuid,
        finalMessageId: null,
        finalized: false,
        gmActionUsed: false,
        painRolled: false,
        playerAdjustments: {
            ...createDefaultPlayerAdjustmentsData(),
            preRollExhaustionTaken: input.preRollExhaustionTaken
        },
        rollResult: input.rollResult,
        stage: "initial"
    };
}
async function applyDominantEffect(actor, rollResult) {
    switch (rollResult.dominant) {
        case "discipline":
            return localize("YAKOV_DRYH.ROLL.Effects.discipline", "Un-check a Response or remove 1 Exhaustion.");
        case "exhaustion": {
            const actorData = normalizeCharacterSystemData(actor.system);
            const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);
            await actor.update({
                "system.exhaustion": nextExhaustion
            });
            return formatActorNameEffect("YAKOV_DRYH.ROLL.Effects.exhaustion", "{name} gains +1 Exhaustion.", actor.name ?? localize("DOCUMENT.Actor", "Actor"));
        }
        case "madness":
            return localize("YAKOV_DRYH.ROLL.Effects.madness", "Mark a Response.");
        case "pain": {
            const nextDespair = await addDespair(1);
            return `${localize("YAKOV_DRYH.ROLL.Effects.pain", "GM gains +1 Despair.")} ${localize("YAKOV_DRYH.ROLL.Effects.DespairTotal", "Total Despair:")} ${nextDespair}`;
        }
    }
    return localize("YAKOV_DRYH.ROLL.Effects.discipline", "Un-check a Response or remove 1 Exhaustion.");
}
function getFailureEffectText(rollResult) {
    switch (getFailureConsequence(rollResult)) {
        case "gm-choice":
            return localize("YAKOV_DRYH.ROLL.Effects.FailureChoice", "GM narrates the failure and chooses either +1 Exhaustion or mark a Response.");
        case "gain-exhaustion":
            return localize("YAKOV_DRYH.ROLL.Effects.FailureGainExhaustion", "GM narrates the failure and must apply +1 Exhaustion because Madness already covers checking a Response.");
        case "mark-response":
            return localize("YAKOV_DRYH.ROLL.Effects.FailureMarkResponse", "GM narrates the failure and must mark a Response because Exhaustion already covers +1 Exhaustion.");
        default:
            return null;
    }
}
export function hasDryhRollCard(message) {
    return Boolean(getRollCardFlag(message));
}
export function getDryhRollCardData(message) {
    const card = getRollCardFlag(message);
    if (!card) {
        throw new Error("Chat message does not contain a DRYH roll card.");
    }
    return card;
}
export async function createDryhInitialRollMessage(input) {
    const card = createInitialRollCardData(input);
    const content = await renderRollCard(card);
    return ChatMessage.create({
        content,
        flags: {
            [SYSTEM_ID]: {
                [DRYH_ROLL_FLAG]: card
            }
        },
        speaker: getSpeaker(input.actor)
    });
}
async function updateInitialRollMessage(message, card) {
    const updatedContent = await renderRollCard(card);
    await message.update({
        [`flags.${SYSTEM_ID}.${DRYH_ROLL_FLAG}`]: card,
        content: updatedContent
    });
    return card;
}
async function updateFinalRollMessage(message, card) {
    const updatedContent = await renderRollCard(card);
    await message.update({
        [`flags.${SYSTEM_ID}.${DRYH_ROLL_FLAG}`]: card,
        content: updatedContent
    });
    return card;
}
export async function rerenderDryhRollMessage(message) {
    const card = getRollCardFlag(message);
    if (!card) {
        return null;
    }
    const content = await renderRollCard(card);
    await message.update({
        content
    });
    return card;
}
async function createFinalizedRollMessage(message, card, actor, modifiedResult) {
    const dominantEffectText = await applyDominantEffect(actor, modifiedResult);
    const failureConsequence = getFailureConsequence(modifiedResult);
    const failureEffectText = getFailureEffectText(modifiedResult);
    const finalCard = {
        actorId: card.actorId,
        actorName: card.actorName,
        actorUuid: card.actorUuid,
        dominantEffectText,
        dominantResolutionText: null,
        failureConsequence,
        failureEffectText,
        failureResolutionText: null,
        modifiedResult,
        originalRollId: message.id ?? null,
        stage: "final"
    };
    const finalContent = await renderRollCard(finalCard);
    const finalMessage = (await ChatMessage.create({
        content: finalContent,
        flags: {
            [SYSTEM_ID]: {
                [DRYH_ROLL_FLAG]: finalCard
            }
        },
        speaker: getSpeaker(actor)
    }));
    const updatedInitialCard = {
        ...card,
        finalMessageId: finalMessage.id ?? null,
        finalized: true,
        rollResult: modifiedResult
    };
    await updateInitialRollMessage(message, updatedInitialCard);
    return finalMessage;
}
export async function applyDryhRollGmAction(message, action) {
    const card = getRollCardFlag(message);
    if (!card ||
        card.stage !== "initial" ||
        card.finalized ||
        !card.painRolled ||
        card.gmActionUsed) {
        return null;
    }
    const updatedPools = await spendDespairForHope();
    if (!updatedPools) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.DespairRequired", "At least 1 Despair is required to adjust a six."));
        return null;
    }
    const updatedCard = {
        ...card,
        gmActionUsed: true,
        rollResult: applyGmActionToRollResult(card.rollResult, action)
    };
    return updateInitialRollMessage(message, updatedCard);
}
export async function applyDryhRollPlayerAction(message, action) {
    const card = getRollCardFlag(message);
    if (!card || card.stage !== "initial" || card.finalized) {
        return null;
    }
    switch (action.type) {
        case "spend-hope": {
            if (!canSpendHopeForDiscipline(card)) {
                return null;
            }
            const nextHope = await spendHope();
            if (nextHope === null) {
                ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.HopeRequired", "At least 1 Hope is required to improve Discipline."));
                return null;
            }
            return updateInitialRollMessage(message, {
                ...card,
                playerAdjustments: {
                    ...card.playerAdjustments,
                    hopeBoostUsed: true
                },
                rollResult: applyHopeBoostToRollResult(card.rollResult)
            });
        }
        case "take-post-roll-exhaustion": {
            if (!canTakePostRollExhaustion(card)) {
                return null;
            }
            const actor = await resolveActor(card.actorUuid, card.actorId);
            if (!actor) {
                ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
                return null;
            }
            const actorData = normalizeCharacterSystemData(actor.system);
            const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);
            if (nextExhaustion === actorData.exhaustion) {
                return null;
            }
            await actor.update({
                "system.exhaustion": nextExhaustion
            });
            return updateInitialRollMessage(message, {
                ...card,
                playerAdjustments: {
                    ...card.playerAdjustments,
                    postRollExhaustionTaken: true
                },
                rollResult: applyPostRollExhaustionToRollResult(card.rollResult)
            });
        }
    }
}
export async function resolveDryhRollFailureAction(message, action) {
    const card = getRollCardFlag(message);
    if (!card ||
        card.stage !== "final" ||
        card.failureConsequence === null ||
        card.failureResolutionText) {
        return null;
    }
    const actor = await resolveActor(card.actorUuid, card.actorId);
    if (!actor) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
        return null;
    }
    let failureResolutionText;
    switch (action.type) {
        case "gain-exhaustion": {
            const actorData = normalizeCharacterSystemData(actor.system);
            const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);
            await actor.update({
                "system.exhaustion": nextExhaustion
            });
            failureResolutionText = formatActorNameEffect("YAKOV_DRYH.ROLL.Effects.FailureResolvedGainExhaustion", "{name} gains +1 Exhaustion.", actor.name ?? localize("DOCUMENT.Actor", "Actor"));
            break;
        }
        case "check-response": {
            if (!action.responseType) {
                return null;
            }
            const actorData = normalizeCharacterSystemData(actor.system);
            const responses = checkFirstUncheckedResponse(actorData.responses, action.responseType);
            if (!responses) {
                ui.notifications?.warn(`${formatResponseType(action.responseType)} ${localize("YAKOV_DRYH.UI.Warnings.ResponseUnavailable", "Response is no longer available.")}`);
                return null;
            }
            await actor.update({
                "system.responses.slots": responses.slots,
                "system.responses.max": responses.max
            });
            failureResolutionText =
                action.responseType === "flight"
                    ? localize("YAKOV_DRYH.ROLL.Effects.FailureResolvedCheckFlight", "GM checked a Flight Response.")
                    : localize("YAKOV_DRYH.ROLL.Effects.FailureResolvedCheckFight", "GM checked a Fight Response.");
            break;
        }
    }
    return updateFinalRollMessage(message, {
        ...card,
        failureResolutionText
    });
}
export async function resolveDryhRollDominantAction(message, action) {
    const card = getRollCardFlag(message);
    if (!card ||
        card.stage !== "final" ||
        card.modifiedResult.dominant !== "discipline" ||
        card.dominantResolutionText) {
        return null;
    }
    const actor = await resolveActor(card.actorUuid, card.actorId);
    if (!actor) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
        return null;
    }
    let dominantResolutionText;
    switch (action.type) {
        case "remove-exhaustion": {
            const actorData = normalizeCharacterSystemData(actor.system);
            if (actorData.exhaustion < 1) {
                return null;
            }
            await actor.update({
                "system.exhaustion": actorData.exhaustion - 1
            });
            dominantResolutionText = formatActorNameEffect("YAKOV_DRYH.ROLL.Effects.DisciplineResolvedRemoveExhaustion", "{name} removes 1 Exhaustion.", actor.name ?? localize("DOCUMENT.Actor", "Actor"));
            break;
        }
        case "uncheck-response": {
            if (!action.responseType) {
                return null;
            }
            const actorData = normalizeCharacterSystemData(actor.system);
            const responses = uncheckFirstCheckedResponse(actorData.responses, action.responseType);
            if (!responses) {
                ui.notifications?.warn(`${formatResponseType(action.responseType)} ${localize("YAKOV_DRYH.UI.Warnings.ResponseUnavailable", "Response is no longer available.")}`);
                return null;
            }
            await actor.update({
                "system.responses.slots": responses.slots,
                "system.responses.max": responses.max
            });
            dominantResolutionText =
                action.responseType === "flight"
                    ? localize("YAKOV_DRYH.ROLL.Effects.DisciplineResolvedUncheckFlight", "A Flight Response was un-checked.")
                    : localize("YAKOV_DRYH.ROLL.Effects.DisciplineResolvedUncheckFight", "A Fight Response was un-checked.");
            break;
        }
    }
    return updateFinalRollMessage(message, {
        ...card,
        dominantResolutionText
    });
}
export async function finalizeDryhRoll(message) {
    const card = getRollCardFlag(message);
    if (!card || card.stage !== "initial" || card.finalized || !card.painRolled) {
        return null;
    }
    const actor = await resolveActor(card.actorUuid, card.actorId);
    if (!actor) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
        return null;
    }
    return createFinalizedRollMessage(message, card, actor, card.rollResult);
}
function formatResponseType(responseType) {
    return responseType === "flight"
        ? localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Flight", "Flight")
        : localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Fight", "Fight");
}
function formatActorNameEffect(key, fallback, actorName) {
    return localize(key, fallback).replace("{name}", actorName);
}
export async function finalizeDryhRollWithPain(message, painDice) {
    const card = getRollCardFlag(message);
    if (!card || card.stage !== "initial" || card.finalized || card.painRolled) {
        return null;
    }
    const normalizedPainDice = Math.max(Math.trunc(painDice), 1);
    const updatedCard = {
        ...card,
        painRolled: true,
        rollResult: applyPainRollToRollResult(card.rollResult, normalizedPainDice)
    };
    return updateInitialRollMessage(message, updatedCard);
}
//# sourceMappingURL=roll-card-service.js.map