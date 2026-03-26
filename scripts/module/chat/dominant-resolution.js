import { getCheckedResponseTypes, getUncheckedResponseTypes } from "../data/index.js";
export function getDominantResolutionActions(dominant, responses, exhaustion) {
    switch (dominant) {
        case "discipline":
            return [
                ...(exhaustion > 0
                    ? [
                        {
                            responseType: null,
                            type: "remove-exhaustion"
                        }
                    ]
                    : []),
                ...getCheckedResponseTypes(responses).map((responseType) => ({
                    responseType,
                    type: "uncheck-response"
                }))
            ];
        case "madness":
            return getUncheckedResponseTypes(responses).map((responseType) => ({
                responseType,
                type: "check-response"
            }));
        default:
            return [];
    }
}
//# sourceMappingURL=dominant-resolution.js.map