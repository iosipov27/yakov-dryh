export const armorFeatures = {
    burning: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.burning.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.burning.description',
        actions: [
            {
                type: 'damage',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.burning.actions.burn.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.burning.actions.burn.description',
                img: 'icons/magic/fire/flame-burning-embers-yellow.webp',
                range: 'melee',
                target: {
                    type: 'hostile'
                },
                damage: {
                    parts: [
                        {
                            applyTo: 'stress',
                            value: {
                                custom: {
                                    enabled: true,
                                    formula: '1'
                                }
                            }
                        }
                    ]
                }
            }
        ]
    },
    channeling: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.channeling.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.channeling.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.channeling.effects.channeling.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.channeling.effects.channeling.description',
                img: 'icons/magic/symbols/rune-sigil-horned-blue.webp',
                changes: [
                    {
                        key: 'system.bonuses.roll.spellcast',
                        mode: 2,
                        value: '1'
                    }
                ]
            }
        ]
    },
    difficult: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.difficult.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.difficult.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.difficult.effects.difficult.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.difficult.effects.difficult.description',
                img: 'icons/magic/control/buff-flight-wings-red.webp',
                changes: [
                    {
                        key: 'system.traits.agility.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.traits.strength.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.traits.finesse.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.traits.instinct.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.traits.presence.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.traits.knowledge.value',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    flexible: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.flexible.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.flexible.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.flexible.effects.flexible.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.flexible.effects.flexible.description',
                img: 'icons/magic/movement/abstract-ribbons-red-orange.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '1'
                    }
                ]
            }
        ]
    },
    fortified: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.fortified.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.fortified.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.fortified.effects.fortified.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.fortified.effects.fortified.description',
                img: 'icons/magic/defensive/shield-barrier-glowing-blue.webp',
                changes: [
                    {
                        key: 'system.rules.damageReduction.increasePerArmorMark',
                        mode: 5,
                        value: '2'
                    }
                ]
            }
        ]
    },
    gilded: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.gilded.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.gilded.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.gilded.effects.gilded.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.gilded.effects.gilded.description',
                img: 'icons/magic/control/control-influence-crown-gold.webp',
                changes: [
                    {
                        key: 'system.traits.presence.value',
                        mode: 2,
                        value: '1'
                    }
                ]
            }
        ]
    },
    heavy: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.heavy.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.heavy.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.heavy.effects.heavy.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.heavy.effects.heavy.description',
                img: 'icons/commodities/metal/ingot-worn-iron.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    hopeful: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.hopeful.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.hopeful.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.hopeful.actions.hope.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.hopeful.actions.hope.description',
                img: 'icons/magic/holy/barrier-shield-winged-blue.webp'
            }
        ]
    },
    impenetrable: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.impenetrable.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.impenetrable.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.impenetrable.actions.impenetrable.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.impenetrable.actions.impenetrable.description',
                img: 'icons/magic/defensive/shield-barrier-flaming-pentagon-purple-orange.webp',
                uses: {
                    max: 1,
                    recovery: 'shortRest',
                    value: 0
                },
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    magical: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.magical.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.magical.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.magical.effects.magical.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.magical.effects.magical.description',
                img: 'icons/magic/defensive/barrier-shield-dome-blue-purple.webp',
                changes: [
                    {
                        key: 'system.rules.damageReduction.magical',
                        mode: 5,
                        value: 1
                    }
                ]
            }
        ]
    },
    painful: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.painful.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.painful.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.painful.actions.pain.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.painful.actions.pain.description',
                img: 'icons/skills/wounds/injury-face-impact-orange.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    physical: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.physical.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.physical.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.physical.effects.physical.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.physical.effects.physical.description',
                img: 'icons/commodities/stone/ore-pile-tan.webp',
                changes: [
                    {
                        key: 'system.rules.damageReduction.physical',
                        mode: 5,
                        value: 1
                    }
                ]
            }
        ]
    },
    quiet: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.quiet.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.quiet.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.quiet.actions.quiet.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.quiet.actions.quiet.description',
                img: 'icons/magic/perception/silhouette-stealth-shadow.webp'
            }
        ]
    },
    reinforced: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.reinforced.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.reinforced.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.reinforced.effects.reinforced.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.reinforced.effects.reinforced.description',
                img: 'icons/magic/defensive/shield-barrier-glowing-triangle-green.webp',
                changes: [
                    {
                        key: 'system.bunuses.damageThresholds.major',
                        mode: 2,
                        value: '2'
                    },
                    {
                        key: 'system.bunuses.damageThresholds.severe',
                        mode: 2,
                        value: '2'
                    }
                ]
            }
        ]
    },
    resilient: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.resilient.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.resilient.description',
        actions: [
            {
                type: 'attack',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.resilient.actions.resilient.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.resilient.actions.resilient.description',
                img: 'icons/magic/life/heart-cross-purple-orange.webp',
                roll: {
                    type: 'diceSet',
                    diceRolling: {
                        compare: 'equal',
                        dice: 'd6',
                        multiplier: 'flat',
                        flatMultiplier: 1,
                        treshold: 6
                    }
                }
            }
        ]
    },
    sharp: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.sharp.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.sharp.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.sharp.effects.sharp.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.sharp.effects.sharp.description',
                img: 'icons/magic/defensive/shield-barrier-glowing-triangle-green.webp',
                changes: [
                    {
                        key: 'system.bonuses.damage.primaryWeapon.dice',
                        mode: 2,
                        value: '1d4'
                    },
                    {
                        key: 'system.bonuses.damage.secondaryWeapon.dice',
                        mode: 2,
                        value: '1d4'
                    }
                ]
            }
        ]
    },
    shifting: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.shifting.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.shifting.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.shifting.actions.shift.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.shifting.actions.shift.description',
                img: 'icons/magic/defensive/illusion-evasion-echo-purple.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    timeslowing: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.timeslowing.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.timeslowing.description',
        actions: [
            {
                type: 'attack',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.timeslowing.actions.slowTime.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.timeslowing.actions.slowTime.description',
                img: 'icons/magic/time/hourglass-brown-orange.webp',
                cost: [
                    {
                        key: 'armorSlot',
                        value: 1
                    }
                ],
                roll: {
                    type: 'diceSet',
                    diceRolling: {
                        dice: 'd4',
                        multiplier: 'flat',
                        flatMultiplier: 1
                    }
                }
            }
        ]
    },
    truthseeking: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.truthseeking.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.truthseeking.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.truthseeking.actions.truthseeking.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.truthseeking.actions.truthseeking.description',
                img: 'icons/magic/perception/orb-crystal-ball-scrying-blue.webp'
            }
        ]
    },
    veryheavy: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.veryHeavy.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.veryHeavy.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.veryHeavy.effects.veryHeavy.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.veryHeavy.effects.veryHeavy.description',
                img: 'icons/commodities/metal/ingot-stamped-steel.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-2'
                    },
                    {
                        key: 'system.traits.agility.value',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    warded: {
        label: 'APP_EXAMPLE.CONFIG.ArmorFeature.warded.name',
        description: 'APP_EXAMPLE.CONFIG.ArmorFeature.warded.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.ArmorFeature.warded.effects.warded.name',
                description: 'APP_EXAMPLE.CONFIG.ArmorFeature.warded.effects.warded.description',
                img: 'icons/magic/defensive/barrier-shield-dome-pink.webp',
                changes: [
                    {
                        key: 'system.resistance.magical.reduction',
                        mode: 2,
                        value: '@system.armorScore',
                        priority: 21
                    }
                ]
            }
        ]
    }
};

export const allArmorFeatures = () => {
    const homebrewFeatures = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Homebrew).itemFeatures
        .armorFeatures;
    return {
        ...armorFeatures,
        ...Object.keys(homebrewFeatures).reduce((acc, key) => {
            const feature = homebrewFeatures[key];
            const actions = feature.actions.map(action => ({
                ...action,
                effects: action.effects.map(effect => feature.effects.find(x => x.id === effect._id)),
                type: action.type
            }));
            const actionEffects = actions.flatMap(a => a.effects);

            const effects = feature.effects.filter(effect => !actionEffects.some(x => x.id === effect.id));

            acc[key] = { ...feature, label: feature.name, effects, actions };
            return acc;
        }, {})
    };
};

export const orderedArmorFeatures = () => {
    const allFeatures = allArmorFeatures();
    const all = Object.keys(allFeatures).map(key => {
        const feature = allFeatures[key];
        return {
            ...feature,
            id: key,
            label: feature.label ?? feature.name
        };
    });
    return Object.values(all).sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label)));
};

export const weaponFeatures = {
    barrier: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.barrier.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.barrier.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.barrier.effects.barrier.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.barrier.effects.barrier.description',
                img: 'icons/skills/melee/shield-block-bash-blue.webp',
                changes: [
                    {
                        key: 'system.armorScore',
                        mode: 2,
                        value: 'ITEM.@system.tier + 1'
                    },
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    bonded: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.bonded.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.bonded.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.bonded.effects.damage.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.bonded.effects.damage.description',
                img: 'icons/magic/symbols/chevron-elipse-circle-blue.webp',
                changes: [
                    {
                        key: 'system.bonuses.damage.primaryWeapon.bonus',
                        mode: 2,
                        value: '@system.levelData.level.current'
                    }
                ]
            }
        ]
    },
    bouncing: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.bouncing.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.bouncing.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.bouncing.actions.bounce.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.bouncing.actions.bounce.description',
                img: 'icons/skills/movement/ball-spinning-blue.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1,
                        scalable: true,
                        step: 1
                    }
                ]
            }
        ]
    },
    brave: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.brave.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.brave.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.brave.effects.brave.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.brave.effects.brave.description',
                img: 'icons/magic/life/heart-cross-strong-flame-purple-orange.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    },
                    {
                        key: 'system.damageThresholds.severe',
                        mode: 2,
                        value: 'ITEM.@system.tier'
                    }
                ]
            }
        ]
    },
    brutal: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.brutal.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.brutal.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.brutal.actions.addDamage.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.brutal.actions.addDamage.description',
                img: 'icons/skills/melee/strike-dagger-blood-red.webp'
            }
        ]
    },
    burning: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.burning.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.burning.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.burning.actions.burn.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.burning.actions.burn.description',
                img: 'icons/magic/fire/blast-jet-stream-embers-orange.webp'
            }
        ]
    },
    charged: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.actions.markStress.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.actions.markStress.description',
                img: 'icons/magic/lightning/claws-unarmed-strike-teal.webp',
                target: {
                    type: 'self'
                },
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ],
                effects: [
                    {
                        name: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.name',
                        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.charged.description',
                        img: 'icons/magic/lightning/claws-unarmed-strike-teal.webp',
                        changes: [
                            {
                                key: 'system.proficiency',
                                mode: 2,
                                value: '1'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    concussive: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.concussive.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.concussive.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.concussive.actions.attack.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.concussive.actions.attack.description',
                img: 'icons/skills/melee/shield-block-bash-yellow.webp',
                target: {
                    type: 'any'
                },
                cost: [
                    {
                        key: 'hope',
                        value: 1
                    }
                ]
            }
        ]
    },
    cumbersome: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.cumbersome.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.cumbersome.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.cumbersome.effects.cumbersome.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.cumbersome.effects.cumbersome.description',
                img: 'icons/commodities/metal/mail-plate-steel.webp',
                changes: [
                    {
                        key: 'system.traits.finesse.value',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    deadly: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.deadly.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.deadly.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.deadly.actions.extraDamage.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.deadly.actions.extraDamage.description',
                img: 'icons/skills/melee/strike-sword-dagger-runes-red.webp'
            }
        ]
    },
    deflecting: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.actions.deflect.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.actions.deflect.description',
                img: 'icons/skills/melee/hand-grip-sword-strike-orange.webp',
                target: {
                    type: 'self'
                },
                cost: [
                    {
                        type: 'armor',
                        value: 1
                    }
                ],
                effects: [
                    {
                        name: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.effects.deflecting.name',
                        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.deflecting.effects.deflecting.description',
                        img: 'icons/skills/melee/hand-grip-sword-strike-orange.webp',
                        changes: [
                            {
                                key: 'system.evasion',
                                mode: 2,
                                value: '@system.armorScore',
                                priority: 21
                            }
                        ]
                    }
                ]
            }
        ]
    },
    destructive: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.description',
        actions: [
            {
                type: 'damage',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.actions.attack.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.actions.attack.descriptive',
                img: 'icons/skills/melee/strike-flail-spiked-pink.webp',
                range: 'veryClose',
                target: {
                    type: 'hostile'
                },
                damage: {
                    parts: [
                        {
                            applyTo: 'stress',
                            value: {
                                custom: {
                                    enabled: true,
                                    formula: '1'
                                }
                            }
                        }
                    ]
                }
            }
        ],
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.destructive.effects.agility',
                img: 'icons/skills/melee/strike-flail-spiked-pink.webp',
                changes: [
                    {
                        key: 'system.traits.agility.value',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    devastating: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.devastating.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.devastating.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.devastating.actions.devastate.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.devastating.actions.devastate.description',
                img: 'icons/skills/melee/strike-flail-destructive-yellow.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    doubleDuty: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubleDuty.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubleDuty.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubleDuty.effects.doubleDuty.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubleDuty.effects.doubleDuty.description',
                img: 'icons/skills/melee/sword-shield-stylized-white.webp',
                changes: [
                    {
                        key: 'system.armorScore',
                        mode: 2,
                        value: '1'
                    },
                    {
                        key: 'system.bonuses.damage.primaryWeapon.bonus',
                        mode: 2,
                        value: '1'
                    }
                ],
                system: {
                    rangeDependence: {
                        enabled: true,
                        range: 'melee',
                        target: 'hostile',
                        type: 'withinRange'
                    }
                }
            }
        ]
    },
    doubledUp: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubledUp.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubledUp.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubledUp.actions.doubleUp.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.doubledUp.actions.doubleUp.description',
                img: 'icons/skills/melee/strike-slashes-orange.webp'
            }
        ]
    },
    dueling: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.dueling.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.dueling.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.dueling.actions.duel.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.dueling.actions.duel.description',
                img: 'icons/skills/melee/weapons-crossed-swords-pink.webp'
            }
        ]
    },
    eruptive: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.eruptive.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.eruptive.description',
        actions: [
            {
                type: 'effect', // Should prompt a dc 14 reaction save on adversaries
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.eruptive.actions.erupt.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.eruptive.actions.erupt.description',
                img: 'icons/skills/melee/strike-hammer-destructive-blue.webp'
            }
        ]
    },
    grappling: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.grappling.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.grappling.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.grappling.actions.grapple.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.grappling.actions.grapple.description',
                img: 'icons/magic/control/debuff-chains-ropes-net-white.webp',
                cost: [
                    {
                        key: 'hope',
                        value: 1
                    }
                ]
            }
        ]
    },
    greedy: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.description',
                img: 'icons/commodities/currency/coins-crown-stack-gold.webp',
                target: {
                    type: 'self'
                },
                // Should cost handful of gold,
                effects: [
                    {
                        name: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.actions.greed.name',
                        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.greedy.actions.greed.description',
                        img: 'icons/commodities/currency/coins-crown-stack-gold.webp',
                        changes: [
                            {
                                key: 'system.proficiency',
                                mode: 2,
                                value: '1'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    healing: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.healing.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.healing.description',
        actions: [
            {
                type: 'healing',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.healing.actions.heal.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.healing.actions.heal.description',
                img: 'icons/magic/life/cross-beam-green.webp',
                target: {
                    type: 'self'
                },
                damage: {
                    parts: [
                        {
                            applyTo: 'hitPoints',
                            value: {
                                custom: {
                                    enabled: true,
                                    formula: 1
                                }
                            }
                        }
                    ]
                }
            }
        ]
    },
    heavy: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.heavy.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.heavy.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.heavy.effects.heavy.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.heavy.effects.heavy.description',
                img: 'icons/commodities/metal/ingot-worn-iron.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    hooked: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.hooked.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.hooked.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.hooked.actions.hook.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.hooked.actions.hook.description',
                img: 'icons/skills/melee/strike-chain-whip-blue.webp'
            }
        ]
    },
    hot: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.hot.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.hot.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.hot.actions.hot.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.hot.actions.hot.description',
                img: 'icons/magic/fire/dagger-rune-enchant-flame-red.webp'
            }
        ]
    },
    invigorating: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.invigorating.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.invigorating.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.invigorating.actions.invigorate.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.invigorating.actions.invigorate.description',
                img: 'icons/magic/life/heart-cross-green.webp'
            }
        ]
    },
    lifestealing: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.lifestealing.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lifestealing.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.lifestealing.actions.lifesteal.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lifestealing.actions.lifesteal.description',
                img: 'icons/magic/unholy/hand-claw-fire-blue.webp'
            }
        ]
    },
    lockedOn: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.lockedOn.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lockedOn.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.lockedOn.actions.lockOn.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lockedOn.actions.lockOn.description',
                img: 'icons/skills/targeting/crosshair-arrowhead-blue.webp'
            }
        ]
    },
    long: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.long.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.long.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.long.actions.long.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.long.actions.long.description',
                img: 'icons/skills/melee/strike-weapon-polearm-ice-blue.webp'
            }
        ]
    },
    lucky: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.lucky.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lucky.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.lucky.actions.luck.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.lucky.actions.luck.description',
                img: 'icons/magic/control/buff-luck-fortune-green.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    massive: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.massive.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.massive.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.massive.effects.massive.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.massive.effects.massive.description',
                img: 'icons/skills/melee/strike-flail-destructive-yellow.webp',
                changes: [
                    {
                        key: 'system.evasion',
                        mode: 2,
                        value: '-1'
                    }
                ]
            }
        ]
    },
    painful: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.painful.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.painful.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.painful.actions.pain.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.painful.actions.pain.description',
                img: 'icons/skills/wounds/injury-face-impact-orange.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    paired: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.paired.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.paired.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.paired.effects.paired.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.paired.effects.paired.description',
                img: 'icons/skills/melee/weapons-crossed-swords-yellow-teal.webp',
                changes: [
                    {
                        key: 'system.bonuses.damage.primaryWeapon.bonus',
                        mode: 2,
                        value: 'ITEM.@system.tier + 1'
                    }
                ],
                system: {
                    rangeDependence: {
                        enabled: true,
                        range: 'melee',
                        target: 'hostile',
                        type: 'withinRange'
                    }
                }
            }
        ]
    },
    parry: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.parry.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.parry.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.parry.actions.parry.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.parry.actions.parry.description',
                img: 'icons/skills/melee/shield-block-fire-orange.webp'
            }
        ]
    },
    persuasive: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.actions.persuade.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.actions.persuade.description',
                img: 'icons/magic/control/hypnosis-mesmerism-eye.webp',
                target: {
                    type: 'self'
                },
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ],
                effects: [
                    {
                        name: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.effects.persuasive.name',
                        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.persuasive.effects.persuasive.description',
                        img: 'icons/magic/control/hypnosis-mesmerism-eye.webp',
                        changes: [
                            {
                                key: 'system.traits.presence.value',
                                mode: 2,
                                value: '2'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    pompous: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.pompous.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.pompous.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.pompous.actions.pompous.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.pompous.actions.pompous.description',
                img: 'icons/magic/control/control-influence-crown-gold.webp'
            }
        ]
    },
    powerful: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.powerful.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.powerful.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.powerful.effects.powerful.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.powerful.effects.powerful.description',
                img: 'icons/magic/control/buff-flight-wings-runes-red-yellow.webp',
                changes: []
            }
        ]
    },
    protective: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.protective.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.protective.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.protective.effects.protective.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.protective.effects.protective.description',
                img: 'icons/skills/melee/shield-block-gray-orange.webp',
                changes: [
                    {
                        key: 'system.armorScore',
                        mode: 2,
                        value: 'ITEM.@system.tier'
                    }
                ]
            }
        ]
    },
    quick: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.quick.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.quick.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.quick.actions.quick.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.quick.actions.quick.description',
                img: 'icons/skills/movement/arrow-upward-yellow.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    reliable: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.reliable.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.reliable.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.reliable.effects.reliable.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.reliable.effects.reliable.description',
                img: 'icons/skills/melee/strike-sword-slashing-red.webp',
                changes: [
                    {
                        key: 'system.bonuses.roll.primaryWeapon.bonus',
                        mode: 2,
                        value: 1
                    }
                ]
            }
        ]
    },
    reloading: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.reloading.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.reloading.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.reloading.actions.reload.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.reloading.actions.reload.description',
                img: 'icons/weapons/ammunition/shot-round-blue.webp'
            }
        ]
    },
    retractable: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.retractable.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.retractable.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.retractable.actions.retract.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.retractable.actions.retract.description',
                img: 'icons/skills/melee/blade-tip-smoke-green.webp'
            }
        ]
    },
    returning: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.returning.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.returning.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.returning.actions.return.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.returning.actions.return.description',
                img: 'icons/magic/movement/trail-streak-pink.webp'
            }
        ]
    },
    scary: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.scary.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.scary.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.scary.actions.scare.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.scary.actions.scare.description',
                img: 'icons/magic/death/skull-energy-light-purple.webp'
            }
        ]
    },
    selfCorrecting: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.selfCorrecting.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.selfCorrecting.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.selfCorrecting.effects.selfCorrecting.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.selfCorrecting.effects.selfCorrecting.description',
                img: 'icons/weapons/ammunition/arrow-broadhead-glowing-orange.webp',
                changes: []
            }
        ]
    },
    serrated: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.serrated.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.serrated.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.serrated.effects.serrated.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.serrated.effects.serrated.description',
                img: 'icons/weapons/ammunition/arrow-broadhead-glowing-orange.webp',
                changes: []
            }
        ]
    },
    sharpwing: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.sharpwing.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.sharpwing.description',
        effects: [
            {
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.sharpwing.effects.sharpwing.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.sharpwing.effects.sharpwing.description',
                img: 'icons/weapons/swords/sword-winged-pink.webp',
                changes: [
                    {
                        key: 'system.bonuses.damage.primaryWeapon.bonus',
                        mode: 2,
                        value: '@system.traits.agility.value',
                        priority: 21
                    }
                ]
            }
        ]
    },
    sheltering: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.sheltering.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.sheltering.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.sheltering.actions.shelter.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.sheltering.actions.shelter.description',
                img: 'icons/skills/melee/shield-block-gray-yellow.webp'
            }
        ]
    },
    startling: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.startling.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.startling.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.startling.actions.startle.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.startling.actions.startle.description',
                img: 'icons/magic/control/fear-fright-mask-orange.webp',
                cost: [
                    {
                        key: 'stress',
                        value: 1
                    }
                ]
            }
        ]
    },
    timebending: {
        label: 'APP_EXAMPLE.CONFIG.WeaponFeature.timebending.name',
        description: 'APP_EXAMPLE.CONFIG.WeaponFeature.timebending.description',
        actions: [
            {
                type: 'effect',
                chatDisplay: true,
                name: 'APP_EXAMPLE.CONFIG.WeaponFeature.timebending.actions.bendTime.name',
                description: 'APP_EXAMPLE.CONFIG.WeaponFeature.timebending.actions.bendTime.description',
                img: 'icons/magic/time/clock-spinning-gold-pink.webp'
            }
        ]
    }
};

export const allWeaponFeatures = () => {
    const homebrewFeatures = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Homebrew).itemFeatures
        .weaponFeatures;

    return {
        ...weaponFeatures,
        ...Object.keys(homebrewFeatures).reduce((acc, key) => {
            const feature = homebrewFeatures[key];

            const actions = feature.actions.map(action => ({
                ...action,
                effects: action.effects.map(effect => feature.effects.find(x => x.id === effect._id)),
                type: action.type
            }));
            const actionEffects = actions.flatMap(a => a.effects);
            const effects = feature.effects.filter(effect => !actionEffects.some(x => x.id === effect.id));

            acc[key] = { ...feature, label: feature.name, effects, actions };
            return acc;
        }, {})
    };
};

export const orderedWeaponFeatures = () => {
    const allFeatures = allWeaponFeatures();
    const all = Object.keys(allFeatures).map(key => {
        const feature = allFeatures[key];
        return {
            ...feature,
            id: key,
            label: feature.label ?? feature.name
        };
    });
    return Object.values(all).sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label)));
};

export const featureForm = {
    passive: 'APP_EXAMPLE.CONFIG.FeatureForm.passive',
    action: 'APP_EXAMPLE.CONFIG.FeatureForm.action',
    reaction: 'APP_EXAMPLE.CONFIG.FeatureForm.reaction'
};

export const featureTypes = {
    ancestry: {
        id: 'ancestry',
        label: 'TYPES.Item.ancestry'
    },
    community: {
        id: 'community',
        label: 'TYPES.Item.community'
    },
    companion: {
        id: 'companion',
        label: 'TYPES.Actor.companion'
    },
    class: {
        id: 'class',
        label: 'TYPES.Item.class'
    },
    subclass: {
        id: 'subclass',
        label: 'TYPES.Item.subclass'
    },
    domainCard: {
        id: 'domainCard',
        label: 'TYPES.Item.domainCard'
    },
    armor: {
        id: 'armor',
        label: 'TYPES.Item.armor'
    },
    weapon: {
        id: 'weapon',
        label: 'TYPES.Item.weapon'
    },
    consumable: {
        id: 'consumable',
        label: 'TYPES.Item.consumable'
    },
    loot: {
        id: 'loot',
        label: 'TYPES.Item.loot'
    },
    beastform: {
        if: 'beastform',
        label: 'TYPES.Item.beastform'
    }
};

export const featureSubTypes = {
    primary: 'primary',
    secondary: 'secondary',
    hope: 'hope',
    class: 'class',
    foundation: 'foundation',
    specialization: 'specialization',
    mastery: 'mastery'
};

export const itemResourceTypes = {
    simple: {
        id: 'simple',
        label: 'APP_EXAMPLE.CONFIG.ItemResourceType.simple'
    },
    diceValue: {
        id: 'diceValue',
        label: 'APP_EXAMPLE.CONFIG.ItemResourceType.diceValue'
    },
    die: {
        id: 'die',
        label: 'APP_EXAMPLE.CONFIG.ItemResourceType.die'
    }
};

export const itemResourceProgression = {
    increasing: {
        id: 'increasing',
        label: 'APP_EXAMPLE.CONFIG.ItemResourceProgression.increasing'
    },
    decreasing: {
        id: 'decreasing',
        label: 'APP_EXAMPLE.CONFIG.ItemResourceProgression.decreasing'
    }
};

export const beastformTypes = {
    normal: {
        id: 'normal',
        label: 'APP_EXAMPLE.CONFIG.BeastformType.normal'
    },
    evolved: {
        id: 'evolved',
        label: 'APP_EXAMPLE.CONFIG.BeastformType.evolved'
    },
    hybrid: {
        id: 'hybrid',
        label: 'APP_EXAMPLE.CONFIG.BeastformType.hybrid'
    }
};

export const originItemType = {
    itemCollection: 'itemCollection',
    restMove: 'restMove'
};
