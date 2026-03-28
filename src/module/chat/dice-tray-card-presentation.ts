import {
  canDecreaseDiceTrayPool,
  canIncreaseDiceTrayPool,
  hasLoadedDiceTrayActor,
  type YakovDryhDiceTrayPool,
  type YakovDryhDiceTrayState
} from "../applications/ui/dice-tray-state.js";

export interface DiceTrayCardPoolPip {
  removable: boolean;
  tooltip: string | null;
}

export interface DiceTrayCardPoolSummary {
  empty: boolean;
  key: YakovDryhDiceTrayPool;
  label: string;
  pips: DiceTrayCardPoolPip[];
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
  canLockPools: boolean;
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

  return {
    actorName: state.actorName,
    canLockPools: isGm && hasActor && !state.confirmed,
    paletteButtons: createPaletteButtons(state, { isActorOwner, isGm }),
    poolSummaries: createPoolSummaries(state, { isActorOwner, isGm }),
    rollDisabled: !hasActor || !state.confirmed,
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
      const pips: DiceTrayCardPoolPip[] = Array.from(
        { length: pipCount },
        (_entry, index) => {
          const isLastRemovable = removable && index === pipCount - 1;

          return {
            removable: isLastRemovable,
            tooltip: isLastRemovable
              ? `${localize("YAKOV_DRYH.UI.Actions.RemoveDie", "Remove 1 die")} (${formatPool(key)})`
              : null
          };
        }
      );

      return {
        empty: pips.length === 0,
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

  return (["discipline", "exhaustion", "madness", "pain"] as YakovDryhDiceTrayPool[]).map(
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
  return state.confirmed
    ? localize("YAKOV_DRYH.TRAY.Status.Ready", "Ready to roll.")
    : localize(
        "YAKOV_DRYH.TRAY.Status.WaitingForGm",
        "Waiting for GM to lock pools."
      );
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
