export interface DryhRollActionVisibilityOptions {
  isActorOwner: boolean;
  isGm: boolean;
}

interface ChatMessageLike {
  id?: string | null;
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
  const isPlayerAction =
    action === "spend-hope" || action === "take-post-roll-exhaustion";
  const isActorOwnerResolutionAction = action === "resolve-dominant";

  if (isGmAction && !options.isGm) {
    return true;
  }

  if ((isPlayerAction || isActorOwnerResolutionAction) && !options.isActorOwner) {
    return true;
  }

  return false;
}

export function shouldShowPainRollWaitingMessage(
  action: string | undefined,
  options: DryhRollActionVisibilityOptions
): boolean {
  return action === "roll-pain" && !options.isGm;
}
