import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DRYH_DICE_TRAY_FLAG,
  SYSTEM_ID
} from "../src/module/constants.ts";
import {
  getDiceTrayState,
  normalizeDiceTrayState,
  resetDiceTrayState,
  type YakovDryhDiceTrayState
} from "../src/module/applications/ui/dice-tray-state.ts";
import {
  adjustDryhDiceTrayPool,
  applyDryhDiceTrayCardPermissions
} from "../src/module/chat/dice-tray-card-service.ts";

class TestActor {
  id = "actor-1";
  isOwner = false;
  name = "Samewere";
  system = {
    discipline: 2,
    exhaustion: 2,
    madnessPermanent: 3,
    responses: {
      fight: true,
      flight: true
    }
  };
  uuid = "Actor.actor-1";
}

function createTestState(): YakovDryhDiceTrayState {
  return normalizeDiceTrayState({
    actorId: "actor-1",
    actorName: "Samewere",
    actorUuid: "Actor.actor-1",
    basePools: {
      discipline: 2,
      exhaustion: 2,
      madness: 3,
      pain: 0
    },
    confirmed: false,
    pools: {
      discipline: 2,
      exhaustion: 2,
      madness: 3,
      pain: 0
    }
  });
}

function createDiceTrayMessage(
  state: unknown,
  update = vi.fn(async () => undefined)
): ChatMessage.Implementation {
  return {
    getFlag: (scope: string, key: string): unknown =>
      scope === SYSTEM_ID && key === DRYH_DICE_TRAY_FLAG
        ? {
            state,
            type: "dice-tray"
          }
        : null,
    update
  } as ChatMessage.Implementation;
}

function createDiceTrayCardHtml(): HTMLElement {
  const html = document.createElement("article");

  html.innerHTML = `
    <button
      data-yakov-dryh-tray-card-pool="pain"
      data-yakov-dryh-tray-card-delta="1"
      disabled
    >
      +
    </button>
    <button
      data-yakov-dryh-tray-card-action="roll"
      disabled
    >
      Roll
    </button>
  `;

  return html;
}

describe("dice tray card service", () => {
  let actor: TestActor;

  beforeEach(() => {
    actor = new TestActor();

    globalThis.Actor = TestActor as unknown as typeof Actor;
    globalThis.ChatMessage = {
      getSpeaker: vi.fn(() => ({ actor: actor.id }))
    } as unknown as typeof ChatMessage;
    globalThis.foundry = {
      applications: {
        handlebars: {
          renderTemplate: vi.fn(async () => "<article></article>")
        }
      }
    } as unknown as typeof foundry;
    globalThis.game = {
      actors: {
        get: () => actor
      },
      i18n: {
        localize: (key: string) => key
      },
      user: {
        isGM: true
      }
    } as typeof game;
  });

  afterEach(async () => {
    await resetDiceTrayState();
    vi.restoreAllMocks();
  });

  it("enables pain controls for the GM even when the stored HTML was rendered by a player", () => {
    const state = createTestState();
    const html = createDiceTrayCardHtml();

    applyDryhDiceTrayCardPermissions(createDiceTrayMessage(state), html);

    expect(
      html
        .querySelector<HTMLButtonElement>(
          "[data-yakov-dryh-tray-card-pool='pain'][data-yakov-dryh-tray-card-delta='1']"
        )
        ?.hasAttribute("disabled")
    ).toBe(false);
  });

  it("keeps pain controls disabled for non-GM users", () => {
    globalThis.game.user = {
      isGM: false
    } as typeof game.user;

    const state = createTestState();
    const html = createDiceTrayCardHtml();
    const painButton = html.querySelector<HTMLButtonElement>(
      "[data-yakov-dryh-tray-card-pool='pain'][data-yakov-dryh-tray-card-delta='1']"
    );

    painButton?.removeAttribute("disabled");

    applyDryhDiceTrayCardPermissions(createDiceTrayMessage(state), html);

    expect(painButton?.hasAttribute("disabled")).toBe(true);
  });

  it("lets the GM add pain from the chat card state stored by another client", async () => {
    const update = vi.fn(async () => undefined);
    const message = createDiceTrayMessage(createTestState(), update);

    await adjustDryhDiceTrayPool(message, "pain", 1);

    const payload = update.mock.calls[0]?.[0] as
      | Record<string, unknown>
      | undefined;
    const flagPath = `flags.${SYSTEM_ID}.${DRYH_DICE_TRAY_FLAG}`;
    const flag = payload?.[flagPath] as
      | { state?: YakovDryhDiceTrayState }
      | undefined;

    expect(update).toHaveBeenCalledOnce();
    expect(flag?.state?.pools.pain).toBe(1);
    expect(getDiceTrayState().pools.pain).toBe(1);
  });
});
