import {
  canDecreaseDiceTrayPool,
  canIncreaseDiceTrayPool,
  hasLoadedDiceTrayActor,
  type YakovDryhDiceTrayPool,
  type YakovDryhDiceTrayState
} from "../applications/ui/dice-tray-state.js";
import {
  type DiceTrayPoolControlsPresentation,
  createDiceTrayPoolPips,
  type DiceTrayPoolPipPresentation
} from "../applications/ui/dice-tray-pool-presentation.js";

export interface DiceTrayCardPoolSummary {
  controls: DiceTrayPoolControlsPresentation;
  empty: boolean;
  key: YakovDryhDiceTrayPool;
  label: string;
  pips: DiceTrayPoolPipPresentation[];
  trackClass: string | null;
}

export interface YakovDryhDiceTrayCardContext {
  actorName: string;
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
        removable: false
      });

      return {
        controls: {
          canDecrease: removable,
          canIncrease:
            key === "pain"
              ? permissions.isGm && canIncreaseDiceTrayPool(state, key)
              : canEditPlayerPools && canIncreaseDiceTrayPool(state, key),
          decreaseLabel: `${localize(
            "YAKOV_DRYH.UI.Actions.RemoveDie",
            "Remove 1 die"
          )} (${formatPool(key)})`,
          increaseLabel: `${localize(
            "YAKOV_DRYH.UI.Actions.AddDie",
            "Add 1 die"
          )} (${formatPool(key)})`
        },
        empty: pipCount === 0,
        key,
        label: formatPool(key),
        pips,
        trackClass: getPoolTrackClass(key)
      };
    }
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
