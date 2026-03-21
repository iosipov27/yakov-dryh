import { CHAT_CARD_FLAG, CHAT_CARD_STATUSES, SYSTEM_ID, TEMPLATE_PATHS } from "../constants.js";
const DEFAULT_SUMMARY = "Interactive card ready for sheet, popup and chat-driven flows.";
function nowIsoString() {
    return new Date().toISOString();
}
export function formatChatCardStatus(status) {
    switch (status) {
        case "draft":
            return "Draft";
        case "review":
            return "In review";
        case "resolved":
            return "Resolved";
    }
}
function normalizeChatCardStatus(status) {
    if (status &&
        CHAT_CARD_STATUSES.includes(status)) {
        return status;
    }
    return "draft";
}
export function createDefaultChatCardData(overrides = {}) {
    return {
        actorName: overrides.actorName ?? null,
        actorUuid: overrides.actorUuid ?? null,
        detail: overrides.detail?.trim() ?? "",
        dialogOpens: overrides.dialogOpens ?? 0,
        status: normalizeChatCardStatus(overrides.status),
        summary: overrides.summary?.trim() || DEFAULT_SUMMARY,
        updatedAt: overrides.updatedAt ?? nowIsoString()
    };
}
function getChatCardFlag(message) {
    const flag = message.getFlag(SYSTEM_ID, CHAT_CARD_FLAG);
    if (!flag || typeof flag !== "object") {
        return undefined;
    }
    return flag;
}
export function hasInteractiveChatCard(message) {
    return Boolean(getChatCardFlag(message));
}
export function getChatCardData(message) {
    return createDefaultChatCardData(getChatCardFlag(message));
}
async function resolveActor(actorUuid) {
    if (!actorUuid) {
        return null;
    }
    const document = await fromUuid(actorUuid);
    return document instanceof Actor ? document : null;
}
async function renderInteractiveChatCard(card) {
    return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATHS.chatCard, {
        canAdvanceStatus: true,
        canOpenDialog: true,
        card,
        hasActor: Boolean(card.actorUuid),
        lastUpdated: new Date(card.updatedAt).toLocaleString(),
        moduleId: SYSTEM_ID,
        statusLabel: formatChatCardStatus(card.status)
    });
}
function getSpeaker(actor) {
    if (actor) {
        return ChatMessage.getSpeaker({ actor });
    }
    return ChatMessage.getSpeaker();
}
export async function createInteractiveChatMessage(input = {}) {
    const actor = await resolveActor(input.actorUuid);
    const card = createDefaultChatCardData({
        actorName: actor?.name ?? input.actorName ?? null,
        actorUuid: actor?.uuid ?? input.actorUuid ?? null,
        detail: input.detail,
        status: input.status,
        summary: input.summary
    });
    const content = await renderInteractiveChatCard(card);
    return ChatMessage.create({
        content,
        flags: {
            [SYSTEM_ID]: {
                [CHAT_CARD_FLAG]: card
            }
        },
        speaker: getSpeaker(actor)
    });
}
async function updateChatCard(message, updates) {
    const card = createDefaultChatCardData({
        ...getChatCardData(message),
        ...updates,
        updatedAt: nowIsoString()
    });
    const content = await renderInteractiveChatCard(card);
    await message.update({
        [`flags.${SYSTEM_ID}.${CHAT_CARD_FLAG}`]: card,
        content
    });
    return card;
}
export async function updateChatCardContent(message, updates) {
    return updateChatCard(message, updates);
}
export async function rerenderChatCard(message) {
    return updateChatCard(message, {});
}
export async function advanceChatCardStatus(message) {
    const currentCard = getChatCardData(message);
    const currentIndex = CHAT_CARD_STATUSES.indexOf(currentCard.status);
    const nextIndex = currentIndex === CHAT_CARD_STATUSES.length - 1 ? 0 : currentIndex + 1;
    return updateChatCard(message, {
        status: CHAT_CARD_STATUSES[nextIndex]
    });
}
export async function markChatCardDialogOpened(message) {
    const currentCard = getChatCardData(message);
    return updateChatCard(message, {
        dialogOpens: currentCard.dialogOpens + 1
    });
}
//# sourceMappingURL=chat-card-service.js.map