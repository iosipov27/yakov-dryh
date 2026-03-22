import { getUncheckedResponseTypes } from "../data/index.js";
export function getFailureResolutionActions(consequence, responses) {
    const responseActions = getUncheckedResponseTypes(responses).map((responseType) => ({
        responseType,
        type: "check-response"
    }));
    switch (consequence) {
        case "gain-exhaustion":
            return [
                {
                    responseType: null,
                    type: "gain-exhaustion"
                }
            ];
        case "gm-choice":
            return [
                {
                    responseType: null,
                    type: "gain-exhaustion"
                },
                ...responseActions
            ];
        case "mark-response":
            return responseActions;
        default:
            return [];
    }
}
//# sourceMappingURL=failure-resolution.js.map