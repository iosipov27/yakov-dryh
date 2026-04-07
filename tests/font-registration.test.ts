import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SYSTEM_PATH } from "../src/module/constants.ts";
import {
  registerFonts,
  SYSTEM_FONT_DEFINITION,
  SYSTEM_FONT_FAMILY
} from "../src/module/system-registration/fonts.ts";

const testGlobal = globalThis as typeof globalThis & {
  CONFIG?: typeof CONFIG;
};
const originalConfig = testGlobal.CONFIG;

describe("font registration", () => {
  beforeEach(() => {
    testGlobal.CONFIG = { fontDefinitions: {} } as typeof CONFIG;
  });

  afterEach(() => {
    testGlobal.CONFIG = originalConfig;
  });

  it("registers EB Garamond as a local system font", () => {
    registerFonts();

    expect(CONFIG.fontDefinitions[SYSTEM_FONT_FAMILY]).toEqual(
      SYSTEM_FONT_DEFINITION
    );
    expect(CONFIG.fontDefinitions[SYSTEM_FONT_FAMILY]).toEqual({
      editor: true,
      fonts: [
        {
          urls: [
            `${SYSTEM_PATH}/assets/fonts/eb-garamond/EBGaramond-wght.ttf`
          ],
          weight: "400 800"
        },
        {
          urls: [
            `${SYSTEM_PATH}/assets/fonts/eb-garamond/EBGaramond-Italic-wght.ttf`
          ],
          style: "italic",
          weight: "400 800"
        }
      ]
    });
  });
});
