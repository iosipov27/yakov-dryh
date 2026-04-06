import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSystemAssetSources,
  preloadSystemAssetGroup,
  preloadSystemAssets,
  resetSystemAssetPreloaderForTests,
  SYSTEM_ASSET_SOURCE_PATHS
} from "../src/module/system-registration/asset-preloader.ts";

describe("asset preloader", () => {
  beforeEach(() => {
    resetSystemAssetPreloaderForTests();
  });

  it("creates system-scoped asset URLs for each preload group", () => {
    expect(getSystemAssetSources("critical")).toEqual([
      "systems/yakov-dryh/assets/bg.jpg",
      "systems/yakov-dryh/assets/paper.jpg",
      "systems/yakov-dryh/assets/coin_hope.png",
      "systems/yakov-dryh/assets/coin_despair.png",
      "systems/yakov-dryh/assets/button_red.png",
      "systems/yakov-dryh/assets/six-sided-dice3.svg"
    ]);
    expect(getSystemAssetSources("warm")).toHaveLength(SYSTEM_ASSET_SOURCE_PATHS.warm.length);
    expect(getSystemAssetSources("lazy")).toEqual([]);
  });

  it("memoizes critical asset loads and pins them after preloading", async () => {
    const load = vi.fn().mockResolvedValue(undefined);
    const pinSource = vi.fn();

    globalThis.foundry = {
      canvas: {
        TextureLoader: {
          loader: { load },
          pinSource
        }
      }
    } as typeof foundry;

    await Promise.all([
      preloadSystemAssetGroup("critical"),
      preloadSystemAssetGroup("critical")
    ]);

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(getSystemAssetSources("critical"), {
      displayProgress: false,
      expireCache: false,
      maxConcurrent: 4
    });
    expect(pinSource).toHaveBeenCalledTimes(getSystemAssetSources("critical").length);
  });

  it("warms the secondary asset group after critical assets", async () => {
    const load = vi.fn().mockResolvedValue(undefined);
    const pinSource = vi.fn();

    globalThis.foundry = {
      canvas: {
        TextureLoader: {
          loader: { load },
          pinSource
        }
      }
    } as typeof foundry;

    await preloadSystemAssets();

    expect(load).toHaveBeenNthCalledWith(1, getSystemAssetSources("critical"), {
      displayProgress: false,
      expireCache: false,
      maxConcurrent: 4
    });
    expect(load).toHaveBeenNthCalledWith(2, getSystemAssetSources("warm"), {
      displayProgress: false,
      expireCache: false,
      maxConcurrent: 2
    });
  });
});
