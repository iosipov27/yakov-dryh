import {
  getDryhSystemSocketName,
  handleDryhRollDominantResolutionSocketRequest,
  handleDryhRollPlayerActionSocketRequest,
  isDryhRollDominantResolutionSocketRequest,
  isDryhRollPlayerActionSocketRequest
} from "../chat/roll-card-service.js";

export function registerSystemSocketHandlers(): void {
  game.socket?.on(getDryhSystemSocketName(), (message: unknown) => {
    if (isDryhRollPlayerActionSocketRequest(message)) {
      void handleDryhRollPlayerActionSocketRequest(message);
      return;
    }

    if (isDryhRollDominantResolutionSocketRequest(message)) {
      void handleDryhRollDominantResolutionSocketRequest(message);
    }
  });
}
