import DHBaseItemSheet from './base-item.mjs';

export default class DHHeritageSheet extends DHBaseItemSheet {
    /**@inheritdoc */
    static DEFAULT_OPTIONS = {
        position: { width: 450, height: 700 }
    };

    /**@override */
    static PARTS = {
        tabs: { template: 'systems/app-example/templates/sheets/global/tabs/tab-navigation.hbs' },
        description: { template: 'systems/app-example/templates/sheets/global/tabs/tab-description.hbs' },
        effects: {
            template: 'systems/app-example/templates/sheets/global/tabs/tab-effects.hbs',
            scrollable: ['.effects']
        }
    };

    /** @override*/
    static TABS = {
        primary: {
            tabs: [{ id: 'description' }, { id: 'features' }, { id: 'effects' }],
            initial: 'description',
            labelPrefix: 'APP_EXAMPLE.GENERAL.Tabs'
        }
    };
}
