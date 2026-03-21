import { range } from '../config/generalConfig.mjs';

export const valueTypes = {
    numberString: {
        id: 'numberString'
    },
    select: {
        id: 'select'
    }
};

export const parseTypes = {
    string: {
        id: 'string'
    },
    number: {
        id: 'number'
    }
};

export const applyLocations = {
    attackRoll: {
        id: 'attackRoll',
        name: 'APP_EXAMPLE.EFFECTS.ApplyLocations.attackRoll.name'
    },
    damageRoll: {
        id: 'damageRoll',
        name: 'APP_EXAMPLE.EFFECTS.ApplyLocations.damageRoll.name'
    }
};

export const effectTypes = {
    health: {
        id: 'health',
        name: 'APP_EXAMPLE.EFFECTS.Types.HitPoints.name',
        values: [],
        valueType: valueTypes.numberString.id,
        parseType: parseTypes.number.id
    },
    stress: {
        id: 'stress',
        name: 'APP_EXAMPLE.EFFECTS.Types.Stress.name',
        valueType: valueTypes.numberString.id,
        parseType: parseTypes.number.id
    },
    reach: {
        id: 'reach',
        name: 'APP_EXAMPLE.EFFECTS.Types.Reach.name',
        valueType: valueTypes.select.id,
        parseType: parseTypes.string.id,
        options: Object.keys(range).map(x => ({ name: range[x].name, value: x }))
    },
    damage: {
        id: 'damage',
        name: 'APP_EXAMPLE.EFFECTS.Types.Damage.name',
        valueType: valueTypes.numberString.id,
        parseType: parseTypes.string.id,
        appliesOn: applyLocations.damageRoll.id,
        applyLocationChoices: {
            [applyLocations.damageRoll.id]: applyLocations.damageRoll.name,
            [applyLocations.attackRoll.id]: applyLocations.attackRoll.name
        }
    }
};
