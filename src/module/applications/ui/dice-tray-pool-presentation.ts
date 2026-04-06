export const DICE_TRAY_RENDER_SLOT_COUNT = 20;

export interface DiceTrayPoolControlsPresentation {
  canDecrease: boolean;
  canIncrease: boolean;
  decreaseLabel: string;
  increaseLabel: string;
}

export interface DiceTrayPoolPipPresentation {
  hidden: boolean;
  removable: boolean;
  tooltip: string | null;
}

interface CreateDiceTrayPoolPipsInput {
  pipCount: number;
  poolLabel: string;
  removeActionLabel: string;
  removable: boolean;
}

export function createDiceTrayPoolPips(
  input: CreateDiceTrayPoolPipsInput
): DiceTrayPoolPipPresentation[] {
  const pipCount = clampSlotCount(input.pipCount);

  return Array.from({ length: DICE_TRAY_RENDER_SLOT_COUNT }, (_entry, index) => {
    const hidden = index >= pipCount;
    const removable = !hidden && input.removable && index === pipCount - 1;

    return {
      hidden,
      removable,
      tooltip: removable
        ? `${input.removeActionLabel} (${input.poolLabel})`
        : null
    };
  });
}

function clampSlotCount(value: number): number {
  return Math.max(0, Math.min(Math.trunc(value), DICE_TRAY_RENDER_SLOT_COUNT));
}
