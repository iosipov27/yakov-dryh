export interface DryhRollActionVisibilityOptions {
  isActorOwner: boolean;
  isGm: boolean;
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
    action === "resolve-failure";
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
