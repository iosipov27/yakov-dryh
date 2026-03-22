export function getFailureConsequence(rollResult) {
    if (rollResult.outcome !== "failure") {
        return null;
    }
    switch (rollResult.dominant) {
        case "exhaustion":
            return "mark-response";
        case "madness":
            return "gain-exhaustion";
        default:
            return "gm-choice";
    }
}
//# sourceMappingURL=failure-consequence.js.map