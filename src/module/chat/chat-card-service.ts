import {
  CHAT_CARD_FLAG,
  CHAT_CARD_STATUSES,
  SYSTEM_ID,
  TEMPLATE_PATHS,
  type YakovDryhChatCardStatus
} from "../constants.js";

export interface YakovDryhChatCardData {
  actorName: string | null;
  actorUuid: string | null;
  detail: string;
  dialogOpens: number;
  status: YakovDryhChatCardStatus;
  summary: string;
  updatedAt: string;
}

export interface CreateInteractiveChatMessageInput {
  actorName?: string | null;
  actorUuid?: string | null;
  detail?: string;
  status?: YakovDryhChatCardStatus;
  summary?: string;
}

export interface UpdateInteractiveChatCardInput {
  actorName?: string | null;
  actorUuid?: string | null;
  detail?: string;
  dialogOpens?: number;
  status?: YakovDryhChatCardStatus;
  summary?: string;
}

const DEFAULT_SUMMARY =
  "Interactive card ready for sheet, popup and chat-driven flows.";

function nowIsoString(): string {
  return new Date().toISOString();
}

export function formatChatCardStatus(status: YakovDryhChatCardStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "review":
      return "In review";
    case "resolved":
      return "Resolved";
  }
}

function normalizeChatCardStatus(
  status: string | undefined
): YakovDryhChatCardStatus {
  if (
    status &&
    CHAT_CARD_STATUSES.includes(status as YakovDryhChatCardStatus)
  ) {
    return status as YakovDryhChatCardStatus;
  }

  return "draft";
}

export function createDefaultChatCardData(
  overrides: Partial<YakovDryhChatCardData> = {}
): YakovDryhChatCardData {
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

function getChatCardFlag(
  message: ChatMessage.Implementation
): Partial<YakovDryhChatCardData> | undefined {
  const flag = (
    message as unknown as {
      getFlag: (scope: string, key: string) => unknown;
    }
  ).getFlag(SYSTEM_ID, CHAT_CARD_FLAG);

  if (!flag || typeof flag !== "object") {
    return undefined;
  }

  return flag as Partial<YakovDryhChatCardData>;
}

export function hasInteractiveChatCard(
  message: ChatMessage.Implementation
): boolean {
  return Boolean(getChatCardFlag(message));
}

export function getChatCardData(
  message: ChatMessage.Implementation
): YakovDryhChatCardData {
  return createDefaultChatCardData(getChatCardFlag(message));
}

async function resolveActor(
  actorUuid: string | null | undefined
): Promise<Actor.Implementation | null> {
  if (!actorUuid) {
    return null;
  }

  const document = await fromUuid(actorUuid);

  return document instanceof Actor ? document : null;
}

async function renderInteractiveChatCard(
  card: YakovDryhChatCardData
): Promise<string> {
  return foundry.applications.handlebars.renderTemplate(
    TEMPLATE_PATHS.chatCard,
    {
      canAdvanceStatus: true,
      canOpenDialog: true,
      card,
      hasActor: Boolean(card.actorUuid),
      lastUpdated: new Date(card.updatedAt).toLocaleString(),
      moduleId: SYSTEM_ID,
      statusLabel: formatChatCardStatus(card.status)
    }
  );
}

function getSpeaker(
  actor: Actor.Implementation | null
): ReturnType<typeof ChatMessage.getSpeaker> {
  if (actor) {
    return ChatMessage.getSpeaker({ actor });
  }

  return ChatMessage.getSpeaker();
}

export async function createInteractiveChatMessage(
  input: CreateInteractiveChatMessageInput = {}
): Promise<ChatMessage.Implementation> {
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
  } as Record<string, unknown>) as Promise<ChatMessage.Implementation>;
}

async function updateChatCard(
  message: ChatMessage.Implementation,
  updates: UpdateInteractiveChatCardInput
): Promise<YakovDryhChatCardData> {
  const card = createDefaultChatCardData({
    ...getChatCardData(message),
    ...updates,
    updatedAt: nowIsoString()
  });
  const content = await renderInteractiveChatCard(card);

  await message.update({
    [`flags.${SYSTEM_ID}.${CHAT_CARD_FLAG}`]: card,
    content
  } as Record<string, unknown>);

  return card;
}

export async function updateChatCardContent(
  message: ChatMessage.Implementation,
  updates: UpdateInteractiveChatCardInput
): Promise<YakovDryhChatCardData> {
  return updateChatCard(message, updates);
}

export async function rerenderChatCard(
  message: ChatMessage.Implementation
): Promise<YakovDryhChatCardData> {
  return updateChatCard(message, {});
}

export async function advanceChatCardStatus(
  message: ChatMessage.Implementation
): Promise<YakovDryhChatCardData> {
  const currentCard = getChatCardData(message);
  const currentIndex = CHAT_CARD_STATUSES.indexOf(currentCard.status);
  const nextIndex =
    currentIndex === CHAT_CARD_STATUSES.length - 1 ? 0 : currentIndex + 1;

  return updateChatCard(message, {
    status: CHAT_CARD_STATUSES[nextIndex]
  });
}

export async function markChatCardDialogOpened(
  message: ChatMessage.Implementation
): Promise<YakovDryhChatCardData> {
  const currentCard = getChatCardData(message);

  return updateChatCard(message, {
    dialogOpens: currentCard.dialogOpens + 1
  });
}
