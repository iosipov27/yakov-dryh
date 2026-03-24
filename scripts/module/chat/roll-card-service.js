import { checkFirstUncheckedResponse, DRYH_EXHAUSTION_MAX, normalizeCharacterSystemData } from "../data/index.js";
import { DRYH_ROLL_FLAG, SYSTEM_PATH, SYSTEM_ID, TEMPLATE_PATHS } from "../constants.js";
import { applyPainRollToRollResult, applyGmActionToRollResult } from "../dice/index.js";
import { addDespair, getSharedDespairTotal, spendDespairForHope } from "../resources/index.js";
import { getFailureConsequence } from "./failure-consequence.js";
import { getFailureResolutionActions } from "./failure-resolution.js";
function cloneRollCardData(card) {
    if (card.stage === "initial") {
        return {
            ...card,
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
        : card.dominantEffectText ?? legacyEffectText;
    const failureEffectText = isInitial
        ? null
        : card.failureResolutionText ?? card.failureEffectText;
    const failureResolutionButtons = isInitial
        ? []
        : await getFailureResolutionButtons(card);
    const failureResolutionPrompt = failureResolutionButtons.length > 1
        ? localize("YAKOV_DRYH.ROLL.Chat.ChooseOne", "Choose one:")
        : null;
    return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATHS.dryhRollCard, {
        actorName: card.actorName,
        canAffordAdjustment,
        canFinalize,
        canRollPain,
        dominantLabel: formatDominantPool(rollResult.dominant),
        dominantEffectText,
        failureEffectText,
        failureResolutionButtons,
        failureResolutionPrompt,
        finalMessageId,
        hasEffectText: Boolean(dominantEffectText || failureEffectText),
        hasFailureResolutionButtons: failureResolutionButtons.length > 0,
        isFinal: card.stage === "final",
        isInitial,
        isResolved,
        outcomeLabel: formatOutcome(rollResult.outcome),
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