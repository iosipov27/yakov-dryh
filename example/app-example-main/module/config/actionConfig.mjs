export const actionTypes = {
    attack: {
        id: 'attack',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.attack.name',
        icon: 'fa-hand-fist',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.attack.tooltip'
    },
    countdown: {
        id: 'countdown',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.countdown.name',
        icon: 'fa-hourglass-half',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.countdown.tooltip'
    },
    healing: {
        id: 'healing',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.healing.name',
        icon: 'fa-kit-medical',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.healing.tooltip'
    },
    damage: {
        id: 'damage',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.damage.name',
        icon: 'fa-heart-crack',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.damage.tooltip'
    },
    beastform: {
        id: 'beastform',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.beastform.name',
        icon: 'fa-paw',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.beastform.tooltip'
    },
    summon: {
        id: 'summon',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.summon.name',
        icon: 'fa-ghost',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.summon.tooltip'
    },
    transform: {
        id: 'transform',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.transform.name',
        icon: 'fa-dragon',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.transform.tooltip'
    },
    effect: {
        id: 'effect',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.effect.name',
        icon: 'fa-person-rays',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.effect.tooltip'
    },
    macro: {
        id: 'macro',
        name: 'APP_EXAMPLE.ACTIONS.TYPES.macro.name',
        icon: 'fa-scroll',
        tooltip: 'APP_EXAMPLE.ACTIONS.TYPES.macro.tooltip'
    }
};

export const damageOnSave = {
    none: {
        id: 'none',
        label: 'None',
        mod: 0
    },
    half: {
        id: 'half',
        label: 'Half Damage',
        mod: 0.5
    },
    full: {
        id: 'full',
        label: 'Full damage',
        mod: 1
    }
};

export const diceCompare = {
    below: {
        id: 'below',
        label: 'Below',
        operator: '<'
    },
    belowEqual: {
        id: 'belowEqual',
        label: 'Below or Equal',
        operator: '<='
    },
    equal: {
        id: 'equal',
        label: 'Equal',
        operator: '='
    },
    aboveEqual: {
        id: 'aboveEqual',
        label: 'Above or Equal',
        operator: '>='
    },
    above: {
        id: 'above',
        label: 'Above',
        operator: '>'
    }
};

export const advantageState = {
    disadvantage: {
        label: 'APP_EXAMPLE.GENERAL.Disadvantage.full',
        value: -1
    },
    neutral: {
        label: 'APP_EXAMPLE.GENERAL.Neutral.full',
        value: 0
    },
    advantage: {
        label: 'APP_EXAMPLE.GENERAL.Advantage.full',
        value: 1
    }
};
