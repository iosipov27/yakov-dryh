import {
  getDryhSystemSocketName,
  handleDryhRollPlayerActionSocketRequest,
  isDryhRollPlayerActionSocketRequest
} from "../chat/roll-card-service.js";

export function registerSystemSocketHandlers(): void {
  game.socket?.on(getDryhSystemSocketName(), (message: unknown) => {
    if (!isDryhRollPlayerActionSocketRequest(message)) {
      return;
    }

    void handleDryhRollPlayerActionSocketRequest(message);
  });
}
