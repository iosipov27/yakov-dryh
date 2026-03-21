export const compendiumJournals = {
    welcome: 'Compendium.app-example.journals.JournalEntry.g7NhKvwltwafmMyR'
};

export const ruleChoice = {
    on: {
        id: 'on',
        label: 'APP_EXAMPLE.CONFIG.RuleChoice.on'
    },
    of: {
        id: 'off',
        label: 'APP_EXAMPLE.CONFIG.RuleChoice.off'
    },
    onWithToggle: {
        id: 'onWithToggle',
        label: 'APP_EXAMPLE.CONFIG.RuleChoice.onWithToggle'
    },
    offWithToggle: {
        id: 'offWithToggle',
        label: 'APP_EXAMPLE.CONFIG.RuleChoice.offWithToggle'
    }
};

export const templateRanges = {
    self: {
        id: 'self',
        short: 's',
        label: 'APP_EXAMPLE.CONFIG.Range.self.name',
        description: 'APP_EXAMPLE.CONFIG.Range.self.description',
        distance: 0
    },
    melee: {
        id: 'melee',
        short: 'm',
        label: 'APP_EXAMPLE.CONFIG.Range.melee.name',
        description: 'APP_EXAMPLE.CONFIG.Range.melee.description',
        distance: 1
    },
    veryClose: {
        id: 'veryClose',
        short: 'vc',
        label: 'APP_EXAMPLE.CONFIG.Range.veryClose.name',
        description: 'APP_EXAMPLE.CONFIG.Range.veryClose.description',
        distance: 3
    },
    close: {
        id: 'close',
        short: 'c',
        label: 'APP_EXAMPLE.CONFIG.Range.close.name',
        description: 'APP_EXAMPLE.CONFIG.Range.close.description',
        distance: 10
    },
    far: {
        id: 'far',
        short: 'f',
        label: 'APP_EXAMPLE.CONFIG.Range.far.name',
        description: 'APP_EXAMPLE.CONFIG.Range.far.description',
        distance: 20
    }
};

export const range = {
    ...templateRanges,
    veryFar: {
        id: 'veryFar',
        short: 'vf',
        label: 'APP_EXAMPLE.CONFIG.Range.veryFar.name',
        description: 'APP_EXAMPLE.CONFIG.Range.veryFar.description',
        distance: 30
    }
};

export const templateTypes = {
    ...CONST.MEASURED_TEMPLATE_TYPES,
    EMANATION: 'emanation',
    INFRONT: 'inFront'
};

export const rangeInclusion = {
    withinRange: {
        id: 'withinRange',
        label: 'APP_EXAMPLE.CONFIG.RangeInclusion.withinRange'
    },
    outsideRange: {
        id: 'outsideRange',
        label: 'APP_EXAMPLE.CONFIG.RangeInclusion.outsideRange'
    }
};

export const otherTargetTypes = {
    friendly: {
        id: 'friendly',
        label: 'APP_EXAMPLE.CONFIG.TargetTypes.friendly'
    },
    hostile: {
        id: 'hostile',
        label: 'APP_EXAMPLE.CONFIG.TargetTypes.hostile'
    },
    any: {
        id: 'any',
        label: 'APP_EXAMPLE.CONFIG.TargetTypes.any'
    }
};

export const targetTypes = {
    self: {
        id: 'self',
        label: 'APP_EXAMPLE.CONFIG.TargetTypes.self'
    },
    ...otherTargetTypes
};

export const burden = {
    oneHanded: {
        value: 'oneHanded',
        label: 'APP_EXAMPLE.CONFIG.Burden.oneHanded'
    },
    twoHanded: {
        value: 'twoHanded',
        label: 'APP_EXAMPLE.CONFIG.Burden.twoHanded'
    }
};

export const damageTypes = {
    physical: {
        id: 'physical',
        label: 'APP_EXAMPLE.CONFIG.DamageType.physical.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.DamageType.physical.abbreviation',
        icon: 'fa-hand-fist'
    },
    magical: {
        id: 'magical',
        label: 'APP_EXAMPLE.CONFIG.DamageType.magical.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.DamageType.magical.abbreviation',
        icon: 'fa-wand-sparkles'
    }
};

export const healingTypes = {
    hitPoints: {
        id: 'hitPoints',
        label: 'APP_EXAMPLE.CONFIG.HealingType.hitPoints.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.HealingType.hitPoints.abbreviation'
    },
    stress: {
        id: 'stress',
        label: 'APP_EXAMPLE.CONFIG.HealingType.stress.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.HealingType.stress.abbreviation'
    },
    hope: {
        id: 'hope',
        label: 'APP_EXAMPLE.CONFIG.HealingType.hope.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.HealingType.hope.abbreviation'
    },
    armor: {
        id: 'armor',
        label: 'APP_EXAMPLE.CONFIG.HealingType.armor.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.HealingType.armor.abbreviation'
    },
    fear: {
        id: 'fear',
        label: 'APP_EXAMPLE.CONFIG.HealingType.fear.name',
        abbreviation: 'APP_EXAMPLE.CONFIG.HealingType.fear.abbreviation'
    }
};

export const defeatedConditions = () => {
    const defeated = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Automation).defeated;
    return Object.keys(defeatedConditionChoices).reduce((acc, key) => {
        const choice = defeatedConditionChoices[key];
        acc[key] = {
            ...choice,
            img: defeated[`${choice.id}Icon`],
            description: game.i18n.localize(`APP_EXAMPLE.CONFIG.Condition.${choice.id}.description`)
        };

        return acc;
    }, {});
};

export const defeatedConditionChoices = {
    deathMove: {
        id: 'deathMove',
        name: 'APP_EXAMPLE.CONFIG.Condition.deathMove.name'
    },
    defeated: {
        id: 'defeated',
        name: 'APP_EXAMPLE.CONFIG.Condition.defeated.name'
    },
    unconscious: {
        id: 'unconscious',
        name: 'APP_EXAMPLE.CONFIG.Condition.unconscious.name'
    },
    dead: {
        id: 'dead',
        name: 'APP_EXAMPLE.CONFIG.Condition.dead.name'
    }
};

export const conditions = () => ({
    vulnerable: {
        id: 'vulnerable',
        name: 'APP_EXAMPLE.CONFIG.Condition.vulnerable.name',
        img: 'icons/magic/control/silhouette-fall-slip-prone.webp',
        description: 'APP_EXAMPLE.CONFIG.Condition.vulnerable.description',
        autoApplyFlagId: 'auto-vulnerable'
    },
    hidden: {
        id: 'hidden',
        name: 'APP_EXAMPLE.CONFIG.Condition.hidden.name',
        img: 'icons/magic/perception/silhouette-stealth-shadow.webp',
        description: 'APP_EXAMPLE.CONFIG.Condition.hidden.description'
    },
    restrained: {
        id: 'restrained',
        name: 'APP_EXAMPLE.CONFIG.Condition.restrained.name',
        img: 'icons/magic/control/debuff-chains-shackle-movement-red.webp',
        description: 'APP_EXAMPLE.CONFIG.Condition.restrained.description'
    },
    ...defeatedConditions()
});

export const defaultRestOptions = {
    shortRest: () => ({
        tendToWounds: {
            id: 'tendToWounds',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.tendToWounds.name'),
            icon: 'fa-solid fa-bandage',
            img: 'icons/magic/life/cross-worn-green.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.tendToWounds.description'),
            actions: {
                tendToWounds: {
                    type: 'healing',
                    systemPath: 'restMoves.shortRest.moves.tendToWounds.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.tendToWounds.name'),
                    img: 'icons/magic/life/cross-worn-green.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        amount: 1,
                        type: 'friendly'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hitPoints.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '1d4 + @tier'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        clearStress: {
            id: 'clearStress',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.clearStress.name'),
            icon: 'fa-regular fa-face-surprise',
            img: 'icons/magic/perception/eye-ringed-green.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.clearStress.description'),
            actions: {
                clearStress: {
                    type: 'healing',
                    systemPath: 'restMoves.shortRest.moves.clearStress.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.clearStress.name'),
                    img: 'icons/magic/perception/eye-ringed-green.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.stress.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '1d4 + @tier'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        repairArmor: {
            id: 'repairArmor',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.repairArmor.name'),
            icon: 'fa-solid fa-hammer',
            img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.repairArmor.description'),
            actions: {
                repairArmor: {
                    type: 'healing',
                    systemPath: 'restMoves.shortRest.moves.repairArmor.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.repairArmor.name'),
                    img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        amount: 1,
                        type: 'friendly'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.armor.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '1d4 + @tier'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        prepare: {
            id: 'prepare',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.prepare.name'),
            icon: 'fa-solid fa-dumbbell',
            img: 'icons/skills/trades/academics-merchant-scribe.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.prepare.description'),
            actions: {
                prepare: {
                    type: 'healing',
                    systemPath: 'restMoves.shortRest.moves.prepare.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.prepare.name'),
                    img: 'icons/skills/trades/academics-merchant-scribe.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hope.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '1'
                                    }
                                }
                            }
                        ]
                    }
                },
                prepareWithFriends: {
                    type: 'healing',
                    systemPath: 'restMoves.shortRest.moves.prepare.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.shortRest.prepareWithFriends.name'),
                    img: 'icons/skills/trades/academics-merchant-scribe.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hope.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '2'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        }
    }),
    longRest: () => ({
        tendToWounds: {
            id: 'tendToWounds',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.tendToWounds.name'),
            icon: 'fa-solid fa-bandage',
            img: 'icons/magic/life/cross-worn-green.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.tendToWounds.description'),
            actions: {
                tendToWounds: {
                    type: 'healing',
                    systemPath: 'restMoves.longRest.moves.tendToWounds.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.tendToWounds.name'),
                    img: 'icons/magic/life/cross-worn-green.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        amount: 1,
                        type: 'friendly'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hitPoints.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '@system.resources.hitPoints.max'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        clearStress: {
            id: 'clearStress',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.clearStress.name'),
            icon: 'fa-regular fa-face-surprise',
            img: 'icons/magic/perception/eye-ringed-green.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.clearStress.description'),
            actions: {
                clearStress: {
                    type: 'healing',
                    systemPath: 'restMoves.longRest.moves.clearStress.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.clearStress.name'),
                    img: 'icons/magic/perception/eye-ringed-green.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.stress.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '@system.resources.stress.max'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        repairArmor: {
            id: 'repairArmor',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.repairArmor.name'),
            icon: 'fa-solid fa-hammer',
            img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.repairArmor.description'),
            actions: {
                repairArmor: {
                    type: 'healing',
                    systemPath: 'restMoves.longRest.moves.repairArmor.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.repairArmor.name'),
                    img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        amount: 1,
                        type: 'friendly'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.armor.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '@system.armorScore'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        prepare: {
            id: 'prepare',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.prepare.name'),
            icon: 'fa-solid fa-dumbbell',
            img: 'icons/skills/trades/academics-merchant-scribe.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.prepare.description'),
            actions: {
                prepare: {
                    type: 'healing',
                    systemPath: 'restMoves.longRest.moves.prepare.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.prepare.name'),
                    img: 'icons/skills/trades/academics-merchant-scribe.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hope.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '1'
                                    }
                                }
                            }
                        ]
                    }
                },
                prepareWithFriends: {
                    type: 'healing',
                    systemPath: 'restMoves.longRest.moves.prepare.actions',
                    name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.prepareWithFriends.name'),
                    img: 'icons/skills/trades/academics-merchant-scribe.webp',
                    actionType: 'action',
                    chatDisplay: false,
                    target: {
                        type: 'self'
                    },
                    damage: {
                        parts: [
                            {
                                applyTo: healingTypes.hope.id,
                                value: {
                                    custom: {
                                        enabled: true,
                                        formula: '2'
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            effects: []
        },
        workOnAProject: {
            id: 'workOnAProject',
            name: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.workOnAProject.name'),
            icon: 'fa-solid fa-diagram-project',
            img: 'icons/skills/social/thumbsup-approval-like.webp',
            description: game.i18n.localize('APP_EXAMPLE.APPLICATIONS.Downtime.longRest.workOnAProject.description'),
            actions: {},
            effects: []
        }
    })
};

export const deathMoves = {
    avoidDeath: {
        id: 'avoidDeath',
        name: 'APP_EXAMPLE.CONFIG.DeathMoves.avoidDeath.name',
        img: 'icons/magic/time/hourglass-yellow-green.webp',
        icon: 'fa-person-running',
        description: 'APP_EXAMPLE.CONFIG.DeathMoves.avoidDeath.description'
    },
    riskItAll: {
        id: 'riskItAll',
        name: 'APP_EXAMPLE.CONFIG.DeathMoves.riskItAll.name',
        img: 'icons/sundries/gaming/dice-pair-white-green.webp',
        icon: 'fa-dice',
        description: 'APP_EXAMPLE.CONFIG.DeathMoves.riskItAll.description'
    },
    blazeOfGlory: {
        id: 'blazeOfGlory',
        name: 'APP_EXAMPLE.CONFIG.DeathMoves.blazeOfGlory.name',
        img: 'icons/magic/life/heart-cross-strong-flame-purple-orange.webp',
        icon: 'fa-burst',
        description: 'APP_EXAMPLE.CONFIG.DeathMoves.blazeOfGlory.description'
    }
};

export const tiers = {
    1: {
        id: 1,
        label: 'APP_EXAMPLE.GENERAL.Tiers.1'
    },
    2: {
        id: 2,
        label: 'APP_EXAMPLE.GENERAL.Tiers.2'
    },
    3: {
        id: 3,
        label: 'APP_EXAMPLE.GENERAL.Tiers.3'
    },
    4: {
        id: 4,
        label: 'APP_EXAMPLE.GENERAL.Tiers.4'
    }
};

export const diceTypes = {
    d4: 'd4',
    d6: 'd6',
    d8: 'd8',
    d10: 'd10',
    d12: 'd12',
    d20: 'd20'
};

export const dieFaces = [4, 6, 8, 10, 12, 20];

export const multiplierTypes = {
    prof: 'Proficiency',
    cast: 'Spellcast',
    scale: 'Cost Scaling',
    result: 'Roll Result',
    flat: 'Flat',
    tier: 'Tier'
};

export const diceSetNumbers = {
    prof: 'Proficiency',
    cast: 'Spellcast',
    scale: 'Cost Scaling',
    flat: 'Flat'
};

export const diceSoNiceSFXClasses = {
    PlayAnimationBright: {
        id: 'PlayAnimationBright',
        label: 'DICESONICE.PlayAnimationBright'
    },
    PlayAnimationDark: {
        id: 'PlayAnimationDark',
        label: 'DICESONICE.PlayAnimationDark'
    },
    PlayAnimationOutline: {
        id: 'PlayAnimationOutline',
        label: 'DICESONICE.PlayAnimationOutline'
    },
    PlayAnimationImpact: {
        id: 'PlayAnimationImpact',
        label: 'DICESONICE.PlayAnimationImpact'
    },
    // PlayConfettiStrength1: {
    //     id: 'PlayConfettiStrength1',
    //     label: 'DICESONICE.PlayConfettiStrength1'
    // },
    // PlayConfettiStrength2: {
    //     id: 'PlayConfettiStrength2',
    //     label: 'DICESONICE.PlayConfettiStrength2'
    // },
    // PlayConfettiStrength3: {
    //     id: 'PlayConfettiStrength3',
    //     label: 'DICESONICE.PlayConfettiStrength3'
    // },
    PlayAnimationThormund: {
        id: 'PlayAnimationThormund',
        label: 'DICESONICE.PlayAnimationThormund'
    },
    PlayAnimationParticleSpiral: {
        id: 'PlayAnimationParticleSpiral',
        label: 'DICESONICE.PlayAnimationParticleSpiral'
    },
    PlayAnimationParticleSparkles: {
        id: 'PlayAnimationParticleSparkles',
        label: 'DICESONICE.PlayAnimationParticleSparkles'
    },
    PlayAnimationParticleVortex: {
        id: 'PlayAnimationParticleVortex',
        label: 'DICESONICE.PlayAnimationParticleVortex'
    },
    PlaySoundEpicWin: {
        id: 'PlaySoundEpicWin',
        label: 'DICESONICE.PlaySoundEpicWin'
    },
    PlaySoundEpicFail: {
        id: 'PlaySoundEpicFail',
        label: 'DICESONICE.PlaySoundEpicFail'
    }
    // "PlaySoundCustom",
    // "PlayMacro"
};

export const appExampleDiceAnimationEvents = {
    critical: {
        id: 'critical',
        label: 'APP_EXAMPLE.CONFIG.AppExampleDiceAnimationEvents.critical.name'
    },
    higher: {
        id: 'higher',
        label: 'APP_EXAMPLE.CONFIG.AppExampleDiceAnimationEvents.higher.name'
    }
};

const getDiceSoNiceSFX = sfxOptions => {
    const diceSoNice = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.appearance).diceSoNiceData;
    const criticalAnimationData = diceSoNice.sfx.critical;
    if (sfxOptions.critical && criticalAnimationData.class) {
        return {
            specialEffect: criticalAnimationData.class,
            options: {}
        };
    }

    if (sfxOptions.higher && sfxOptions.data.higher) {
        return {
            specialEffect: sfxOptions.data.higher.class,
            options: {}
        };
    }

    return {};
};

export const getDiceSoNicePreset = async (type, faces, sfxOptions = {}) => {
    const system = game.dice3d.DiceFactory.systems.get(type.system).dice.get(faces);
    if (!system) {
        ui.notifications.error(
            game.i18n.format('APP_EXAMPLE.UI.Notifications.noDiceSystem', {
                system: game.dice3d.DiceFactory.systems.get(type.system).name,
                faces: faces
            })
        );
        return;
    }

    if (system.modelFile && !system.modelLoaded) {
        await system.loadModel(game.dice3d.DiceFactory.loaderGLTF);
    } else {
        await system.loadTextures();
    }

    return {
        modelFile: system.modelFile,
        appearance: {
            ...system.appearance,
            ...type
        },
        sfx: getDiceSoNiceSFX(sfxOptions)
    };
};

export const getDiceSoNicePresets = async (
    result,
    hopeFaces,
    fearFaces,
    advantageFaces = 'd6',
    disadvantageFaces = 'd6'
) => {
    const diceSoNice = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.appearance).diceSoNiceData;

    const { isCritical, withHope, withFear } = result;

    return {
        hope: await getDiceSoNicePreset(diceSoNice.hope, hopeFaces, {
            critical: isCritical,
            higher: withHope,
            data: diceSoNice.hope.sfx
        }),
        fear: await getDiceSoNicePreset(diceSoNice.fear, fearFaces, {
            critical: isCritical,
            higher: withFear,
            data: diceSoNice.fear.sfx
        }),
        advantage: await getDiceSoNicePreset(diceSoNice.advantage, advantageFaces),
        disadvantage: await getDiceSoNicePreset(diceSoNice.disadvantage, disadvantageFaces)
    };
};

export const refreshTypes = {
    scene: {
        id: 'session',
        label: 'APP_EXAMPLE.GENERAL.RefreshType.scene'
    },
    session: {
        id: 'session',
        label: 'APP_EXAMPLE.GENERAL.RefreshType.session'
    },
    shortRest: {
        id: 'shortRest',
        label: 'APP_EXAMPLE.GENERAL.RefreshType.shortrest'
    },
    longRest: {
        id: 'longRest',
        label: 'APP_EXAMPLE.GENERAL.RefreshType.longrest'
    }
};

export const itemAbilityCosts = {
    resource: {
        id: 'resource',
        label: 'APP_EXAMPLE.GENERAL.resource',
        group: 'Global'
    },
    quantity: {
        id: 'quantity',
        label: 'APP_EXAMPLE.GENERAL.quantity',
        group: 'Global'
    }
};

export const abilityCosts = {
    hitPoints: {
        id: 'hitPoints',
        label: 'APP_EXAMPLE.CONFIG.HealingType.hitPoints.name',
        group: 'Global'
    },
    stress: {
        id: 'stress',
        label: 'APP_EXAMPLE.CONFIG.HealingType.stress.name',
        group: 'Global'
    },
    hope: {
        id: 'hope',
        label: 'APP_EXAMPLE.CONFIG.HealingType.hope.name',
        group: 'TYPES.Actor.character'
    },
    armor: {
        id: 'armor',
        label: 'APP_EXAMPLE.CONFIG.HealingType.armor.name',
        group: 'TYPES.Actor.character'
    },
    fear: {
        id: 'fear',
        label: 'APP_EXAMPLE.CONFIG.HealingType.fear.name',
        group: 'TYPES.Actor.adversary'
    },
    resource: itemAbilityCosts.resource
};

export const countdownProgressionTypes = {
    actionRoll: {
        id: 'actionRoll',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.actionRoll'
    },
    characterAttack: {
        id: 'characterAttack',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.characterAttack'
    },
    characterSpotlight: {
        id: 'characterSpotlight',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.characterSpotlight'
    },
    custom: {
        id: 'custom',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.custom'
    },
    fear: {
        id: 'fear',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.fear'
    },
    spotlight: {
        id: 'spotlight',
        label: 'APP_EXAMPLE.CONFIG.CountdownType.spotlight'
    }
};
export const rollTypes = {
    attack: {
        id: 'attack',
        label: 'APP_EXAMPLE.CONFIG.RollTypes.attack.name'
    },
    spellcast: {
        id: 'spellcast',
        label: 'APP_EXAMPLE.CONFIG.RollTypes.spellcast.name',
        playerOnly: true
    },
    trait: {
        id: 'trait',
        label: 'APP_EXAMPLE.CONFIG.RollTypes.trait.name',
        playerOnly: true
    },
    diceSet: {
        id: 'diceSet',
        label: 'APP_EXAMPLE.CONFIG.RollTypes.diceSet.name'
    }
};

export const attributionSources = {
    "app-example": {
        label: 'app-example',
        values: [{ label: 'app-example SRD' }]
    }
};

export const fearDisplay = {
    token: { value: 'token', label: 'APP_EXAMPLE.SETTINGS.Appearance.fearDisplay.token' },
    bar: { value: 'bar', label: 'APP_EXAMPLE.SETTINGS.Appearance.fearDisplay.bar' },
    hide: { value: 'hide', label: 'APP_EXAMPLE.SETTINGS.Appearance.fearDisplay.hide' }
};

export const basicOwnershiplevels = {
    0: { value: 0, label: 'OWNERSHIP.NONE' },
    2: { value: 2, label: 'OWNERSHIP.OBSERVER' },
    3: { value: 3, label: 'OWNERSHIP.OWNER' }
};

export const simpleOwnershiplevels = {
    [-1]: { value: -1, label: 'OWNERSHIP.INHERIT' },
    ...basicOwnershiplevels
};

export const countdownBaseTypes = {
    narrative: {
        id: 'narrative',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.types.narrative'
    },
    encounter: {
        id: 'encounter',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.types.encounter'
    }
};

export const countdownLoopingTypes = {
    noLooping: {
        id: 'noLooping',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.loopingTypes.noLooping'
    },
    looping: {
        id: 'looping',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.loopingTypes.looping'
    },
    increasing: {
        id: 'increasing',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.loopingTypes.increasing'
    },
    decreasing: {
        id: 'decreasing',
        label: 'APP_EXAMPLE.APPLICATIONS.Countdown.loopingTypes.decreasing'
    }
};

export const countdownAppMode = {
    textIcon: 'text-icon',
    iconOnly: 'icon-only'
};

export const sceneRangeMeasurementSetting = {
    disable: {
        id: 'disable',
        label: 'Disable app-example Range Measurement'
    },
    default: {
        id: 'default',
        label: 'Default'
    },
    custom: {
        id: 'custom',
        label: 'Custom'
    }
};
