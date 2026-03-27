import { getUncheckedResponseTypes } from "../data/index.js";
export function getFailureResolutionActions(consequence, responses) {
    const responseActions = getUncheckedResponseTypes(responses).map((responseType) => ({
        responseType,
        type: "check-response"
    }));
    const snapAction = {
        responseType: null,
        type: "snap"
    };
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
                ...(responseActions.length > 0 ? responseActions : [snapAction])
            ];
        case "mark-response":
            return responseActions.length > 0 ? responseActions : [snapAction];
        default:
            return [];
    }
}
//# sourceMappingURL=failure-resolution.js.map