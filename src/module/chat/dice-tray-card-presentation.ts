import {
  canDecreaseDiceTrayPool,
  canIncreaseDiceTrayPool,
  hasLoadedDiceTrayActor,
  type YakovDryhDiceTrayPool,
  type YakovDryhDiceTrayState
} from "../applications/ui/dice-tray-state.js";
import { ADDABLE_DICE_TRAY_POOLS } from "../applications/ui/dice-tray-rules.js";
import {
  createDiceTrayPoolPips,
  type DiceTrayPoolPipPresentation
} from "../applications/ui/dice-tray-pool-presentation.js";

export interface DiceTrayCardPoolSummary {
  empty: boolean;
  key: YakovDryhDiceTrayPool;
  label: string;
  pips: DiceTrayPoolPipPresentation[];
  trackClass: string | null;
}

export interface DiceTrayCardPaletteButton {
  disabled: boolean;
  key: YakovDryhDiceTrayPool;
  label: string;
  modifierClass: string;
}

export interface YakovDryhDiceTrayCardContext {
  actorName: string;
  paletteButtons: DiceTrayCardPaletteButton[];
  poolSummaries: DiceTrayCardPoolSummary[];
  rollDisabled: boolean;
  statusLabel: string;
  trayTitle: string;
}

interface CreateDiceTrayCardContextInput {
  isActorOwner: boolean;
  isGm: boolean;
  state: YakovDryhDiceTrayState;
}

export function createDiceTrayCardContext(
  input: CreateDiceTrayCardContextInput
): YakovDryhDiceTrayCardContext {
  const { isActorOwner, isGm, state } = input;
  const hasActor = hasLoadedDiceTrayActor(state);
  const canRoll = hasActor && state.pools.pain > 0 && (isActorOwner || isGm);

  return {
    actorName: state.actorName,
    paletteButtons: createPaletteButtons(state, { isActorOwner, isGm }),
    poolSummaries: createPoolSummaries(state, { isActorOwner, isGm }),
    rollDisabled: !canRoll,
    statusLabel: getStatusLabel(state),
    trayTitle: state.actorName
      || localize("YAKOV_DRYH.TRAY.NoActor", "No active character")
  };
}

function createPoolSummaries(
  state: YakovDryhDiceTrayState,
  permissions: {
    isActorOwner: boolean;
    isGm: boolean;
  }
): DiceTrayCardPoolSummary[] {
  const canEditPlayerPools = permissions.isActorOwner || permissions.isGm;

  return (["discipline", "exhaustion", "madness", "pain"] as YakovDryhDiceTrayPool[]).map(
    (key) => {
      const removable =
        key === "pain"
          ? permissions.isGm && canDecreaseDiceTrayPool(state, key)
          : canEditPlayerPools && canDecreaseDiceTrayPool(state, key);
      const pipCount = state.pools[key];
      const pips = createDiceTrayPoolPips({
        pipCount,
        poolLabel: formatPool(key),
        removeActionLabel: localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die"),
        removable
      });

      return {
        empty: pipCount === 0,
        key,
        label: formatPool(key),
        pips,
        trackClass: getPoolTrackClass(key)
      };
    }
  );
}

function createPaletteButtons(
  state: YakovDryhDiceTrayState,
  permissions: {
    isActorOwner: boolean;
    isGm: boolean;
  }
): DiceTrayCardPaletteButton[] {
  const canEditPlayerPools = permissions.isActorOwner || permissions.isGm;

  return ADDABLE_DICE_TRAY_POOLS.map(
    (key) => ({
      disabled:
        key === "pain"
          ? !permissions.isGm || !canIncreaseDiceTrayPool(state, key)
          : !canEditPlayerPools || !canIncreaseDiceTrayPool(state, key),
      key,
      label: `${localize("YAKOV_DRYH.UI.Actions.AddDie", "Add 1 die")} (${formatPool(key)})`,
      modifierClass: `yakov-dryh-dice-tray__palette-button--${key}`
    })
  );
}

function getPoolTrackClass(pool: YakovDryhDiceTrayPool): string | null {
  switch (pool) {
    case "exhaustion":
      return "yakov-dryh-pip-track--exhaustion";

    case "madness":
      return "yakov-dryh-pip-track--madness";

    case "pain":
      return "yakov-dryh-pip-track--pain";

    default:
      return null;
  }
}

function getStatusLabel(state: YakovDryhDiceTrayState): string {
  return "";
}

function formatPool(pool: YakovDryhDiceTrayPool): string {
  return localize(
    `YAKOV_DRYH.ROLL.Pools.${pool}`,
    pool.charAt(0).toUpperCase() + pool.slice(1)
  );
}

function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;

  return localizedValue === key ? fallback : localizedValue;
}
