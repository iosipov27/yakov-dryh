import { subscribeToDiceTrayStateChanges } from "../applications/ui/dice-tray-state.js";
import { isSharedPoolSettingChange } from "../applications/ui/setting-change.js";
import {
  adjustDryhDiceTrayPool,
  applyDryhDiceTrayCardPermissions,
  hasDryhDiceTrayCard,
  requestActiveDryhDiceTrayMessageSync,
  rollDryhDiceTray
} from "./dice-tray-card-service.js";
import {
  applyDryhRollGmAction,
  canUserControlDryhRollActorActions,
  finalizeDryhRoll,
  getDryhRollCardData,
  hasDryhRollCard,
  requestDryhRollDominantResolutionAction,
  requestDryhRollPlayerAction,
  resolveDryhRollCrashAction,
  resolveDryhRollFailureAction,
  rerenderDryhRollMessage
} from "./roll-card-service.js";
import {
  isLatestChatMessage,
  shouldHideDryhRollAction,
  shouldHideDryhRollActionGroup,
  shouldRerenderDryhRollForSharedPoolChange
} from "./roll-card-visibility.js";

let hasRegisteredDiceTrayStateSync = false;

export function registerChatHooks(): void {
  if (!hasRegisteredDiceTrayStateSync) {
    subscribeToDiceTrayStateChanges((change) => {
      requestActiveDryhDiceTrayMessageSync(change.syncMode);
    });
    hasRegisteredDiceTrayStateSync = true;
  }

  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (hasDryhDiceTrayCard(message)) {
      activateDryhDiceTrayListeners(message, html);
    }

    if (hasDryhRollCard(message)) {
      activateDryhRollListeners(message, html);
    }
  });

  Hooks.on("updateSetting", (setting: { key?: string }) => {
    if (!isSharedPoolSettingChange(setting)) {
      return;
    }

    const isActiveGm =
      (game.user?.isGM ?? false) && game.users?.activeGM?.id === game.user?.id;

    if (!isActiveGm) {
      return;
    }

    const latestMessage = (game.messages?.contents ?? []).at(-1) as
      | ChatMessage.Implementation
      | undefined;

    if (!latestMessage || !hasDryhRollCard(latestMessage)) {
      return;
    }

    const card = getDryhRollCardData(latestMessage);

    if (
      !shouldRerenderDryhRollForSharedPoolChange(card, {
        isActiveGm
      })
    ) {
      return;
    }

    void rerenderDryhRollMessage(latestMessage);
  });
}

function activateDryhDiceTrayListeners(
  message: ChatMessage.Implementation,
  html: HTMLElement
): void {
  applyDryhDiceTrayCardPermissions(message, html);

  const actionElements = html.querySelectorAll<HTMLElement>(
    [
      "[data-yakov-dryh-tray-card-action]",
      "[data-yakov-dryh-tray-card-pool]"
    ].join(", ")
  );

  actionElements.forEach((actionElement) => {
    actionElement.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      const trayAction = actionElement.dataset.yakovDryhTrayCardAction;

      if (trayAction === "roll") {
        actionElement.setAttribute("disabled", "disabled");
        void rollDryhDiceTray(message);
        return;
      }

      const trayPool = actionElement.dataset.yakovDryhTrayCardPool as
        | "discipline"
        | "exhaustion"
        | "madness"
        | "pain"
        | undefined;
      const trayDelta = Number.parseInt(
        actionElement.dataset.yakovDryhTrayCardDelta ?? "0",
        10
      );

      if (trayPool && Number.isFinite(trayDelta)) {
        actionElement.setAttribute("disabled", "disabled");
        void adjustDryhDiceTrayPool(message, trayPool, trayDelta);
      }
    });
  });
}

function activateDryhRollListeners(
  message: ChatMessage.Implementation,
  html: HTMLElement
): void {
  const actionElements = html.querySelectorAll<HTMLElement>(
    "[data-yakov-dryh-roll-action]"
  );
  const card = getDryhRollCardData(message);
  const canUseActorActions = canUserControlDryhRollActorActions(
    card,
    game.user
  );

  actionElements.forEach((actionElement) => {
    if (
      shouldHideDryhRollAction(actionElement.dataset.yakovDryhRollAction, {
        canUseActorActions,
        isGm: game.user?.isGM ?? false
      })
    ) {
      actionElement.hidden = true;
    }
  });
  hideEmptyDryhRollActionGroups(html);

  if (!isLatestChatMessage(message)) {
    disableDryhRollActions(actionElements);
    return;
  }

  actionElements.forEach((actionElement) => {
    const action = actionElement.dataset.yakovDryhRollAction;
    const targetPool = actionElement.dataset.targetPool as
      | "discipline"
      | "exhaustion"
      | "madness"
      | "pain"
      | undefined;
    const responseType = actionElement.dataset.responseType as
      | "fight"
      | "flight"
      | undefined;

    if (actionElement.hidden) {
      return;
    }

    if (card.stage === "final") {
      if (
        action !== "resolve-failure" &&
        action !== "resolve-dominant" &&
        action !== "resolve-crash"
      ) {
        actionElement.setAttribute("disabled", "disabled");
        return;
      }

      actionElement.addEventListener("click", (event: MouseEvent) => {
        event.preventDefault();

        if (!isLatestChatMessage(message)) {
          disableDryhRollActions(actionElements);
          return;
        }

        if (action === "resolve-failure") {
          html
            .querySelectorAll<HTMLElement>("[data-yakov-dryh-roll-action='resolve-failure']")
            .forEach((element) => element.setAttribute("disabled", "disabled"));

          void resolveDryhRollFailureAction(message, {
            responseType: actionElement.dataset.failureAction === "check-response"
              ? (responseType ?? null)
              : null,
            type:
              actionElement.dataset.failureAction === "check-response"
                ? "check-response"
                : actionElement.dataset.failureAction === "snap"
                  ? "snap"
                : "gain-exhaustion"
          });
          return;
        }

        if (action === "resolve-crash") {
          html
            .querySelectorAll<HTMLElement>("[data-yakov-dryh-roll-action='resolve-crash']")
            .forEach((element) => element.setAttribute("disabled", "disabled"));

          void resolveDryhRollCrashAction(message, {
            type: actionElement.dataset.crashAction === "die" ? "die" : "sleep"
          });
          return;
        }

        const dominantActionElements = html
          .querySelectorAll<HTMLElement>("[data-yakov-dryh-roll-action='resolve-dominant']");

        dominantActionElements
          .forEach((element) => element.setAttribute("disabled", "disabled"));

        const dominantAction = actionElement.dataset.dominantAction;

        void requestDryhRollDominantResolutionAction(message, {
          responseType:
            dominantAction === "uncheck-response" || dominantAction === "check-response"
              ? (responseType ?? null)
              : null,
          type:
            dominantAction === "uncheck-response" || dominantAction === "check-response"
              ? dominantAction
              : "remove-exhaustion"
        }).then((handled) => {
          if (!handled) {
            dominantActionElements
              .forEach((element) => element.removeAttribute("disabled"));
          }
        }).catch((error: unknown) => {
          console.error(error);
          dominantActionElements
            .forEach((element) => element.removeAttribute("disabled"));
        });
      });

      return;
    }

    if (card.finalized) {
      actionElement.setAttribute("disabled", "disabled");
      return;
    }

    actionElement.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      if (!isLatestChatMessage(message)) {
        disableDryhRollActions(actionElements);
        return;
      }

      if (action === "spend-hope" || action === "take-post-roll-exhaustion") {
        actionElement.setAttribute("disabled", "disabled");
        void requestDryhRollPlayerAction(message, {
          type: action
        }).then((handled) => {
          if (!handled) {
            actionElement.removeAttribute("disabled");
          }
        }).catch((error: unknown) => {
          console.error(error);
          actionElement.removeAttribute("disabled");
        });
        return;
      }

      if (action === "finalize") {
        actionElement.setAttribute("disabled", "disabled");
        void finalizeDryhRoll(message);
        return;
      }

      if (!targetPool || (action !== "add6" && action !== "remove6")) {
        return;
      }

      actionElement.setAttribute("disabled", "disabled");

      void applyDryhRollGmAction(message, {
        type: action,
        targetPool
      });
    });
  });
}

function disableDryhRollActions(actionElements: ArrayLike<HTMLElement>): void {
  for (let index = 0; index < actionElements.length; index += 1) {
    actionElements[index]?.setAttribute("disabled", "disabled");
  }
}

function hideEmptyDryhRollActionGroups(html: HTMLElement): void {
  html
    .querySelectorAll<HTMLElement>(".yakov-dryh-roll-card__resolution")
    .forEach((section) => {
      const actions = Array.from(
        section.querySelectorAll<HTMLElement>("[data-yakov-dryh-roll-action]")
      );

      section.hidden = shouldHideDryhRollActionGroup(actions);
    });
}
