export const abilities = {
    agility: {
        id: 'agility',
        label: 'APP_EXAMPLE.CONFIG.Traits.agility.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.agility.verb.sprint',
            'APP_EXAMPLE.CONFIG.Traits.agility.verb.leap',
            'APP_EXAMPLE.CONFIG.Traits.agility.verb.maneuver'
        ]
    },
    strength: {
        id: 'strength',
        label: 'APP_EXAMPLE.CONFIG.Traits.strength.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.strength.verb.lift',
            'APP_EXAMPLE.CONFIG.Traits.strength.verb.smash',
            'APP_EXAMPLE.CONFIG.Traits.strength.verb.grapple'
        ]
    },
    finesse: {
        id: 'finesse',
        label: 'APP_EXAMPLE.CONFIG.Traits.finesse.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.finesse.verb.control',
            'APP_EXAMPLE.CONFIG.Traits.finesse.verb.hide',
            'APP_EXAMPLE.CONFIG.Traits.finesse.verb.tinker'
        ]
    },
    instinct: {
        id: 'instinct',
        label: 'APP_EXAMPLE.CONFIG.Traits.instinct.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.instinct.verb.perceive',
            'APP_EXAMPLE.CONFIG.Traits.instinct.verb.sense',
            'APP_EXAMPLE.CONFIG.Traits.instinct.verb.navigate'
        ]
    },
    presence: {
        id: 'presence',
        label: 'APP_EXAMPLE.CONFIG.Traits.presence.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.presence.verb.charm',
            'APP_EXAMPLE.CONFIG.Traits.presence.verb.perform',
            'APP_EXAMPLE.CONFIG.Traits.presence.verb.deceive'
        ]
    },
    knowledge: {
        id: 'knowledge',
        label: 'APP_EXAMPLE.CONFIG.Traits.knowledge.name',
        verbs: [
            'APP_EXAMPLE.CONFIG.Traits.knowledge.verb.recall',
            'APP_EXAMPLE.CONFIG.Traits.knowledge.verb.analyze',
            'APP_EXAMPLE.CONFIG.Traits.knowledge.verb.comprehend'
        ]
    }
};

export const featureProperties = {
    agility: {
        name: 'APP_EXAMPLE.CONFIG.Traits.agility.name',
        path: actor => actor.system.traits.agility.data.value
    },
    strength: {
        name: 'APP_EXAMPLE.CONFIG.Traits.strength.name',
        path: actor => actor.system.traits.strength.data.value
    },
    finesse: {
        name: 'APP_EXAMPLE.CONFIG.Traits.finesse.name',
        path: actor => actor.system.traits.finesse.data.value
    },
    instinct: {
        name: 'APP_EXAMPLE.CONFIG.Traits.instinct.name',
        path: actor => actor.system.traits.instinct.data.value
    },
    presence: {
        name: 'APP_EXAMPLE.CONFIG.Traits.presence.name',
        path: actor => actor.system.traits.presence.data.value
    },
    knowledge: {
        name: 'APP_EXAMPLE.CONFIG.Traits.knowledge.name',
        path: actor => actor.system.traits.knowledge.data.value
    },
    spellcastingTrait: {
        name: 'APP_EXAMPLE.FeatureProperty.SpellcastingTrait',
        path: actor => actor.system.traits[actor.system.class.subclass.system.spellcastingTrait].data.value
    }
};

export const adversaryTypes = {
    bruiser: {
        id: 'bruiser',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.bruiser.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.bruiser.description',
        bpCost: 4
    },
    horde: {
        id: 'horde',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.horde.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.horde.description',
        bpCost: 2
    },
    leader: {
        id: 'leader',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.leader.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.leader.description',
        bpCost: 3,
        bpDescription: 'APP_EXAMPLE.CONFIG.AdversaryType.leader.'
    },
    minion: {
        id: 'minion',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.minion.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.minion.description',
        bpCost: 1,
        partyAmountPerBP: true
    },
    ranged: {
        id: 'ranged',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.ranged.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.ranged.description',
        bpCost: 2
    },
    skulk: {
        id: 'skulk',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.skulk.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.skulk.description',
        bpCost: 2
    },
    social: {
        id: 'social',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.social.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.social.description',
        bpCost: 1
    },
    solo: {
        id: 'solo',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.solo.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.solo.description',
        bpCost: 5
    },
    standard: {
        id: 'standard',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.standard.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.standard.description',
        bpCost: 2
    },
    support: {
        id: 'support',
        label: 'APP_EXAMPLE.CONFIG.AdversaryType.support.label',
        description: 'APP_EXAMPLE.ACTORS.Adversary.support.description',
        bpCost: 1
    }
};

export const allAdversaryTypes = () => ({
    ...adversaryTypes,
    ...game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Homebrew).adversaryTypes
});

export const environmentTypes = {
    exploration: {
        label: 'APP_EXAMPLE.CONFIG.EnvironmentType.exploration.label',
        description: 'APP_EXAMPLE.CONFIG.EnvironmentType.exploration.description'
    },
    social: {
        label: 'APP_EXAMPLE.CONFIG.EnvironmentType.social.label',
        description: 'APP_EXAMPLE.CONFIG.EnvironmentType.social.description'
    },
    traversal: {
        label: 'APP_EXAMPLE.CONFIG.EnvironmentType.traversal.label',
        description: 'APP_EXAMPLE.CONFIG.EnvironmentType.traversal.description'
    },
    event: {
        label: 'APP_EXAMPLE.CONFIG.EnvironmentType.event.label',
        description: 'APP_EXAMPLE.CONFIG.EnvironmentType.event.description'
    }
};

export const adversaryTraits = {
    relentless: {
        name: 'APP_EXAMPLE.CONFIG.AdversaryTrait.relentless.name',
        description: 'APP_EXAMPLE.CONFIG.AdversaryTrait.relentless.description',
        tip: 'APP_EXAMPLE.CONFIG.AdversaryTrait.relentless.tip'
    },
    slow: {
        name: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.name',
        description: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.description',
        tip: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.tip'
    },
    minion: {
        name: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.name',
        description: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.description',
        tip: 'APP_EXAMPLE.CONFIG.AdversaryTrait.slow.tip'
    }
};

export const tokenSize = {
    custom: {
        id: 'custom',
        value: 0,
        label: 'APP_EXAMPLE.GENERAL.custom'
    },
    tiny: {
        id: 'tiny',
        value: 1,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.tiny'
    },
    small: {
        id: 'small',
        value: 2,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.small'
    },
    medium: {
        id: 'medium',
        value: 3,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.medium'
    },
    large: {
        id: 'large',
        value: 4,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.large'
    },
    huge: {
        id: 'huge',
        value: 5,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.huge'
    },
    gargantuan: {
        id: 'gargantuan',
        value: 6,
        label: 'APP_EXAMPLE.CONFIG.TokenSize.gargantuan'
    }
};

export const levelChoices = {
    attributes: {
        name: 'attributes',
        title: '',
        choices: []
    },
    hitPointSlots: {
        name: 'hitPointSlots',
        title: '',
        choices: []
    },
    stressSlots: {
        name: 'stressSlots',
        title: '',
        choices: []
    },
    experiences: {
        name: 'experiences',
        title: '',
        choices: 'system.experiences',
        nrChoices: 2
    },
    proficiency: {
        name: 'proficiency',
        title: '',
        choices: []
    },
    armorOrEvasionSlot: {
        name: 'armorOrEvasionSlot',
        title: 'Permanently add one Armor Slot or take +1 to your Evasion',
        choices: [
            { name: 'Armor Marks +1', path: 'armor' },
            { name: 'Evasion +1', path: 'evasion' }
        ],
        nrChoices: 1
    },
    majorDamageThreshold2: {
        name: 'majorDamageThreshold2',
        title: '',
        choices: []
    },
    severeDamageThreshold2: {
        name: 'severeDamageThreshold2',
        title: '',
        choices: []
    },
    // minorDamageThreshold2: {
    //     name: 'minorDamageThreshold2',
    //     title: '',
    //     choices: [],
    // },
    severeDamageThreshold3: {
        name: 'severeDamageThreshold3',
        title: '',
        choices: []
    },
    // major2OrSevere4DamageThreshold: {
    //     name: 'major2OrSevere4DamageThreshold',
    //     title: 'Increase your Major Damage Threshold by +2 or Severe Damage Threshold by +4',
    //     choices: [{ name: 'Major Damage Threshold +2', path: 'major' }, { name: 'Severe Damage Threshold +4', path: 'severe' }],
    //     nrChoices: 1,
    // },
    // minor1OrMajor1DamageThreshold: {
    //     name: 'minor1OrMajor1DamageThreshold',
    //     title: 'Increase your Minor or Major Damage Threshold by +1',
    //     choices: [{ name: 'Minor Damage Threshold +1', path: 'minor' }, { name: 'Major Damage Threshold +1', path: 'major' }],
    //     nrChoices: 1,
    // },
    severeDamageThreshold4: {
        name: 'severeDamageThreshold4',
        title: '',
        choices: []
    },
    // majorDamageThreshold1: {
    //     name: 'majorDamageThreshold2',
    //     title: '',
    //     choices: [],
    // },
    subclass: {
        name: 'subclass',
        title: 'Select subclass to upgrade',
        choices: []
    },
    multiclass: {
        name: 'multiclass',
        title: '',
        choices: [{}]
    }
};

export const levelupData = {
    tier1: {
        id: '2_4',
        tier: 1,
        levels: [2, 3, 4],
        label: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier1.Label',
        info: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier1.InfoLabel',
        pretext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier1.Pretext',
        posttext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier1.Posttext',
        choices: {
            [levelChoices.attributes.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.attributes',
                maxChoices: 3
            },
            [levelChoices.hitPointSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.hitPointSlots',
                maxChoices: 1
            },
            [levelChoices.stressSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.stressSlots',
                maxChoices: 1
            },
            [levelChoices.experiences.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.experiences',
                maxChoices: 1
            },
            [levelChoices.proficiency.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.proficiency',
                maxChoices: 1
            },
            [levelChoices.armorOrEvasionSlot.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.armorOrEvasionSlot',
                maxChoices: 1
            },
            [levelChoices.majorDamageThreshold2.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.majorDamageThreshold2',
                maxChoices: 1
            },
            [levelChoices.severeDamageThreshold2.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.severeDamageThreshold2',
                maxChoices: 1
            }
        }
    },
    tier2: {
        id: '5_7',
        tier: 2,
        levels: [5, 6, 7],
        label: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier2.Label',
        info: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier2.InfoLabel',
        pretext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier2.Pretext',
        posttext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier2.Posttext',
        choices: {
            [levelChoices.attributes.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.attributes',
                maxChoices: 3
            },
            [levelChoices.hitPointSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.hitPointSlots',
                maxChoices: 2
            },
            [levelChoices.stressSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.stressSlots',
                maxChoices: 2
            },
            [levelChoices.experiences.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.experiences',
                maxChoices: 1
            },
            [levelChoices.proficiency.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.proficiency',
                maxChoices: 2
            },
            [levelChoices.armorOrEvasionSlot.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.armorOrEvasionSlot',
                maxChoices: 2
            },
            [levelChoices.majorDamageThreshold2.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.majorDamageThreshold2',
                maxChoices: 1
            },
            [levelChoices.severeDamageThreshold3.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.severeDamageThreshold3',
                maxChoices: 1
            },
            [levelChoices.subclass.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.subclass',
                maxChoices: 1
            },
            [levelChoices.multiclass.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.multiclass',
                maxChoices: 1,
                cost: 2
            }
        }
    },
    tier3: {
        id: '8_10',
        tier: 3,
        levels: [8, 9, 10],
        label: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier3.Label',
        info: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier3.InfoLabel',
        pretext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier3.Pretext',
        posttext: 'APP_EXAMPLE.APPLICATIONS.Levelup.tier3.Posttext',
        choices: {
            [levelChoices.attributes.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.attributes',
                maxChoices: 3
            },
            [levelChoices.hitPointSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.hitPointSlots',
                maxChoices: 2
            },
            [levelChoices.stressSlots.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.stressSlots',
                maxChoices: 2
            },
            [levelChoices.experiences.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.experiences',
                maxChoices: 1
            },
            [levelChoices.proficiency.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.proficiency',
                maxChoices: 2
            },
            [levelChoices.armorOrEvasionSlot.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.armorOrEvasionSlot',
                maxChoices: 2
            },
            [levelChoices.majorDamageThreshold2.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.majorDamageThreshold2',
                maxChoices: 1
            },
            [levelChoices.severeDamageThreshold4.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.severeDamageThreshold4',
                maxChoices: 1
            },
            [levelChoices.subclass.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.subclass',
                maxChoices: 1
            },
            [levelChoices.multiclass.name]: {
                description: 'APP_EXAMPLE.APPLICATIONS.Levelup.choiceDescriptions.multiclass',
                maxChoices: 1,
                cost: 2
            }
        }
    }
};

export const subclassFeatureLabels = {
    1: 'APP_EXAMPLE.ITEMS.DomainCard.foundationTitle',
    2: 'APP_EXAMPLE.ITEMS.DomainCard.specializationTitle',
    3: 'APP_EXAMPLE.ITEMS.DomainCard.masteryTitle'
};

/**
 * @typedef {Object} TierData
 * @property {number} difficulty
 * @property {number} majorThreshold
 * @property {number} severeThreshold
 * @property {number} hp
 * @property {number} stress
 * @property {number} attack
 * @property {number[]} damage
 */

/**
 * @type {Record<string, Record<2 | 3 | 4, TierData>}
 * Scaling data used to change an adversary's tier. Each rank is applied incrementally.
 */
export const adversaryScalingData = {
    bruiser: {
        2: {
            difficulty: 2,
            majorThreshold: 5,
            severeThreshold: 10,
            hp: 1,
            stress: 2,
            attack: 2
        },
        3: {
            difficulty: 2,
            majorThreshold: 7,
            severeThreshold: 15,
            hp: 1,
            stress: 0,
            attack: 2
        },
        4: {
            difficulty: 2,
            majorThreshold: 12,
            severeThreshold: 25,
            hp: 1,
            stress: 0,
            attack: 2
        }
    },
    horde: {
        2: {
            difficulty: 2,
            majorThreshold: 5,
            severeThreshold: 8,
            hp: 2,
            stress: 0,
            attack: 0
        },
        3: {
            difficulty: 2,
            majorThreshold: 5,
            severeThreshold: 12,
            hp: 0,
            stress: 1,
            attack: 1
        },
        4: {
            difficulty: 2,
            majorThreshold: 10,
            severeThreshold: 15,
            hp: 2,
            stress: 0,
            attack: 0
        }
    },
    leader: {
        2: {
            difficulty: 2,
            majorThreshold: 6,
            severeThreshold: 10,
            hp: 0,
            stress: 0,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 6,
            severeThreshold: 15,
            hp: 1,
            stress: 0,
            attack: 2
        },
        4: {
            difficulty: 2,
            majorThreshold: 12,
            severeThreshold: 25,
            hp: 1,
            stress: 1,
            attack: 3
        }
    },
    minion: {
        2: {
            difficulty: 2,
            majorThreshold: 0,
            severeThreshold: 0,
            hp: 0,
            stress: 0,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 0,
            severeThreshold: 0,
            hp: 0,
            stress: 1,
            attack: 1
        },
        4: {
            difficulty: 2,
            majorThreshold: 0,
            severeThreshold: 0,
            hp: 0,
            stress: 0,
            attack: 1
        }
    },
    ranged: {
        2: {
            difficulty: 2,
            majorThreshold: 3,
            severeThreshold: 6,
            hp: 1,
            stress: 0,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 7,
            severeThreshold: 14,
            hp: 1,
            stress: 1,
            attack: 2
        },
        4: {
            difficulty: 2,
            majorThreshold: 5,
            severeThreshold: 10,
            hp: 1,
            stress: 1,
            attack: 1
        }
    },
    skulk: {
        2: {
            difficulty: 2,
            majorThreshold: 3,
            severeThreshold: 8,
            hp: 1,
            stress: 1,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 8,
            severeThreshold: 12,
            hp: 1,
            stress: 1,
            attack: 1
        },
        4: {
            difficulty: 2,
            majorThreshold: 8,
            severeThreshold: 10,
            hp: 1,
            stress: 1,
            attack: 1
        }
    },
    solo: {
        2: {
            difficulty: 2,
            majorThreshold: 5,
            severeThreshold: 10,
            hp: 0,
            stress: 1,
            attack: 2
        },
        3: {
            difficulty: 2,
            majorThreshold: 7,
            severeThreshold: 15,
            hp: 2,
            stress: 1,
            attack: 2
        },
        4: {
            difficulty: 2,
            majorThreshold: 12,
            severeThreshold: 25,
            hp: 0,
            stress: 1,
            attack: 3
        }
    },
    standard: {
        2: {
            difficulty: 2,
            majorThreshold: 3,
            severeThreshold: 8,
            hp: 0,
            stress: 0,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 7,
            severeThreshold: 15,
            hp: 1,
            stress: 1,
            attack: 1
        },
        4: {
            difficulty: 2,
            majorThreshold: 10,
            severeThreshold: 15,
            hp: 0,
            stress: 1,
            attack: 1
        }
    },
    support: {
        2: {
            difficulty: 2,
            majorThreshold: 3,
            severeThreshold: 8,
            hp: 1,
            stress: 1,
            attack: 1
        },
        3: {
            difficulty: 2,
            majorThreshold: 7,
            severeThreshold: 12,
            hp: 0,
            stress: 0,
            attack: 1
        },
        4: {
            difficulty: 2,
            majorThreshold: 8,
            severeThreshold: 10,
            hp: 1,
            stress: 1,
            attack: 1
        }
    }
};

/**
 * Scaling data used for an adversary's damage.
 * Tier 4 is missing certain adversary types and therefore skews upwards.
 * We manually set tier 4 data to hopefully lead to better results
 */
export const adversaryExpectedDamage = {
    basic: {
        1: { mean: 7.321428571428571, deviation: 1.962519002770912 },
        2: { mean: 12.444444444444445, deviation: 2.0631069425529676 },
        3: { mean: 15.722222222222221, deviation: 2.486565208464823 },
        4: { mean: 26, deviation: 5.2 }
    },
    minion: {
        1: { mean: 2.142857142857143, deviation: 1.0690449676496976 },
        2: { mean: 5, deviation: 0.816496580927726 },
        3: { mean: 6.5, deviation: 2.1213203435596424 },
        4: { mean: 11, deviation: 1 }
    }
};
