import { RefreshFeatures } from '../../../helpers/utils.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;
/**
 * The app-example menu tab.
 * @extends {AbstractSidebarTab}
 * @mixes HandlebarsApplication
 */
export default class AppExampleMenu extends HandlebarsApplicationMixin(AbstractSidebarTab) {
    constructor(options) {
        super(options);

        this.refreshSelections = AppExampleMenu.defaultRefreshSelections();
    }

    static defaultRefreshSelections() {
        return {
            session: { selected: false, label: game.i18n.localize('APP_EXAMPLE.GENERAL.RefreshType.session') },
            scene: { selected: false, label: game.i18n.localize('APP_EXAMPLE.GENERAL.RefreshType.scene') },
            longRest: { selected: false, label: game.i18n.localize('APP_EXAMPLE.GENERAL.RefreshType.longrest') },
            shortRest: { selected: false, label: game.i18n.localize('APP_EXAMPLE.GENERAL.RefreshType.shortrest') }
        };
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ['dh-style', 'directory'],
        window: {
            title: 'SIDEBAR.TabSettings'
        },
        actions: {
            selectRefreshable: AppExampleMenu.#selectRefreshable,
            refreshActors: AppExampleMenu.#refreshActors
        }
    };

    /** @override */
    static tabName = 'appExampleMenu';

    /** @override */
    static PARTS = {
        main: { template: 'systems/app-example/templates/sidebar/app-example-menu/main.hbs' }
    };

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.refreshables = this.refreshSelections;
        context.disableRefresh = Object.values(this.refreshSelections).every(x => !x.selected);

        return context;
    }

    /* -------------------------------------------- */
    /*  Application Clicks Actions                  */
    /* -------------------------------------------- */

    static async #selectRefreshable(_event, button) {
        const { type } = button.dataset;
        this.refreshSelections[type].selected = !this.refreshSelections[type].selected;
        this.render();
    }

    static async #refreshActors() {
        const refreshKeys = Object.keys(this.refreshSelections).filter(key => this.refreshSelections[key].selected);
        await RefreshFeatures(refreshKeys);

        this.refreshSelections = AppExampleMenu.defaultRefreshSelections();
        this.render();
    }
}
