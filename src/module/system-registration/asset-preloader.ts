import { SYSTEM_ID, SYSTEM_PATH } from "../constants.js";

export type SystemAssetPreloadGroup = "critical" | "warm" | "lazy";

export const SYSTEM_ASSET_SOURCE_PATHS: Record<
  SystemAssetPreloadGroup,
  readonly string[]
> = {
  critical: ["assets/bg.jpg", "assets/six-sided-dice3.svg"],
  warm: ["assets/six-sided-dice.svg", "assets/six-sided-dice2.svg"],
  lazy: []
} as const;

const ASSET_LOAD_OPTIONS: Record<
  SystemAssetPreloadGroup,
  { displayProgress: false; expireCache: false; maxConcurrent: number }
> = {
  critical: {
    displayProgress: false,
    expireCache: false,
    maxConcurrent: 4
  },
  warm: {
    displayProgress: false,
    expireCache: false,
    maxConcurrent: 2
  },
  lazy: {
    displayProgress: false,
    expireCache: false,
    maxConcurrent: 2
  }
};

const preloadPromises = new Map<SystemAssetPreloadGroup, Promise<void>>();

export function getSystemAssetSources(
  group: SystemAssetPreloadGroup
): string[] {
  return [
    ...new Set(
      SYSTEM_ASSET_SOURCE_PATHS[group].map((path) => `${SYSTEM_PATH}/${path}`)
    )
  ];
}

export function preloadSystemAssetGroup(
  group: SystemAssetPreloadGroup
): Promise<void> {
  const existingPromise = preloadPromises.get(group);

  if (existingPromise) {
    return existingPromise;
  }

  const sources = getSystemAssetSources(group);

  if (!sources.length) {
    return Promise.resolve();
  }

  const promise = loadSystemAssetGroup(group, sources);
  preloadPromises.set(group, promise);
  return promise;
}

export async function preloadSystemAssets(): Promise<void> {
  try {
    await preloadSystemAssetGroup("critical");
  } catch (error) {
    console.error(`${SYSTEM_ID} | Failed to preload critical assets.`, error);
  }

  void preloadSystemAssetGroup("warm").catch((error) => {
    console.error(`${SYSTEM_ID} | Failed to preload warm assets.`, error);
  });
}

export function resetSystemAssetPreloaderForTests(): void {
  preloadPromises.clear();
}

async function loadSystemAssetGroup(
  group: SystemAssetPreloadGroup,
  sources: string[]
): Promise<void> {
  await foundry.canvas.TextureLoader.loader.load(
    sources,
    ASSET_LOAD_OPTIONS[group]
  );

  if (group !== "critical") {
    return;
  }

  for (const source of sources) {
    foundry.canvas.TextureLoader.pinSource(source);
  }
}
