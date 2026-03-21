export const typeConfig = {
    adversaries: {
        columns: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular'
            },
            {
                key: 'system.type',
                label: 'APP_EXAMPLE.GENERAL.type'
            }
        ],
        filters: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular',
                field: 'system.api.models.actors.DhAdversary.schema.fields.tier'
            },
            {
                key: 'system.type',
                label: 'APP_EXAMPLE.GENERAL.type',
                field: 'system.api.models.actors.DhAdversary.schema.fields.type'
            },
            {
                key: 'system.difficulty',
                name: 'difficulty.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.difficultyMin',
                field: 'system.api.models.actors.DhAdversary.schema.fields.difficulty',
                operator: 'gte'
            },
            {
                key: 'system.difficulty',
                name: 'difficulty.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.difficultyMax',
                field: 'system.api.models.actors.DhAdversary.schema.fields.difficulty',
                operator: 'lte'
            },
            {
                key: 'system.resources.hitPoints.max',
                name: 'hp.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.hitPointsMin',
                field: 'system.api.models.actors.DhAdversary.schema.fields.resources.fields.hitPoints.fields.max',
                operator: 'gte'
            },
            {
                key: 'system.resources.hitPoints.max',
                name: 'hp.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.hitPointsMax',
                field: 'system.api.models.actors.DhAdversary.schema.fields.resources.fields.hitPoints.fields.max',
                operator: 'lte'
            },
            {
                key: 'system.resources.stress.max',
                name: 'stress.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.stressMin',
                field: 'system.api.models.actors.DhAdversary.schema.fields.resources.fields.stress.fields.max',
                operator: 'gte'
            },
            {
                key: 'system.resources.stress.max',
                name: 'stress.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.stressMax',
                field: 'system.api.models.actors.DhAdversary.schema.fields.resources.fields.stress.fields.max',
                operator: 'lte'
            }
        ]
    },
    items: {
        columns: [
            {
                key: 'type',
                label: 'APP_EXAMPLE.GENERAL.type'
            },
            {
                key: 'system.secondary',
                label: 'APP_EXAMPLE.UI.ItemBrowser.subtype',
                format: isSecondary => (isSecondary ? 'secondary' : isSecondary === false ? 'primary' : '-')
            },
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular'
            }
        ],
        filters: [
            {
                key: 'type',
                label: 'APP_EXAMPLE.GENERAL.type',
                choices: () =>
                    CONFIG.Item.documentClass.TYPES.filter(t =>
                        ['armor', 'weapon', 'consumable', 'loot'].includes(t)
                    ).map(t => ({ value: t, label: t }))
            },
            {
                key: 'system.secondary',
                label: 'APP_EXAMPLE.UI.ItemBrowser.subtype',
                choices: [
                    { value: false, label: 'APP_EXAMPLE.ITEMS.Weapon.primaryWeapon' },
                    { value: true, label: 'APP_EXAMPLE.ITEMS.Weapon.secondaryWeapon' }
                ]
            },
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular',
                choices: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' }
                ]
            },
            {
                key: 'system.burden',
                label: 'APP_EXAMPLE.GENERAL.burden',
                field: 'system.api.models.items.DHWeapon.schema.fields.burden'
            },
            {
                key: 'system.attack.roll.trait',
                label: 'APP_EXAMPLE.GENERAL.Trait.single',
                field: 'system.api.models.actions.actionsTypes.attack.schema.fields.roll.fields.trait'
            },
            {
                key: 'system.attack.range',
                label: 'APP_EXAMPLE.GENERAL.range',
                field: 'system.api.models.actions.actionsTypes.attack.schema.fields.range'
            },
            {
                key: 'system.baseScore',
                name: 'armor.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.armorScoreMin',
                field: 'system.api.models.items.DHArmor.schema.fields.baseScore',
                operator: 'gte'
            },
            {
                key: 'system.baseScore',
                name: 'armor.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.armorScoreMax',
                field: 'system.api.models.items.DHArmor.schema.fields.baseScore',
                operator: 'lte'
            },
            {
                key: 'system.itemFeatures',
                label: 'APP_EXAMPLE.GENERAL.features',
                choices: () =>
                    [
                        ...Object.entries(CONFIG.DH.ITEM.weaponFeatures),
                        ...Object.entries(CONFIG.DH.ITEM.armorFeatures)
                    ].map(([k, v]) => ({ value: k, label: v.label })),
                operator: 'contains3'
            }
        ]
    },
    weapons: {
        columns: [
            {
                key: 'system.secondary',
                label: 'APP_EXAMPLE.UI.ItemBrowser.subtype',
                format: isSecondary => (isSecondary ? 'secondary' : isSecondary === false ? 'primary' : '-')
            },
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular'
            }
        ],
        filters: [
            {
                key: 'system.secondary',
                label: 'APP_EXAMPLE.UI.ItemBrowser.subtype',
                choices: [
                    { value: false, label: 'APP_EXAMPLE.ITEMS.Weapon.primaryWeapon' },
                    { value: true, label: 'APP_EXAMPLE.ITEMS.Weapon.secondaryWeapon' }
                ]
            },
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular',
                choices: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' }
                ]
            },
            {
                key: 'system.burden',
                label: 'APP_EXAMPLE.GENERAL.burden',
                field: 'system.api.models.items.DHWeapon.schema.fields.burden'
            },
            {
                key: 'system.attack.roll.trait',
                label: 'APP_EXAMPLE.GENERAL.Trait.single',
                field: 'system.api.models.actions.actionsTypes.attack.schema.fields.roll.fields.trait'
            },
            {
                key: 'system.attack.range',
                label: 'APP_EXAMPLE.GENERAL.range',
                field: 'system.api.models.actions.actionsTypes.attack.schema.fields.range'
            },
            {
                key: 'system.itemFeatures',
                label: 'APP_EXAMPLE.GENERAL.features',
                choices: () =>
                    Object.entries(CONFIG.DH.ITEM.weaponFeatures).map(([k, v]) => ({ value: k, label: v.label })),
                operator: 'contains3'
            }
        ]
    },
    armors: {
        columns: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular'
            }
        ],
        filters: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular',
                choices: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' }
                ]
            },
            {
                key: 'system.baseScore',
                name: 'armor.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.armorScoreMin',
                field: 'system.api.models.items.DHArmor.schema.fields.baseScore',
                operator: 'gte'
            },
            {
                key: 'system.baseScore',
                name: 'armor.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.armorScoreMax',
                field: 'system.api.models.items.DHArmor.schema.fields.baseScore',
                operator: 'lte'
            },
            {
                key: 'system.itemFeatures',
                label: 'APP_EXAMPLE.GENERAL.features',
                choices: () =>
                    Object.entries(CONFIG.DH.ITEM.armorFeatures).map(([k, v]) => ({ value: k, label: v.label })),
                operator: 'contains3'
            }
        ]
    },
    features: {
        columns: [],
        filters: []
    },
    cards: {
        columns: [
            {
                key: 'system.type',
                label: 'APP_EXAMPLE.GENERAL.type'
            },
            {
                key: 'system.domain',
                label: 'APP_EXAMPLE.GENERAL.Domain.single'
            },
            {
                key: 'system.level',
                label: 'APP_EXAMPLE.GENERAL.level'
            }
        ],
        filters: [
            {
                key: 'system.type',
                label: 'APP_EXAMPLE.GENERAL.type',
                field: 'system.api.models.items.DHDomainCard.schema.fields.type'
            },
            {
                key: 'system.domain',
                label: 'APP_EXAMPLE.GENERAL.Domain.single',
                field: 'system.api.models.items.DHDomainCard.schema.fields.domain',
                operator: 'contains2'
            },
            {
                key: 'system.level',
                name: 'level.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.levelMin',
                field: 'system.api.models.items.DHDomainCard.schema.fields.level',
                operator: 'gte'
            },
            {
                key: 'system.level',
                name: 'level.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.levelMax',
                field: 'system.api.models.items.DHDomainCard.schema.fields.level',
                operator: 'lte'
            },
            {
                key: 'system.recallCost',
                name: 'recall.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.recallCostMin',
                field: 'system.api.models.items.DHDomainCard.schema.fields.recallCost',
                operator: 'gte'
            },
            {
                key: 'system.recallCost',
                name: 'recall.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.recallCostMax',
                field: 'system.api.models.items.DHDomainCard.schema.fields.recallCost',
                operator: 'lte'
            }
        ]
    },
    classes: {
        columns: [
            {
                key: 'system.evasion',
                label: 'APP_EXAMPLE.GENERAL.evasion'
            },
            {
                key: 'system.hitPoints',
                label: 'APP_EXAMPLE.GENERAL.HitPoints.plural'
            },
            {
                key: 'system.domains',
                label: 'APP_EXAMPLE.GENERAL.Domain.plural'
            }
        ],
        filters: [
            {
                key: 'system.evasion',
                name: 'evasion.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.evasionMin',
                field: 'system.api.models.items.DHClass.schema.fields.evasion',
                operator: 'gte'
            },
            {
                key: 'system.evasion',
                name: 'evasion.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.evasionMax',
                field: 'system.api.models.items.DHClass.schema.fields.evasion',
                operator: 'lte'
            },
            {
                key: 'system.hitPoints',
                name: 'hp.min',
                label: 'APP_EXAMPLE.UI.ItemBrowser.hitPointsMin',
                field: 'system.api.models.items.DHClass.schema.fields.hitPoints',
                operator: 'gte'
            },
            {
                key: 'system.hitPoints',
                name: 'hp.max',
                label: 'APP_EXAMPLE.UI.ItemBrowser.hitPointsMax',
                field: 'system.api.models.items.DHClass.schema.fields.hitPoints',
                operator: 'lte'
            },
            {
                key: 'system.domains',
                label: 'APP_EXAMPLE.GENERAL.Domain.plural',
                choices: () => Object.values(CONFIG.DH.DOMAIN.allDomains()).map(d => ({ value: d.id, label: d.label })),
                operator: 'contains2'
            }
        ]
    },
    subclasses: {
        columns: [
            {
                key: 'system.linkedClass',
                label: 'Class',
                format: linkedClass => linkedClass?.name ?? 'APP_EXAMPLE.UI.ItemBrowser.missing'
            },
            {
                key: 'system.spellcastingTrait',
                label: 'APP_EXAMPLE.ITEMS.Subclass.spellcastingTrait'
            }
        ],
        filters: [
            {
                key: 'system.linkedClass.uuid',
                label: 'Class',
                choices: items => {
                    const list = items
                        .filter(item => item.system.linkedClass)
                        .map(item => ({
                            value: item.system.linkedClass.uuid,
                            label: item.system.linkedClass.name
                        }));
                    return list.reduce((a, c) => {
                        if (!a.find(i => i.value === c.value)) a.push(c);
                        return a;
                    }, []);
                }
            }
        ]
    },
    beastforms: {
        columns: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular'
            },
            {
                key: 'system.mainTrait',
                label: 'APP_EXAMPLE.GENERAL.Trait.single'
            }
        ],
        filters: [
            {
                key: 'system.tier',
                label: 'APP_EXAMPLE.GENERAL.Tiers.singular',
                field: 'system.api.models.items.DHBeastform.schema.fields.tier'
            },
            {
                key: 'system.mainTrait',
                label: 'APP_EXAMPLE.GENERAL.Trait.single',
                field: 'system.api.models.items.DHBeastform.schema.fields.mainTrait'
            }
        ]
    }
};

export const compendiumConfig = {
    characters: {
        id: 'characters',
        keys: ['characters'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.characters',
        type: ['character']
        // listType: 'characters'
    },
    adversaries: {
        id: 'adversaries',
        keys: ['adversaries'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.adversaries',
        type: ['adversary'],
        listType: 'adversaries'
    },
    ancestries: {
        id: 'ancestries',
        keys: ['ancestries'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.ancestries',
        type: ['ancestry']
        /* folders: {
            features: {
                id: 'features',
                keys: ['ancestries'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.features',
                type: ['feature']
            }
        } */
    },
    equipments: {
        id: 'equipments',
        keys: ['armors', 'weapons', 'consumables', 'loot'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.equipment',
        type: ['armor', 'weapon', 'consumable', 'loot'],
        listType: 'items',
        folders: {
            weapons: {
                id: 'weapons',
                keys: ['weapons'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.weapons',
                type: ['weapon'],
                listType: 'weapons'
            },
            armors: {
                id: 'armors',
                keys: ['armors'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.armors',
                type: ['armor'],
                listType: 'armors'
            },
            consumables: {
                id: 'consumables',
                keys: ['consumables'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.consumables',
                type: ['consumable']
            },
            loots: {
                id: 'loots',
                keys: ['loots'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.loots',
                type: ['loot']
            }
        }
    },
    classes: {
        id: 'classes',
        keys: ['classes'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.classes',
        type: ['class'],
        /* folders: {
            features: {
                id: 'features',
                keys: ['classes'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.features',
                type: ['feature']
            },
            items: {
                id: 'items',
                keys: ['classes'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.items',
                type: ['armor', 'weapon', 'consumable', 'loot'],
                listType: 'items'
            }
        }, */
        listType: 'classes'
    },
    subclasses: {
        id: 'subclasses',
        keys: ['subclasses'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.subclasses',
        type: ['subclass'],
        listType: 'subclasses'
    },
    domains: {
        id: 'domains',
        keys: ['domains'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.domainCards',
        type: ['domainCard'],
        listType: 'cards'
    },
    communities: {
        id: 'communities',
        keys: ['communities'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.communities',
        type: ['community']
        /* folders: {
            features: {
                id: 'features',
                keys: ['communities'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.features',
                type: ['feature']
            }
        } */
    },
    environments: {
        id: 'environments',
        keys: ['environments'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.environments',
        type: ['environment']
    },
    beastforms: {
        id: 'beastforms',
        keys: ['beastforms'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.beastforms',
        type: ['beastform'],
        listType: 'beastforms'
        /* folders: {
            features: {
                id: 'features',
                keys: ['beastforms'],
                label: 'APP_EXAMPLE.UI.ItemBrowser.folders.features',
                type: ['feature']
            }
        } */
    },
    features: {
        id: 'features',
        keys: ['features'],
        label: 'APP_EXAMPLE.UI.ItemBrowser.folders.features',
        type: ['feature']
    }
};
