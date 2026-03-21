import { DhAutomation } from '../../data/settings/_module.mjs';

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class DhAutomationSettings extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor() {
        super({});

        this.settings = new DhAutomation(
            game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Automation).toObject()
        );
    }

    get title() {
        return game.i18n.localize('APP_EXAMPLE.SETTINGS.Menu.title');
    }

    static DEFAULT_OPTIONS = {
        tag: 'form',
        id: 'app-example-automation-settings',
        classes: ['app-example', 'dh-style', 'dialog', 'setting'],
        position: { width: '600', height: 'auto' },
        window: {
            icon: 'fa-solid fa-gears'
        },
        actions: {
            reset: this.reset,
            save: this.save
        },
        form: { handler: this.updateData, submitOnChange: true }
    };

    static PARTS = {
        header: { template: 'systems/app-example/templates/settings/automation-settings/header.hbs' },
        tabs: { template: 'systems/app-example/templates/sheets/global/tabs/tab-navigation.hbs' },
        general: { template: 'systems/app-example/templates/settings/automation-settings/general.hbs' },
        rules: { template: 'systems/app-example/templates/settings/automation-settings/deathMoves.hbs' },
        roll: { template: 'systems/app-example/templates/settings/automation-settings/roll.hbs' },
        footer: { template: 'systems/app-example/templates/settings/automation-settings/footer.hbs' }
    };

    /** @inheritdoc */
    static TABS = {
        main: {
            tabs: [{ id: 'general' }, { id: 'deathMoves' }, { id: 'roll' }],
            initial: 'general',
            labelPrefix: 'APP_EXAMPLE.GENERAL.Tabs'
        }
    };

    async _prepareContext(_options) {
        const context = await super._prepareContext(_options);
        context.settingFields = this.settings;

        return context;
    }

    static async updateData(event, element, formData) {
        const updatedSettings = foundry.utils.expandObject(formData.object);

        await this.settings.updateSource(updatedSettings);
        this.render();
    }

    static async reset() {
        this.settings = new DhAutomation();
        this.render();
    }

    static async save() {
        await game.settings.set(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Automation, this.settings.toObject());
        this.close();
    }
}
