import { TEMPLATE_PARTIAL_PATHS } from "../constants.js";
export async function preloadHandlebarsTemplates() {
    await loadTemplates(Object.values(TEMPLATE_PARTIAL_PATHS));
}
//# sourceMappingURL=templates.js.map