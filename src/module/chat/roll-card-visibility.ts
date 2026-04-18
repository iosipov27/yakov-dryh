export interface DryhRollActionVisibilityOptions {
  isGm: boolean;
}

export interface DryhRollSharedPoolRerenderOptions {
  isActiveGm: boolean;
}

interface ChatMessageLike {
  id?: string | null;
}

interface RollCardLike {
  finalized?: boolean;
  stage: string;
}

export function isLatestChatMessage(
  message: ChatMessageLike | null | undefined,
  messages: readonly ChatMessageLike[] = game.messages?.contents ?? []
): boolean {
  const messageId = message?.id ?? null;

  if (!messageId) {
    return false;
  }

  return (messages.at(-1)?.id ?? null) === messageId;
}

export function shouldHideDryhRollAction(
  action: string | undefined,
  options: DryhRollActionVisibilityOptions
): boolean {
  const isGmAction =
    action === "roll-pain" ||
    action === "finalize" ||
    action === "add6" ||
    action === "remove6" ||
    action === "resolve-failure" ||
    action === "resolve-crash";
  if (isGmAction && !options.isGm) {
    return true;
  }

  return false;
}

export function shouldHideDryhRollActionGroup(
  actions: readonly { hidden: boolean }[]
): boolean {
  return actions.length > 0 && actions.every((action) => action.hidden);
}

export function shouldRerenderDryhRollForSharedPoolChange(
  card: RollCardLike,
  options: DryhRollSharedPoolRerenderOptions
): boolean {
  return options.isActiveGm && card.stage === "initial" && card.finalized !== true;
}

export function shouldShowPainRollWaitingMessage(
  action: string | undefined,
  options: DryhRollActionVisibilityOptions
): boolean {
  return action === "roll-pain" && !options.isGm;
}
