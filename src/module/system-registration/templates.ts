import { TEMPLATE_PARTIAL_PATHS } from "../constants.js";

export async function preloadHandlebarsTemplates(): Promise<void> {
  await loadTemplates(Object.values(TEMPLATE_PARTIAL_PATHS));
}
