import { adjustDiceTrayPool, getDiceTrayState, hasLoadedDiceTrayActor, loadActorIntoDiceTray, resetDiceTrayState } from "../applications/ui/dice-tray-state.js";
import { DRYH_DICE_TRAY_FLAG, SYSTEM_ID, TEMPLATE_PATHS } from "../constants.js";
import { rollDryhCheck } from "../dice/index.js";
import { createDryhInitialRollMessage } from "./roll-card-service.js";
import { createDiceTrayCardContext } from "./dice-tray-card-presentation.js";
function createDryhDiceTrayCardFlag() {
    return {
        type: "dice-tray"
    };
}
function getDryhDiceTrayCardFlag(message) {
    const flag = message.getFlag(SYSTEM_ID, DRYH_DICE_TRAY_FLAG);
    if (!flag || typeof flag !== "object") {
        return undefined;
    }
    return flag;
}
export function hasDryhDiceTrayCard(message) {
    return Boolean(getDryhDiceTrayCardFlag(message));
}
function getActiveDryhDiceTrayMessage() {
    const messages = game.messages?.contents ?? [];
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (hasDryhDiceTrayCard(message)) {
            return message;
        }
    }
    return null;
}
function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
function getSpeaker(actor) {
    if (actor) {
        return ChatMessage.getSpeaker({ actor });
    }
    return ChatMessage.getSpeaker();
}
async function resolveTrayActor() {
    const state = getDiceTrayState();
    if (!state.actorId) {
        return null;
    }
    const directActor = game.actors?.get(state.actorId) ?? null;
    if (directActor instanceof Actor) {
        return directActor;
    }
    if (!state.actorUuid) {
        return null;
    }
    const document = await fromUuid(state.actorUuid);
    return document instanceof Actor ? document : null;
}
async function renderDryhDiceTrayCard() {
    const state = getDiceTrayState();
    if (!hasLoadedDiceTrayActor(state)) {
        return null;
    }
    const actor = state.actorId ? game.actors?.get(state.actorId) ?? null : null;
    const context = createDiceTrayCardContext({
        isActorOwner: actor?.isOwner ?? false,
        isGm: game.user?.isGM ?? false,
        state
    });
    return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATHS.dryhDiceTrayCard, {
        ...context,
        moduleId: SYSTEM_ID
    });
}
export async function deleteActiveDryhDiceTrayMessage() {
    const message = getActiveDryhDiceTrayMessage();
    if (!message) {
        return;
    }
    await message.delete();
}
export async function rerenderDryhDiceTrayMessage(message) {
    if (!hasDryhDiceTrayCard(message)) {
        return null;
    }
    const content = await renderDryhDiceTrayCard();
    if (!content) {
        await message.delete();
        return null;
    }
    const actor = await resolveTrayActor();
    await message.update({
        content,
        speaker: getSpeaker(actor)
    });
    return message;
}
export async function syncActiveDryhDiceTrayMessage() {
    const message = getActiveDryhDiceTrayMessage();
    if (!message) {
        return null;
    }
    return rerenderDryhDiceTrayMessage(message);
}
export async function upsertDryhDiceTrayMessage() {
    const content = await renderDryhDiceTrayCard();
    if (!content) {
        await deleteActiveDryhDiceTrayMessage();
        return null;
    }
    const actor = await resolveTrayActor();
    const existingMessage = getActiveDryhDiceTrayMessage();
    if (existingMessage) {
        await existingMessage.update({
            [`flags.${SYSTEM_ID}.${DRYH_DICE_TRAY_FLAG}`]: createDryhDiceTrayCardFlag(),
            content,
            speaker: getSpeaker(actor)
        });
        return existingMessage;
    }
    return ChatMessage.create({
        content,
        flags: {
            [SYSTEM_ID]: {
                [DRYH_DICE_TRAY_FLAG]: createDryhDiceTrayCardFlag()
            }
        },
        speaker: getSpeaker(actor)
    });
}
export async function openDryhDiceTrayForActor(actor) {
    await loadActorIntoDiceTray(actor);
    return upsertDryhDiceTrayMessage();
}
export async function adjustDryhDiceTrayPool(pool, delta) {
    const state = getDiceTrayState();
    const actor = state.actorId ? game.actors?.get(state.actorId) ?? null : null;
    const isActorOwner = actor?.isOwner ?? false;
    const isGm = game.user?.isGM ?? false;
    const canEditPlayerPools = isActorOwner || isGm;
    if (pool === "pain") {
        if (!isGm) {
            ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly", "Only the GM can change Hope / Despair."));
            return;
        }
    }
    else if (!canEditPlayerPools) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly", "Only the actor owner can change these dice."));
        return;
    }
    await adjustDiceTrayPool(pool, delta);
}
export async function rollDryhDiceTray() {
    const state = getDiceTrayState();
    if (state.pools.pain < 1 || !state.actorId) {
        return null;
    }
    const actor = await resolveTrayActor();
    if (!(actor instanceof Actor)) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.ActorUnavailable", "Actor is no longer available."));
        return null;
    }
    const isActorOwner = actor.isOwner;
    const isGm = game.user?.isGM ?? false;
    if (!isActorOwner && !isGm) {
        ui.notifications?.warn(localize("YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly", "Only the actor owner can change these dice."));
        return null;
    }
    const preRollExhaustionTaken = state.pools.exhaustion > state.basePools.exhaustion;
    if (preRollExhaustionTaken) {
        await actor.update({
            "system.exhaustion": state.pools.exhaustion
        });
    }
    const resultMessage = await createDryhInitialRollMessage({
        actor,
        painRolled: true,
        preRollExhaustionTaken,
        rollResult: rollDryhCheck({
            discipline: state.pools.discipline,
            exhaustion: state.pools.exhaustion,
            madness: state.pools.madness,
            pain: state.pools.pain
        })
    });
    await deleteActiveDryhDiceTrayMessage();
    await resetDiceTrayState();
    return resultMessage;
}
//# sourceMappingURL=dice-tray-card-service.js.map