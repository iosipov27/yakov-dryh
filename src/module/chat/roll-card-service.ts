import { DRYH_EXHAUSTION_MAX, normalizeCharacterSystemData } from "../data/index.js";
import {
  DRYH_ROLL_FLAG,
  SYSTEM_ID,
  TEMPLATE_PATHS
} from "../constants.js";
import {
  applyPainRollToRollResult,
  applyGmActionToRollResult,
  type YakovDryhDominantPool,
  type YakovDryhGmAction,
  type YakovDryhRollResult
} from "../dice/index.js";
import {
  addDespair,
  spendDespairForHope
} from "../resources/index.js";

export interface YakovDryhInitialRollCardData {
  actorId: string | null;
  actorName: string;
  actorUuid: string | null;
  finalMessageId: string | null;
  finalized: boolean;
  gmActionUsed: boolean;
  painRolled: boolean;
  rollResult: YakovDryhRollResult;
  stage: "initial";
}

export interface YakovDryhFinalRollCardData {
  actorId: string | null;
  actorName: string;
  actorUuid: string | null;
  effectText: string;
  modifiedResult: YakovDryhRollResult;
  originalRollId: string | null;
  stage: "final";
}

export type YakovDryhRollCardData =
  | YakovDryhInitialRollCardData
  | YakovDryhFinalRollCardData;

interface CreateInitialRollMessageInput {
  actor: Actor.Implementation;
  rollResult: YakovDryhRollResult;
}

interface RollPoolSummary {
  cssClass: string;
  dice: string;
  hasSix: boolean;
  key: YakovDryhDominantPool;
  label: string;
  successes: number;
}

function cloneRollCardData(card: YakovDryhRollCardData): YakovDryhRollCardData {
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

function getRollCardFlag(
  message: ChatMessage.Implementation
): YakovDryhRollCardData | undefined {
  const flag = (
    message as unknown as {
      getFlag: (scope: string, key: string) => unknown;
    }
  ).getFlag(SYSTEM_ID, DRYH_ROLL_FLAG);

  if (!flag || typeof flag !== "object") {
    return undefined;
  }

  return cloneRollCardData(flag as YakovDryhRollCardData);
}

function getRollResult(card: YakovDryhRollCardData): YakovDryhRollResult {
  return card.stage === "initial" ? card.rollResult : card.modifiedResult;
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;
  return localizedValue === key ? fallback : localizedValue;
}

function formatOutcome(outcome: YakovDryhRollResult["outcome"]): string {
  return localize(
    `YAKOV_DRYH.ROLL.Outcomes.${outcome}`,
    outcome === "success" ? "Success" : "Failure"
  );
}

function formatDominantPool(pool: YakovDryhDominantPool): string {
  return localize(
    `YAKOV_DRYH.ROLL.Pools.${pool}`,
    pool.charAt(0).toUpperCase() + pool.slice(1)
  );
}

function formatDice(dice: number[]): string {
  return dice.length > 0 ? dice.join(", ") : "-";
}

function getPoolSummaries(rollResult: YakovDryhRollResult): RollPoolSummary[] {
  return [
    {
      cssClass: "yakov-dryh-roll-pool--discipline",
      dice: formatDice(rollResult.pools.discipline),
      hasSix: rollResult.pools.discipline.includes(6),
      key: "discipline",
      label: formatDominantPool("discipline"),
      successes: rollResult.pools.discipline.filter((die) => die <= 3).length
    },
    {
      cssClass: "yakov-dryh-roll-pool--exhaustion",
      dice: formatDice(rollResult.pools.exhaustion),
      hasSix: rollResult.pools.exhaustion.includes(6),
      key: "exhaustion",
      label: formatDominantPool("exhaustion"),
      successes: rollResult.pools.exhaustion.filter((die) => die <= 3).length
    },
    {
      cssClass: "yakov-dryh-roll-pool--madness",
      dice: formatDice(rollResult.pools.madness),
      hasSix: rollResult.pools.madness.includes(6),
      key: "madness",
      label: formatDominantPool("madness"),
      successes: rollResult.pools.madness.filter((die) => die <= 3).length
    },
    {
      cssClass: "yakov-dryh-roll-pool--pain",
      dice: formatDice(rollResult.pools.pain),
      hasSix: rollResult.pools.pain.includes(6),
      key: "pain",
      label: formatDominantPool("pain"),
      successes: rollResult.pools.pain.filter((die) => die <= 3).length
    }
  ];
}

async function renderRollCard(card: YakovDryhRollCardData): Promise<string> {
  const rollResult = getRollResult(card);
  const isInitial = card.stage === "initial";
  const canAdjust = isInitial
    ? !card.finalized && card.painRolled && !card.gmActionUsed
    : false;
  const canFinalize = isInitial ? !card.finalized && card.painRolled : false;
  const canRollPain = isInitial ? !card.finalized && !card.painRolled : false;
  const finalMessageId = isInitial ? card.finalMessageId : null;
  const isResolved = isInitial ? card.finalized : true;
  const effectText = isInitial ? null : card.effectText;

  return foundry.applications.handlebars.renderTemplate(TEMPLATE_PATHS.dryhRollCard, {
    actorName: card.actorName,
    canAdjust,
    canFinalize,
    canRollPain,
    dominantLabel: formatDominantPool(rollResult.dominant),
    effectText,
    finalMessageId,
    isFinal: card.stage === "final",
    isInitial,
    isResolved,
    outcomeLabel: formatOutcome(rollResult.outcome),
    poolSummaries: getPoolSummaries(rollResult),
    rollResult,
    stageLabel:
      card.stage === "initial"
        ? localize("YAKOV_DRYH.ROLL.Chat.InitialTitle", "Roll Result")
        : localize("YAKOV_DRYH.ROLL.Chat.FinalTitle", "Final Result")
  });
}

async function resolveActor(
  actorUuid: string | null,
  actorId: string | null
): Promise<Actor.Implementation | null> {
  if (actorUuid) {
    const document = await fromUuid(actorUuid);

    if (document instanceof Actor) {
      return document;
    }
  }

  if (actorId) {
    return game.actors?.get(actorId) ?? null;
  }

  return null;
}

function getSpeaker(
  actor: Actor.Implementation | null
): ReturnType<typeof ChatMessage.getSpeaker> {
  if (actor) {
    return ChatMessage.getSpeaker({ actor });
  }

  return ChatMessage.getSpeaker();
}

function createInitialRollCardData(
  input: CreateInitialRollMessageInput
): YakovDryhInitialRollCardData {
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

async function applyDominantEffect(
  actor: Actor.Implementation,
  rollResult: YakovDryhRollResult
): Promise<string> {
  switch (rollResult.dominant) {
    case "discipline":
      return localize(
        "YAKOV_DRYH.ROLL.Effects.discipline",
        "You may recover control."
      );

    case "exhaustion": {
      const actorData = normalizeCharacterSystemData(actor.system);
      const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);

      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);

      return localize(
        "YAKOV_DRYH.ROLL.Effects.exhaustion",
        "Gain +1 Exhaustion."
      );
    }

    case "madness":
      return localize(
        "YAKOV_DRYH.ROLL.Effects.madness",
        "Mark a Response."
      );

    case "pain": {
      const nextDespair = await addDespair(1);

      return `${localize(
        "YAKOV_DRYH.ROLL.Effects.pain",
        "GM gains +1 Despair."
      )} ${localize(
        "YAKOV_DRYH.ROLL.Effects.DespairTotal",
        "Total Despair:"
      )} ${nextDespair}`;
    }
  }

  return localize(
    "YAKOV_DRYH.ROLL.Effects.discipline",
    "You may recover control."
  );
}

export function hasDryhRollCard(
  message: ChatMessage.Implementation
): boolean {
  return Boolean(getRollCardFlag(message));
}

export function getDryhRollCardData(
  message: ChatMessage.Implementation
): YakovDryhRollCardData {
  const card = getRollCardFlag(message);

  if (!card) {
    throw new Error("Chat message does not contain a DRYH roll card.");
  }

  return card;
}

export async function createDryhInitialRollMessage(
  input: CreateInitialRollMessageInput
): Promise<ChatMessage.Implementation> {
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
  } as Record<string, unknown>) as Promise<ChatMessage.Implementation>;
}

async function updateInitialRollMessage(
  message: ChatMessage.Implementation,
  card: YakovDryhInitialRollCardData
): Promise<YakovDryhInitialRollCardData> {
  const updatedContent = await renderRollCard(card);

  await message.update({
    [`flags.${SYSTEM_ID}.${DRYH_ROLL_FLAG}`]: card,
    content: updatedContent
  } as Record<string, unknown>);

  return card;
}

async function createFinalizedRollMessage(
  message: ChatMessage.Implementation,
  card: YakovDryhInitialRollCardData,
  actor: Actor.Implementation,
  modifiedResult: YakovDryhRollResult
): Promise<ChatMessage.Implementation> {
  const effectText = await applyDominantEffect(actor, modifiedResult);
  const finalCard: YakovDryhFinalRollCardData = {
    actorId: card.actorId,
    actorName: card.actorName,
    actorUuid: card.actorUuid,
    effectText,
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
  } as Record<string, unknown>)) as ChatMessage.Implementation;
  const updatedInitialCard: YakovDryhInitialRollCardData = {
    ...card,
    finalMessageId: finalMessage.id ?? null,
    finalized: true,
    rollResult: modifiedResult
  };

  await updateInitialRollMessage(message, updatedInitialCard);

  return finalMessage;
}

export async function applyDryhRollGmAction(
  message: ChatMessage.Implementation,
  action: YakovDryhGmAction
): Promise<YakovDryhInitialRollCardData | null> {
  const card = getRollCardFlag(message);

  if (
    !card ||
    card.stage !== "initial" ||
    card.finalized ||
    !card.painRolled ||
    card.gmActionUsed
  ) {
    return null;
  }

  const updatedPools = await spendDespairForHope();

  if (!updatedPools) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.DespairRequired",
        "At least 1 Despair is required to adjust a six."
      )
    );

    return null;
  }

  const updatedCard: YakovDryhInitialRollCardData = {
    ...card,
    gmActionUsed: true,
    rollResult: applyGmActionToRollResult(card.rollResult, action)
  };

  return updateInitialRollMessage(message, updatedCard);
}

export async function finalizeDryhRoll(
  message: ChatMessage.Implementation
): Promise<ChatMessage.Implementation | null> {
  const card = getRollCardFlag(message);

  if (!card || card.stage !== "initial" || card.finalized || !card.painRolled) {
    return null;
  }

  const actor = await resolveActor(card.actorUuid, card.actorId);

  if (!actor) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.ActorUnavailable",
        "Actor is no longer available."
      )
    );

    return null;
  }

  return createFinalizedRollMessage(message, card, actor, card.rollResult);
}

export async function finalizeDryhRollWithPain(
  message: ChatMessage.Implementation,
  painDice: number
): Promise<YakovDryhInitialRollCardData | null> {
  const card = getRollCardFlag(message);

  if (!card || card.stage !== "initial" || card.finalized || card.painRolled) {
    return null;
  }

  const normalizedPainDice = Math.max(Math.trunc(painDice), 1);
  const updatedCard: YakovDryhInitialRollCardData = {
    ...card,
    painRolled: true,
    rollResult: applyPainRollToRollResult(card.rollResult, normalizedPainDice)
  };

  return updateInitialRollMessage(message, updatedCard);
}
