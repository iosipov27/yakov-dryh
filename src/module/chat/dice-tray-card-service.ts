import {
  adjustDiceTrayPool,
  getDiceTrayState,
  hasLoadedDiceTrayActor,
  loadActorIntoDiceTray,
  resetDiceTrayState,
  type YakovDryhDiceTrayPool
} from "../applications/ui/dice-tray-state.js";
import {
  DRYH_DICE_TRAY_FLAG,
  SYSTEM_ID,
  TEMPLATE_PATHS
} from "../constants.js";
import {
  hasCompleteResponseConfiguration,
  normalizeCharacterSystemData
} from "../data/index.js";
import { rollDryhCheck } from "../dice/index.js";
import { createDryhInitialRollMessage } from "./roll-card-service.js";
import { createDiceTrayCardContext } from "./dice-tray-card-presentation.js";

interface DryhDiceTrayCardFlag {
  type: "dice-tray";
}

const DICE_TRAY_MESSAGE_SYNC_DELAY_MS = 50;
let scheduledDiceTrayMessageSync: ReturnType<typeof setTimeout> | null = null;

function createDryhDiceTrayCardFlag(): DryhDiceTrayCardFlag {
  return {
    type: "dice-tray"
  };
}

function getDryhDiceTrayCardFlag(
  message: ChatMessage.Implementation
): DryhDiceTrayCardFlag | undefined {
  const flag = (
    message as unknown as {
      getFlag: (scope: string, key: string) => unknown;
    }
  ).getFlag(SYSTEM_ID, DRYH_DICE_TRAY_FLAG);

  if (!flag || typeof flag !== "object") {
    return undefined;
  }

  return flag as DryhDiceTrayCardFlag;
}

export function hasDryhDiceTrayCard(
  message: ChatMessage.Implementation
): boolean {
  return Boolean(getDryhDiceTrayCardFlag(message));
}

function getActiveDryhDiceTrayMessage(): ChatMessage.Implementation | null {
  const messages = game.messages?.contents ?? [];

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index] as ChatMessage.Implementation;

    if (hasDryhDiceTrayCard(message)) {
      return message;
    }
  }

  return null;
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;

  return localizedValue === key ? fallback : localizedValue;
}

function getSpeaker(
  actor: Actor.Implementation | null
): ReturnType<typeof ChatMessage.getSpeaker> {
  if (actor) {
    return ChatMessage.getSpeaker({ actor });
  }

  return ChatMessage.getSpeaker();
}

async function resolveTrayActor(): Promise<Actor.Implementation | null> {
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

async function renderDryhDiceTrayCard(): Promise<string | null> {
  const state = getDiceTrayState();

  if (!hasLoadedDiceTrayActor(state)) {
    return null;
  }

  const actor = state.actorId
    ? (game.actors?.get(state.actorId) ?? null)
    : null;
  const context = createDiceTrayCardContext({
    isActorOwner: actor?.isOwner ?? false,
    isGm: game.user?.isGM ?? false,
    state
  });

  return foundry.applications.handlebars.renderTemplate(
    TEMPLATE_PATHS.dryhDiceTrayCard,
    {
      ...context,
      moduleId: SYSTEM_ID
    }
  );
}

export async function deleteActiveDryhDiceTrayMessage(): Promise<void> {
  cancelScheduledDryhDiceTrayMessageSync();
  const message = getActiveDryhDiceTrayMessage();

  if (!message) {
    return;
  }

  await message.delete();
}

export async function rerenderDryhDiceTrayMessage(
  message: ChatMessage.Implementation
): Promise<ChatMessage.Implementation | null> {
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
  } as Record<string, unknown>);

  return message;
}

export async function syncActiveDryhDiceTrayMessage(): Promise<ChatMessage.Implementation | null> {
  cancelScheduledDryhDiceTrayMessageSync();
  const message = getActiveDryhDiceTrayMessage();

  if (!message) {
    return null;
  }

  return rerenderDryhDiceTrayMessage(message);
}

export async function upsertDryhDiceTrayMessage(): Promise<ChatMessage.Implementation | null> {
  cancelScheduledDryhDiceTrayMessageSync();
  const content = await renderDryhDiceTrayCard();

  if (!content) {
    await deleteActiveDryhDiceTrayMessage();
    return null;
  }

  const actor = await resolveTrayActor();
  const existingMessage = getActiveDryhDiceTrayMessage();

  if (existingMessage) {
    await existingMessage.update({
      [`flags.${SYSTEM_ID}.${DRYH_DICE_TRAY_FLAG}`]:
        createDryhDiceTrayCardFlag(),
      content,
      speaker: getSpeaker(actor)
    } as Record<string, unknown>);

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
  } as Record<string, unknown>) as Promise<ChatMessage.Implementation>;
}

export async function openDryhDiceTrayForActor(
  actor: Actor.Implementation
): Promise<ChatMessage.Implementation | null> {
  const actorData = normalizeCharacterSystemData(actor.system);

  if (!hasCompleteResponseConfiguration(actorData.responses)) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.ResponsesNotConfigured",
        "Configure all 3 Responses before rolling."
      )
    );
    return null;
  }

  await loadActorIntoDiceTray(actor);

  return upsertDryhDiceTrayMessage();
}

export function requestActiveDryhDiceTrayMessageSync(
  syncMode: "debounced" | "immediate" | "none"
): void {
  if (syncMode === "none") {
    cancelScheduledDryhDiceTrayMessageSync();
    return;
  }

  if (syncMode === "immediate") {
    cancelScheduledDryhDiceTrayMessageSync();
    void syncActiveDryhDiceTrayMessage();
    return;
  }

  if (scheduledDiceTrayMessageSync !== null) {
    return;
  }

  scheduledDiceTrayMessageSync = setTimeout(() => {
    scheduledDiceTrayMessageSync = null;
    void syncActiveDryhDiceTrayMessage();
  }, DICE_TRAY_MESSAGE_SYNC_DELAY_MS);
}

export async function adjustDryhDiceTrayPool(
  pool: YakovDryhDiceTrayPool,
  delta: number
): Promise<void> {
  const state = getDiceTrayState();
  const actor = state.actorId
    ? (game.actors?.get(state.actorId) ?? null)
    : null;
  const isActorOwner = actor?.isOwner ?? false;
  const isGm = game.user?.isGM ?? false;
  const canEditPlayerPools = isActorOwner || isGm;

  if (pool === "pain") {
    if (!isGm) {
      ui.notifications?.warn(
        localize(
          "YAKOV_DRYH.UI.Warnings.SharedPoolsGmOnly",
          "Only the GM can change Hope / Despair."
        )
      );
      return;
    }
  } else if (!canEditPlayerPools) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly",
        "Only the actor owner can change these dice."
      )
    );
    return;
  }

  await adjustDiceTrayPool(pool, delta);
}

export async function rollDryhDiceTray(): Promise<ChatMessage.Implementation | null> {
  const state = getDiceTrayState();

  if (state.pools.pain < 1 || !state.actorId) {
    return null;
  }

  const actor = await resolveTrayActor();

  if (!(actor instanceof Actor)) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.ActorUnavailable",
        "Actor is no longer available."
      )
    );
    return null;
  }

  if (
    !hasCompleteResponseConfiguration(
      normalizeCharacterSystemData(actor.system).responses
    )
  ) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.ResponsesNotConfigured",
        "Configure all 3 Responses before rolling."
      )
    );
    return null;
  }

  const isActorOwner = actor.isOwner;
  const isGm = game.user?.isGM ?? false;

  if (!isActorOwner && !isGm) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.TrayActorOwnerOnly",
        "Only the actor owner can change these dice."
      )
    );
    return null;
  }

  const preRollExhaustionTaken =
    state.pools.exhaustion > state.basePools.exhaustion;

  if (preRollExhaustionTaken) {
    await actor.update({
      "system.exhaustion": state.pools.exhaustion
    } as Record<string, unknown>);
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

function cancelScheduledDryhDiceTrayMessageSync(): void {
  if (scheduledDiceTrayMessageSync === null) {
    return;
  }

  clearTimeout(scheduledDiceTrayMessageSync);
  scheduledDiceTrayMessageSync = null;
}
