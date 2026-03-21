import { RefreshType, socketEvent } from '../../systemRegistration/socket.mjs';

export default class DhSceneConfigSettings extends foundry.applications.sheets.SceneConfig {
    constructor(options) {
        super(options);

        Hooks.on(socketEvent.Refresh, ({ refreshType }) => {
            if (refreshType === RefreshType.Scene) this.render();
        });
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            ...super.DEFAULT_OPTIONS.actions,
            removeSceneEnvironment: DhSceneConfigSettings.#removeSceneEnvironment
        }
    };

    static buildParts() {
        const { footer, tabs, ...parts } = super.PARTS;
        const tmpParts = {
            tabs: { template: 'systems/app-example/templates/scene/tabs.hbs' },
            ...parts,
            dh: { template: 'systems/app-example/templates/scene/dh-config.hbs' },
            footer
        };
        return tmpParts;
    }

    static PARTS = DhSceneConfigSettings.buildParts();

    static buildTabs() {
        super.TABS.sheet.tabs.push({ id: 'dh', src: 'systems/app-example/assets/logos/FoundryBorneLogoWhite.svg' });
        return super.TABS;
    }

    static TABS = DhSceneConfigSettings.buildTabs();

    async _preRender(context, options) {
        await super._preFirstRender(context, options);

        if (!options.internalRefresh)
            this.appExampleFlag = new game.system.api.data.scenes.DHScene(this.document.flags["app-example"]);
    }

    _attachPartListeners(partId, htmlElement, options) {
        super._attachPartListeners(partId, htmlElement, options);

        switch (partId) {
            case 'dh':
                htmlElement.querySelector('#rangeMeasurementSetting')?.addEventListener('change', async event => {
                    this.appExampleFlag.updateSource({ rangeMeasurement: { setting: event.target.value } });
                    this.render({ internalRefresh: true });
                });

                const dragArea = htmlElement.querySelector('.scene-environments');
                if (dragArea) dragArea.ondrop = this._onDrop.bind(this);

                break;
        }
    }

    async _onDrop(event) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await foundry.utils.fromUuid(data.uuid);
        if (item instanceof game.system.api.documents.DhpActor && item.type === 'environment') {
            let sceneUuid = data.uuid;
            if (item.pack) {
                const inWorldActor = await game.system.api.documents.DhpActor.create([item.toObject()]);
                if (!inWorldActor.length) return;
                sceneUuid = inWorldActor[0].uuid;
            }

            await this.appExampleFlag.updateSource({
                sceneEnvironments: [...this.appExampleFlag.sceneEnvironments, sceneUuid]
            });
            this.render({ internalRefresh: true });
        }
    }

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        switch (partId) {
            case 'dh':
                context.data = this.appExampleFlag;
                context.variantRules = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.variantRules);
                break;
        }

        return context;
    }

    static async #removeSceneEnvironment(_event, button) {
        await this.appExampleFlag.updateSource({
            sceneEnvironments: this.appExampleFlag.sceneEnvironments.filter(
                (_, index) => index !== Number.parseInt(button.dataset.index)
            )
        });
        this.render({ internalRefresh: true });
    }

    /** @override */
    async _processSubmitData(event, form, submitData, options) {
        if (!submitData.flags) submitData.flags = {};
        submitData.flags["app-example"] = foundry.utils.mergeObject(
            this.appExampleFlag.toObject(),
            submitData.flags["app-example"]
        );
        submitData.flags["app-example"].sceneEnvironments = submitData.flags["app-example"].sceneEnvironments.filter(x =>
            foundry.utils.fromUuidSync(x)
        );

        for (const key of Object.keys(this.document._source.flags["app-example"]?.sceneEnvironments ?? {})) {
            if (!submitData.flags["app-example"].sceneEnvironments[key]) {
                submitData.flags["app-example"].sceneEnvironments[`-=${key}`] = null;
            }
        }

        super._processSubmitData(event, form, submitData, options);
    }
}
