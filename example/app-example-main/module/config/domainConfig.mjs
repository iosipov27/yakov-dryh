export const domains = {
    arcana: {
        id: 'arcana',
        label: 'APP_EXAMPLE.GENERAL.Domain.arcana.label',
        src: 'systems/app-example/assets/icons/domains/arcana.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.arcana.description'
    },
    blade: {
        id: 'blade',
        label: 'APP_EXAMPLE.GENERAL.Domain.blade.label',
        src: 'systems/app-example/assets/icons/domains/blade.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.blade.description'
    },
    bone: {
        id: 'bone',
        label: 'APP_EXAMPLE.GENERAL.Domain.bone.label',
        src: 'systems/app-example/assets/icons/domains/bone.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.bone.description'
    },
    codex: {
        id: 'codex',
        label: 'APP_EXAMPLE.GENERAL.Domain.codex.label',
        src: 'systems/app-example/assets/icons/domains/codex.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.codex.description'
    },
    grace: {
        id: 'grace',
        label: 'APP_EXAMPLE.GENERAL.Domain.grace.label',
        src: 'systems/app-example/assets/icons/domains/grace.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.grace.description'
    },
    midnight: {
        id: 'midnight',
        label: 'APP_EXAMPLE.GENERAL.Domain.midnight.label',
        src: 'systems/app-example/assets/icons/domains/midnight.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.midnight.description'
    },
    sage: {
        id: 'sage',
        label: 'APP_EXAMPLE.GENERAL.Domain.sage.label',
        src: 'systems/app-example/assets/icons/domains/sage.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.sage.description'
    },
    splendor: {
        id: 'splendor',
        label: 'APP_EXAMPLE.GENERAL.Domain.splendor.label',
        src: 'systems/app-example/assets/icons/domains/splendor.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.splendor.description'
    },
    valor: {
        id: 'valor',
        label: 'APP_EXAMPLE.GENERAL.Domain.valor.label',
        src: 'systems/app-example/assets/icons/domains/valor.svg',
        description: 'APP_EXAMPLE.GENERAL.Domain.valor.description'
    }
};

export const allDomains = () => ({
    ...domains,
    ...game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Homebrew).domains
});

export const orderedDomains = () => {
    const all = {
        ...domains,
        ...game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Homebrew).domains
    };
    return Object.values(all).sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label)));
};

export const subclassMap = {
    syndicate: {
        id: 'syndicate',
        label: 'Syndicate'
    },
    nightwalker: {
        id: 'nightwalker',
        label: 'Nightwalker'
    }
};

export const classMap = {
    rogue: {
        label: 'Rogue',
        subclasses: [subclassMap.syndicate.id, subclassMap.nightwalker.id]
    },
    seraph: {
        label: 'Seraph',
        subclasses: []
    }
};

export const cardTypes = {
    ability: {
        id: 'ability',
        label: 'APP_EXAMPLE.CONFIG.DomainCardTypes.ability',
        img: ''
    },
    spell: {
        id: 'spell',
        label: 'APP_EXAMPLE.CONFIG.DomainCardTypes.spell',
        img: ''
    },
    grimoire: {
        id: 'grimoire',
        label: 'APP_EXAMPLE.CONFIG.DomainCardTypes.grimoire',
        img: ''
    }
};
