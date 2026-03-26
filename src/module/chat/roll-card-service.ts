import {
  checkFirstUncheckedResponse,
  DRYH_EXHAUSTION_MAX,
  normalizeCharacterSystemData,
  uncheckFirstCheckedResponse,
  type YakovDryhResponseType
} from "../data/index.js";
import {
  DRYH_ROLL_FLAG,
  SYSTEM_PATH,
  SYSTEM_ID,
  TEMPLATE_PATHS
} from "../constants.js";
import {
  applyHopeBoostToRollResult,
  applyPainRollToRollResult,
  applyPostRollExhaustionToRollResult,
  applyGmActionToRollResult,
  type YakovDryhDominantPool,
  type YakovDryhGmAction,
  type YakovDryhRollResult
} from "../dice/index.js";
import {
  appendEffectText,
  createDefaultShadowCastingData,
  createHopeEffectText,
  createPainDominantEffectText,
  shouldAwardPainDominantDespair,
  updateShadowCastingData,
  type YakovDryhShadowCastingData
} from "./shadow-casting.js";
import {
  addHope,
  addDespair,
  getSharedDespairTotal,
  getSharedHopeTotal,
  spendDespair,
  spendHope,
} from "../resources/index.js";
import {
  getDominantResolutionActions,
  type YakovDryhDominantResolutionAction
} from "./dominant-resolution.js";
import {
  getFailureConsequence,
  type YakovDryhFailureConsequence
} from "./failure-consequence.js";
import {
  getFailureResolutionActions,
  type YakovDryhFailureResolutionAction
} from "./failure-resolution.js";

export interface YakovDryhPlayerAdjustmentsData {
  hopeBoostUsed: boolean;
  postRollExhaustionTaken: boolean;
  preRollExhaustionTaken: boolean;
}

export interface YakovDryhInitialRollCardData {
  actorId: string | null;
  actorName: string;
  actorUuid: string | null;
  finalMessageId: string | null;
  finalized: boolean;
  gmActionUsed: boolean;
  painRolled: boolean;
  playerAdjustments: YakovDryhPlayerAdjustmentsData;
  rollResult: YakovDryhRollResult;
  shadowCasting: YakovDryhShadowCastingData;
  stage: "initial";
}

export interface YakovDryhFinalRollCardData {
  actorId: string | null;
  actorName: string;
  actorUuid: string | null;
  dominantEffectText: string;
  dominantResolutionText: string | null;
  failureConsequence: YakovDryhFailureConsequence;
  failureEffectText: string | null;
  failureResolutionText: string | null;
  modifiedResult: YakovDryhRollResult;
  originalRollId: string | null;
  stage: "final";
}

export type YakovDryhRollCardData =
  | YakovDryhInitialRollCardData
  | YakovDryhFinalRollCardData;

interface CreateInitialRollMessageInput {
  actor: Actor.Implementation;
  preRollExhaustionTaken: boolean;
  rollResult: YakovDryhRollResult;
}

interface RollDieSummary {
  alt: string;
  src: string;
  value: number;
}

interface RollPoolSummary {
  cssClass: string;
  dice: RollDieSummary[];
  hasDice: boolean;
  hasSix: boolean;
  key: YakovDryhDominantPool;
  label: string;
  successes: number;
}

interface FailureResolutionButtonSummary {
  label: string;
  responseType: YakovDryhResponseType | null;
  type: YakovDryhFailureResolutionAction["type"];
}

export interface YakovDryhPlayerRollAction {
  type: YakovDryhPlayerRollActionType;
}

export type YakovDryhPlayerRollActionType =
  | "spend-hope"
  | "take-post-roll-exhaustion";

interface PlayerActionButtonSummary {
  label: string;
  type: YakovDryhPlayerRollActionType;
}

interface DominantResolutionButtonSummary {
  label: string;
  responseType: YakovDryhResponseType | null;
  type: YakovDryhDominantResolutionAction["type"];
}

export interface YakovDryhRollCardPresentationState {
  showDominant: boolean;
  showOutcome: boolean;
  showPainRollWaiting: boolean;
}

function createDefaultPlayerAdjustmentsData(): YakovDryhPlayerAdjustmentsData {
  return {
    hopeBoostUsed: false,
    postRollExhaustionTaken: false,
    preRollExhaustionTaken: false
  };
}

function cloneRollCardData(card: YakovDryhRollCardData): YakovDryhRollCardData {
  if (card.stage === "initial") {
    const playerAdjustments = {
      ...createDefaultPlayerAdjustmentsData(),
      ...card.playerAdjustments
    };
    const shadowCasting = {
      ...createDefaultShadowCastingData(),
      ...card.shadowCasting
    };

    return {
      ...card,
      playerAdjustments,
      shadowCasting,
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

function getRollDieIconStyle(pool: YakovDryhDominantPool): "outline" | "solid" {
  return pool === "discipline" ? "outline" : "solid";
}

function getRollDieIconSrc(
  pool: YakovDryhDominantPool,
  value: number
): string {
  const dieValue = Math.min(Math.max(Math.trunc(value), 1), 6);

  return `${SYSTEM_PATH}/assets/d6-${getRollDieIconStyle(pool)}-${dieValue}.svg`;
}

function getRollDiceSummary(
  pool: YakovDryhDominantPool,
  dice: number[]
): RollDieSummary[] {
  const label = formatDominantPool(pool);

  return dice.map((value) => ({
    alt: `${label} ${value}`,
    src: getRollDieIconSrc(pool, value),
    value
  }));
}

function getPoolSummaries(rollResult: YakovDryhRollResult): RollPoolSummary[] {
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

export function canTakePostRollExhaustion(
  card: YakovDryhInitialRollCardData
): boolean {
  return (
    card.painRolled &&
    !card.playerAdjustments.preRollExhaustionTaken &&
    !card.playerAdjustments.postRollExhaustionTaken &&
    card.rollResult.pools.exhaustion.length < DRYH_EXHAUSTION_MAX
  );
}

export function canSpendHopeForDiscipline(
  card: YakovDryhInitialRollCardData,
  hopeTotal = getSharedHopeTotal()
): boolean {
  return card.painRolled && !card.playerAdjustments.hopeBoostUsed && hopeTotal >= 1;
}

export function getAvailablePlayerRollActionTypes(
  card: YakovDryhInitialRollCardData,
  hopeTotal = getSharedHopeTotal()
): YakovDryhPlayerRollActionType[] {
  const actions: YakovDryhPlayerRollActionType[] = [];

  if (canSpendHopeForDiscipline(card, hopeTotal)) {
    actions.push("spend-hope");
  }

  if (canTakePostRollExhaustion(card)) {
    actions.push("take-post-roll-exhaustion");
  }

  return actions;
}

function getPlayerActionButtons(
  card: YakovDryhInitialRollCardData
): PlayerActionButtonSummary[] {
  return getAvailablePlayerRollActionTypes(card).map((type) => ({
    label:
      type === "spend-hope"
        ? localize(
            "YAKOV_DRYH.ROLL.Actions.SpendHopeForDiscipline",
            "-1 Hope -> add 1 to Discipline"
          )
        : localize(
            "YAKOV_DRYH.ROLL.Actions.TakePostRollExhaustion",
            "+1 Exhaustion after roll"
          ),
    type
  }));
}

export function getRollCardPresentationState(
  card: YakovDryhRollCardData
): YakovDryhRollCardPresentationState {
  const showOutcome = card.stage === "final" || card.painRolled;

  return {
    showDominant: showOutcome,
    showOutcome,
    showPainRollWaiting:
      card.stage === "initial" && !card.finalized && !card.painRolled
  };
}

async function renderRollCard(card: YakovDryhRollCardData): Promise<string> {
  const rollResult = getRollResult(card);
  const isInitial = card.stage === "initial";
  const presentationState = getRollCardPresentationState(card);
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
    : ((card as { effectText?: string }).effectText ?? null);
  const dominantEffectText = isInitial
    ? null
    : card.dominantResolutionText ?? card.dominantEffectText ?? legacyEffectText;
  const failureEffectText = isInitial
    ? null
    : card.failureResolutionText ?? card.failureEffectText;
  const dominantResolutionButtons = isInitial
    ? []
    : await getDominantResolutionButtons(card);
  const dominantResolutionPrompt =
    dominantResolutionButtons.length > 1
      ? localize("YAKOV_DRYH.ROLL.Chat.ChooseOne", "Choose one:")
      : null;
  const failureResolutionButtons = isInitial
    ? []
    : await getFailureResolutionButtons(card);
  const playerActionButtons = isInitial ? getPlayerActionButtons(card) : [];
  const failureResolutionPrompt =
    failureResolutionButtons.length > 1
      ? localize("YAKOV_DRYH.ROLL.Chat.ChooseOne", "Choose one:")
      : null;
  const playerActionPrompt =
    playerActionButtons.length > 0
      ? localize(
          "YAKOV_DRYH.ROLL.Chat.PlayerActions",
          "Player post-roll actions:"
        )
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
    showDominant: presentationState.showDominant,
    showAdjustments,
    showOutcome: presentationState.showOutcome,
    showPainRollWaiting: presentationState.showPainRollWaiting,
    stageLabel:
      card.stage === "initial"
        ? localize("YAKOV_DRYH.ROLL.Chat.InitialTitle", "Roll Result")
        : localize("YAKOV_DRYH.ROLL.Chat.FinalTitle", "Final Result"),
    waitingForPainLabel: localize(
      "YAKOV_DRYH.ROLL.Chat.WaitingForPain",
      "⏳ Waiting for GM Pain roll..."
    )
  });
}

async function resolveActor(
  actorUuid: string | null,
  actorId: string | null
): Promise<Actor.Implementation | null> {
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

function createFailureResolutionButtonLabel(
  action: YakovDryhFailureResolutionAction
): string {
  switch (action.type) {
    case "gain-exhaustion":
      return localize(
        "YAKOV_DRYH.ROLL.Actions.GainExhaustion",
        "+1 Exhaustion"
      );

    case "check-response":
      return action.responseType === "flight"
        ? localize(
            "YAKOV_DRYH.ROLL.Actions.CheckFlight",
            "Check Flight"
          )
        : localize(
            "YAKOV_DRYH.ROLL.Actions.CheckFight",
            "Check Fight"
          );
  }
}

function createDominantResolutionButtonLabel(
  action: YakovDryhDominantResolutionAction
): string {
  switch (action.type) {
    case "check-response":
      return action.responseType === "flight"
        ? localize(
            "YAKOV_DRYH.ROLL.Actions.CheckFlight",
            "Check Flight"
          )
        : localize(
            "YAKOV_DRYH.ROLL.Actions.CheckFight",
            "Check Fight"
          );

    case "remove-exhaustion":
      return localize(
        "YAKOV_DRYH.ROLL.Actions.RemoveExhaustion",
        "Remove 1 Exhaustion"
      );

    case "uncheck-response":
      return action.responseType === "flight"
        ? localize(
            "YAKOV_DRYH.ROLL.Actions.UncheckFlightResponse",
            "Un-check Flight Response"
          )
        : localize(
            "YAKOV_DRYH.ROLL.Actions.UncheckFightResponse",
            "Un-check Fight Response"
          );
  }
}

async function getDominantResolutionButtons(
  card: YakovDryhFinalRollCardData
): Promise<DominantResolutionButtonSummary[]> {
  if (
    (card.modifiedResult.dominant !== "discipline" &&
      card.modifiedResult.dominant !== "madness") ||
    card.dominantResolutionText
  ) {
    return [];
  }

  const actor = await resolveActor(card.actorUuid, card.actorId);

  if (!actor) {
    return [];
  }

  const actorData = normalizeCharacterSystemData(actor.system);
  return getDominantResolutionActions(
    card.modifiedResult.dominant,
    actorData.responses,
    actorData.exhaustion
  ).map((action) => ({
    label: createDominantResolutionButtonLabel(action),
    responseType: action.responseType,
    type: action.type
  }));
}

async function getFailureResolutionButtons(
  card: YakovDryhFinalRollCardData
): Promise<FailureResolutionButtonSummary[]> {
  if (card.failureConsequence === null || card.failureResolutionText) {
    return [];
  }

  const actor = await resolveActor(card.actorUuid, card.actorId);

  if (!actor) {
    return [];
  }

  const actorData = normalizeCharacterSystemData(actor.system);

  return getFailureResolutionActions(
    card.failureConsequence,
    actorData.responses
  ).map((action) => ({
    label: createFailureResolutionButtonLabel(action),
    responseType: action.responseType,
    type: action.type
  }));
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
    playerAdjustments: {
      ...createDefaultPlayerAdjustmentsData(),
      preRollExhaustionTaken: input.preRollExhaustionTaken
    },
    rollResult: input.rollResult,
    shadowCasting: createDefaultShadowCastingData(),
    stage: "initial"
  };
}

async function applyDominantEffect(
  actor: Actor.Implementation,
  rollResult: YakovDryhRollResult,
  shadowCasting: YakovDryhShadowCastingData
): Promise<string> {
  const hopeEffectText = createHopeEffectText({
    gainedHope: shadowCasting.deferredHope,
    gainsHopeText: localize(
      "YAKOV_DRYH.ROLL.Effects.HopeGain",
      "Players gain +{amount} Hope."
    ),
    hopeTotalText: localize(
      "YAKOV_DRYH.ROLL.Effects.HopeTotal",
      "Total Hope:"
    ),
    nextHopeTotal: getSharedHopeTotal() + shadowCasting.deferredHope
  });

  switch (rollResult.dominant) {
    case "discipline":
      return appendEffectText(
        localize(
          "YAKOV_DRYH.ROLL.Effects.discipline",
          "Un-check a Response or remove 1 Exhaustion."
        ),
        hopeEffectText
      );

    case "exhaustion": {
      const actorData = normalizeCharacterSystemData(actor.system);
      const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);

      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);

      return appendEffectText(
        formatActorNameEffect(
          "YAKOV_DRYH.ROLL.Effects.exhaustion",
          "{name} gains +1 Exhaustion.",
          actor.name ?? localize("DOCUMENT.Actor", "Actor")
        ),
        hopeEffectText
      );
    }

    case "madness":
      return appendEffectText(
        localize(
          "YAKOV_DRYH.ROLL.Effects.madness",
          "Mark a Response."
        ),
        hopeEffectText
      );

    case "pain": {
      const nextDespair = shouldAwardPainDominantDespair(shadowCasting)
        ? await addDespair(1)
        : getSharedDespairTotal();

      return appendEffectText(
        createPainDominantEffectText({
          despairTotalText: localize(
            "YAKOV_DRYH.ROLL.Effects.DespairTotal",
            "Total Despair:"
          ),
          gainsDespairText: localize(
            "YAKOV_DRYH.ROLL.Effects.pain",
            "GM gains +1 Despair."
          ),
          nextDespairTotal: nextDespair,
          noDespairFromShadowCastingText: localize(
            "YAKOV_DRYH.ROLL.Effects.PainNoDespairAfterShadowCasting",
            "GM does not gain +1 Despair because Pain was made dominant by shadow-casting."
          ),
          shadowCastingMadePainDominant: shadowCasting.madePainDominant
        }),
        hopeEffectText
      );
    }
  }

  return appendEffectText(
    localize(
      "YAKOV_DRYH.ROLL.Effects.discipline",
      "Un-check a Response or remove 1 Exhaustion."
    ),
    hopeEffectText
  );
}

function getFailureEffectText(
  rollResult: YakovDryhRollResult
): string | null {
  switch (getFailureConsequence(rollResult)) {
    case "gm-choice":
      return localize(
        "YAKOV_DRYH.ROLL.Effects.FailureChoice",
        "GM narrates the failure and chooses either +1 Exhaustion or mark a Response."
      );

    case "gain-exhaustion":
      return localize(
        "YAKOV_DRYH.ROLL.Effects.FailureGainExhaustion",
        "GM narrates the failure and must apply +1 Exhaustion because Madness already covers checking a Response."
      );

    case "mark-response":
      return localize(
        "YAKOV_DRYH.ROLL.Effects.FailureMarkResponse",
        "GM narrates the failure and must mark a Response because Exhaustion already covers +1 Exhaustion."
      );

    default:
      return null;
  }
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

async function updateFinalRollMessage(
  message: ChatMessage.Implementation,
  card: YakovDryhFinalRollCardData
): Promise<YakovDryhFinalRollCardData> {
  const updatedContent = await renderRollCard(card);

  await message.update({
    [`flags.${SYSTEM_ID}.${DRYH_ROLL_FLAG}`]: card,
    content: updatedContent
  } as Record<string, unknown>);

  return card;
}

export async function rerenderDryhRollMessage(
  message: ChatMessage.Implementation
): Promise<YakovDryhRollCardData | null> {
  const card = getRollCardFlag(message);

  if (!card) {
    return null;
  }

  const content = await renderRollCard(card);

  await message.update({
    content
  } as Record<string, unknown>);

  return card;
}

async function createFinalizedRollMessage(
  message: ChatMessage.Implementation,
  card: YakovDryhInitialRollCardData,
  actor: Actor.Implementation,
  modifiedResult: YakovDryhRollResult
): Promise<ChatMessage.Implementation> {
  const dominantEffectText = await applyDominantEffect(
    actor,
    modifiedResult,
    card.shadowCasting
  );
  const failureConsequence = getFailureConsequence(modifiedResult);
  const failureEffectText = getFailureEffectText(modifiedResult);
  const finalCard: YakovDryhFinalRollCardData = {
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
  } as Record<string, unknown>)) as ChatMessage.Implementation;
  const updatedInitialCard: YakovDryhInitialRollCardData = {
    ...card,
    finalMessageId: finalMessage.id ?? null,
    finalized: true,
    rollResult: modifiedResult
  };

  await updateInitialRollMessage(message, updatedInitialCard);

  if (card.shadowCasting.deferredHope > 0) {
    await addHope(card.shadowCasting.deferredHope);
  }

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

  const nextDespair = await spendDespair();

  if (nextDespair === null) {
    ui.notifications?.warn(
      localize(
        "YAKOV_DRYH.UI.Warnings.DespairRequired",
        "At least 1 Despair is required to adjust a six."
      )
    );

    return null;
  }

  const updatedRollResult = applyGmActionToRollResult(card.rollResult, action);
  const updatedCard: YakovDryhInitialRollCardData = {
    ...card,
    gmActionUsed: true,
    rollResult: updatedRollResult,
    shadowCasting: updateShadowCastingData(
      card.shadowCasting,
      card.rollResult,
      updatedRollResult
    )
  };

  return updateInitialRollMessage(message, updatedCard);
}

export async function applyDryhRollPlayerAction(
  message: ChatMessage.Implementation,
  action: YakovDryhPlayerRollAction
): Promise<YakovDryhInitialRollCardData | null> {
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
        ui.notifications?.warn(
          localize(
            "YAKOV_DRYH.UI.Warnings.HopeRequired",
            "At least 1 Hope is required to improve Discipline."
          )
        );

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
        ui.notifications?.warn(
          localize(
            "YAKOV_DRYH.UI.Warnings.ActorUnavailable",
            "Actor is no longer available."
          )
        );

        return null;
      }

      const actorData = normalizeCharacterSystemData(actor.system);
      const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);

      if (nextExhaustion === actorData.exhaustion) {
        return null;
      }

      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);

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

export async function resolveDryhRollFailureAction(
  message: ChatMessage.Implementation,
  action: YakovDryhFailureResolutionAction
): Promise<YakovDryhFinalRollCardData | null> {
  const card = getRollCardFlag(message);

  if (
    !card ||
    card.stage !== "final" ||
    card.failureConsequence === null ||
    card.failureResolutionText
  ) {
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

  let failureResolutionText: string;

  switch (action.type) {
    case "gain-exhaustion": {
      const actorData = normalizeCharacterSystemData(actor.system);
      const nextExhaustion = Math.min(actorData.exhaustion + 1, DRYH_EXHAUSTION_MAX);

      await actor.update({
        "system.exhaustion": nextExhaustion
      } as Record<string, unknown>);

      failureResolutionText = formatActorNameEffect(
        "YAKOV_DRYH.ROLL.Effects.FailureResolvedGainExhaustion",
        "{name} gains +1 Exhaustion.",
        actor.name ?? localize("DOCUMENT.Actor", "Actor")
      );
      break;
    }

    case "check-response": {
      if (!action.responseType) {
        return null;
      }

      const actorData = normalizeCharacterSystemData(actor.system);
      const responses = checkFirstUncheckedResponse(
        actorData.responses,
        action.responseType
      );

      if (!responses) {
        ui.notifications?.warn(
          `${formatResponseType(action.responseType)} ${localize(
            "YAKOV_DRYH.UI.Warnings.ResponseUnavailable",
            "Response is no longer available."
          )}`
        );

        return null;
      }

      await actor.update({
        "system.responses.slots": responses.slots,
        "system.responses.max": responses.max
      } as Record<string, unknown>);

      failureResolutionText =
        action.responseType === "flight"
          ? localize(
              "YAKOV_DRYH.ROLL.Effects.FailureResolvedCheckFlight",
              "GM checked a Flight Response."
            )
          : localize(
              "YAKOV_DRYH.ROLL.Effects.FailureResolvedCheckFight",
              "GM checked a Fight Response."
            );
      break;
    }
  }

  return updateFinalRollMessage(message, {
    ...card,
    failureResolutionText
  });
}

export async function resolveDryhRollDominantAction(
  message: ChatMessage.Implementation,
  action: YakovDryhDominantResolutionAction
): Promise<YakovDryhFinalRollCardData | null> {
  const card = getRollCardFlag(message);

  if (
    !card ||
    card.stage !== "final" ||
    (card.modifiedResult.dominant !== "discipline" &&
      card.modifiedResult.dominant !== "madness") ||
    card.dominantResolutionText
  ) {
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

  let dominantResolutionText: string;

  switch (action.type) {
    case "check-response": {
      if (!action.responseType) {
        return null;
      }

      const actorData = normalizeCharacterSystemData(actor.system);
      const responses = checkFirstUncheckedResponse(
        actorData.responses,
        action.responseType
      );

      if (!responses) {
        ui.notifications?.warn(
          `${formatResponseType(action.responseType)} ${localize(
            "YAKOV_DRYH.UI.Warnings.ResponseUnavailable",
            "Response is no longer available."
          )}`
        );

        return null;
      }

      await actor.update({
        "system.responses.slots": responses.slots,
        "system.responses.max": responses.max
      } as Record<string, unknown>);

      dominantResolutionText =
        action.responseType === "flight"
          ? localize(
              "YAKOV_DRYH.ROLL.Effects.MadnessResolvedCheckFlight",
              "A Flight Response was checked."
            )
          : localize(
              "YAKOV_DRYH.ROLL.Effects.MadnessResolvedCheckFight",
              "A Fight Response was checked."
            );
      break;
    }

    case "remove-exhaustion": {
      const actorData = normalizeCharacterSystemData(actor.system);

      if (actorData.exhaustion < 1) {
        return null;
      }

      await actor.update({
        "system.exhaustion": actorData.exhaustion - 1
      } as Record<string, unknown>);

      dominantResolutionText = formatActorNameEffect(
        "YAKOV_DRYH.ROLL.Effects.DisciplineResolvedRemoveExhaustion",
        "{name} removes 1 Exhaustion.",
        actor.name ?? localize("DOCUMENT.Actor", "Actor")
      );
      break;
    }

    case "uncheck-response": {
      if (!action.responseType) {
        return null;
      }

      const actorData = normalizeCharacterSystemData(actor.system);
      const responses = uncheckFirstCheckedResponse(
        actorData.responses,
        action.responseType
      );

      if (!responses) {
        ui.notifications?.warn(
          `${formatResponseType(action.responseType)} ${localize(
            "YAKOV_DRYH.UI.Warnings.ResponseUnavailable",
            "Response is no longer available."
          )}`
        );

        return null;
      }

      await actor.update({
        "system.responses.slots": responses.slots,
        "system.responses.max": responses.max
      } as Record<string, unknown>);

      dominantResolutionText =
        action.responseType === "flight"
          ? localize(
              "YAKOV_DRYH.ROLL.Effects.DisciplineResolvedUncheckFlight",
              "A Flight Response was un-checked."
            )
          : localize(
              "YAKOV_DRYH.ROLL.Effects.DisciplineResolvedUncheckFight",
              "A Fight Response was un-checked."
            );
      break;
    }
  }

  return updateFinalRollMessage(message, {
    ...card,
    dominantResolutionText
  });
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

function formatResponseType(responseType: YakovDryhResponseType): string {
  return responseType === "flight"
    ? localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Flight", "Flight")
    : localize("YAKOV_DRYH.SHEETS.Actor.Character.Fields.Fight", "Fight");
}

function formatActorNameEffect(
  key: string,
  fallback: string,
  actorName: string
): string {
  return localize(key, fallback).replace("{name}", actorName);
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
