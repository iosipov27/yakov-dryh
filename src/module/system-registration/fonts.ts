import { SYSTEM_PATH } from "../constants.js";

export const SYSTEM_FONT_FAMILY = "EB Garamond";

export const SYSTEM_FONT_DEFINITION: CONFIG.Font.FamilyDefinition = {
  editor: true,
  fonts: [
    {
      urls: [`${SYSTEM_PATH}/assets/fonts/eb-garamond/EBGaramond-wght.ttf`],
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
};

export function registerFonts(): void {
  CONFIG.fontDefinitions[SYSTEM_FONT_FAMILY] = SYSTEM_FONT_DEFINITION;
}
