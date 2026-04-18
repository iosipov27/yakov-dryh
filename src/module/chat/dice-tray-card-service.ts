import {
  adjustDiceTrayStatePool,
  getDiceTrayState,
  hasLoadedDiceTrayActor,
  loadActorIntoDiceTray,
  normalizeDiceTrayState,
  resetDiceTrayState,
  setDiceTrayState,
  type YakovDryhDiceTrayPool,
  type YakovDryhDiceTrayState
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
  state?: YakovDryhDiceTrayState;
  type: "dice-tray";
}

const DICE_TRAY_MESSAGE_SYNC_DELAY_MS = 50;
let scheduledDiceTrayMessageSync: ReturnType<typeof setTimeout> | null = null;

function createDryhDiceTrayCardFlag(
  state: YakovDryhDiceTrayState
): DryhDiceTrayCardFlag {
  return {
    state: normalizeDiceTrayState(state),
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

function getDryhDiceTrayCardState(
  message: ChatMessage.Implementation
): YakovDryhDiceTrayState | null {
  const flag = getDryhDiceTrayCardFlag(message);

  if (!flag?.state) {
    return null;
  }

  const state = normalizeDiceTrayState(flag.state);

  return hasLoadedDiceTrayActor(state) ? state : null;
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

async function resolveTrayActor(
  state: YakovDryhDiceTrayState
): Promise<Actor.Implementation | null> {
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

async function renderDryhDiceTrayCard(
  state: YakovDryhDiceTrayState
): Promise<string | null> {
  if (!hasLoadedDiceTrayActor(state)) {
    return null;
  }

  const actor = await resolveTrayActor(state);
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
  message: ChatMessage.Implementation,
  state = getDryhDiceTrayCardState(message) ?? getDiceTrayState()
): Promise<ChatMessage.Implementation | null> {
  if (!hasDryhDiceTrayCard(message)) {
    return null;
  }

  const normalizedState = normalizeDiceTrayState(state);
  const content = await renderDryhDiceTrayCard(normalizedState);

  if (!content) {
    await message.delete();
    return null;
  }

  const actor = await resolveTrayActor(normalizedState);

  await message.update({
    [`flags.${SYSTEM_ID}.${DRYH_DICE_TRAY_FLAG}`]:
      createDryhDiceTrayCardFlag(normalizedState),
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

  return rerenderDryhDiceTrayMessage(message, getDiceTrayState());
}

export async function upsertDryhDiceTrayMessage(): Promise<ChatMessage.Implementation | null> {
  cancelScheduledDryhDiceTrayMessageSync();
  const state = getDiceTrayState();
  const content = await renderDryhDiceTrayCard(state);

  if (!content) {
    await deleteActiveDryhDiceTrayMessage();
    return null;
  }

  const actor = await resolveTrayActor(state);
  const existingMessage = getActiveDryhDiceTrayMessage();

  if (existingMessage) {
    await existingMessage.update({
      [`flags.${SYSTEM_ID}.${DRYH_DICE_TRAY_FLAG}`]:
        createDryhDiceTrayCardFlag(state),
      content,
      speaker: getSpeaker(actor)
    } as Record<string, unknown>);

    return existingMessage;
  }

  return ChatMessage.create({
    content,
    flags: {
      [SYSTEM_ID]: {
        [DRYH_DICE_TRAY_FLAG]: createDryhDiceTrayCardFlag(state)
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
  message: ChatMessage.Implementation,
  pool: YakovDryhDiceTrayPool,
  delta: number
): Promise<void> {
  const state = getDryhDiceTrayCardState(message);

  if (!state) {
    return;
  }

  const actor = await resolveTrayActor(state);
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

  const nextState = adjustDiceTrayStatePool(state, pool, delta);

  if (!nextState) {
    return;
  }

  await setDiceTrayState(nextState, { syncMode: "none" });
  await rerenderDryhDiceTrayMessage(message, nextState);
}

export async function rollDryhDiceTray(
  message?: ChatMessage.Implementation
): Promise<ChatMessage.Implementation | null> {
  const state = message
    ? getDryhDiceTrayCardState(message)
    : getDiceTrayState();

  if (!state || state.pools.pain < 1 || !state.actorId) {
    return null;
  }

  const actor = await resolveTrayActor(state);

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

  if (message && hasDryhDiceTrayCard(message)) {
    cancelScheduledDryhDiceTrayMessageSync();
    await message.delete();
  } else {
    await deleteActiveDryhDiceTrayMessage();
  }
  await resetDiceTrayState();

  return resultMessage;
}

export function applyDryhDiceTrayCardPermissions(
  message: ChatMessage.Implementation,
  html: HTMLElement
): void {
  const state = getDryhDiceTrayCardState(message);

  if (!state) {
    return;
  }

  const actor = state.actorId
    ? (game.actors?.get(state.actorId) ?? null)
    : null;
  const context = createDiceTrayCardContext({
    isActorOwner: actor?.isOwner ?? false,
    isGm: game.user?.isGM ?? false,
    state
  });
  const poolSummaries = new Map(
    context.poolSummaries.map((summary) => [summary.key, summary])
  );

  html
    .querySelectorAll<HTMLButtonElement>("[data-yakov-dryh-tray-card-pool]")
    .forEach((button) => {
      const pool = button.dataset.yakovDryhTrayCardPool as
        | YakovDryhDiceTrayPool
        | undefined;
      const delta = Number.parseInt(
        button.dataset.yakovDryhTrayCardDelta ?? "0",
        10
      );
      const summary = pool ? poolSummaries.get(pool) : null;
      const canUseButton = delta < 0
        ? summary?.controls.canDecrease === true
        : summary?.controls.canIncrease === true;

      button.toggleAttribute("disabled", !canUseButton);
    });

  html
    .querySelector<HTMLButtonElement>("[data-yakov-dryh-tray-card-action='roll']")
    ?.toggleAttribute("disabled", context.rollDisabled);
}

function cancelScheduledDryhDiceTrayMessageSync(): void {
  if (scheduledDiceTrayMessageSync === null) {
    return;
  }

  clearTimeout(scheduledDiceTrayMessageSync);
  scheduledDiceTrayMessageSync = null;
}
