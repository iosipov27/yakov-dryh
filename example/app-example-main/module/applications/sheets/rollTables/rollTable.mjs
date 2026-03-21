export default class DhRollTableSheet extends foundry.applications.sheets.RollTableSheet {
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        actions: {
            changeMode: DhRollTableSheet.#onChangeMode,
            drawResult: DhRollTableSheet.#onDrawResult,
            resetResults: DhRollTableSheet.#onResetResults,
            addFormula: DhRollTableSheet.#addFormula,
            removeFormula: DhRollTableSheet.#removeFormula
        }
    };

    static buildParts() {
        const { footer, header, sheet, results, ...parts } = super.PARTS;
        return {
            sheet: {
                ...sheet,
                template: 'systems/app-example/templates/sheets/rollTable/sheet.hbs'
            },
            header: { template: 'systems/app-example/templates/sheets/rollTable/header.hbs' },
            ...parts,
            results: {
                template: 'systems/app-example/templates/sheets/rollTable/results.hbs',
                templates: ['templates/sheets/roll-table/result-details.hbs'],
                scrollable: ['table[data-results] tbody']
            },
            summary: { template: 'systems/app-example/templates/sheets/rollTable/summary.hbs' },
            footer
        };
    }

    static PARTS = DhRollTableSheet.buildParts();

    async _preRender(context, options) {
        await super._preRender(context, options);

        if (!options.internalRefresh)
            this.appExampleFlag = new game.system.api.data.DhRollTable(this.document.flags["app-example"]);
    }

    /* root PART has a blank element on _attachPartListeners, so it cannot be used to set the eventListeners for the view mode */
    async _onRender(context, options) {
        super._onRender(context, options);

        for (const element of this.element.querySelectorAll('.system-update-field'))
            element.addEventListener('change', this.updateSystemField.bind(this));
    }

    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);

        switch (partId) {
            case 'sheet':
                context.altFormula = this.appExampleFlag.altFormula;
                context.usesAltFormula = Object.keys(this.appExampleFlag.altFormula).length > 0;
                context.altFormulaOptions = {
                    '': { name: this.appExampleFlag.formulaName },
                    ...this.appExampleFlag.altFormula
                };
                context.activeAltFormula = this.appExampleFlag.activeAltFormula;
                context.selectedFormula = this.appExampleFlag.getActiveFormula(this.document.formula);
                context.results = this.getExtendedResults(context.results);
                break;
            case 'header':
                context.altFormula = this.appExampleFlag.altFormula;
                context.usesAltFormula = Object.keys(this.appExampleFlag.altFormula).length > 0;
                context.altFormulaOptions = {
                    '': { name: this.appExampleFlag.formulaName },
                    ...this.appExampleFlag.altFormula
                };
                context.activeAltFormula = this.appExampleFlag.activeAltFormula;
                break;
            case 'summary':
                context.systemFields = this.appExampleFlag.schema.fields;
                context.altFormula = this.appExampleFlag.altFormula;
                context.formulaName = this.appExampleFlag.formulaName;
                break;
            case 'results':
                context.results = this.getExtendedResults(context.results);
                break;
        }

        return context;
    }

    getExtendedResults(results) {
        const bodyDarkMode = document.body.classList.contains('theme-dark');
        const elementLightMode = this.element.classList.contains('theme-light');
        const elementDarkMode = this.element.classList.contains('theme-dark');
        const isDarkMode = elementDarkMode || (!elementLightMode && bodyDarkMode);

        return results.map(x => ({
            ...x,
            displayImg: isDarkMode && x.img === 'icons/svg/d20-black.svg' ? 'icons/svg/d20.svg' : x.img
        }));
    }

    /* -------------------------------------------- */
    /*  Flag SystemData update methods              */
    /* -------------------------------------------- */

    async updateSystemField(event) {
        const { dataset, value } = event.target;
        await this.appExampleFlag.updateSource({ [dataset.path]: value });
        this.render({ internalRefresh: true });
    }

    getSystemFlagUpdate() {
        const deleteUpdate = Object.keys(this.document._source.flags["app-example"]?.altFormula ?? {}).reduce(
            (acc, formulaKey) => {
                if (!this.appExampleFlag.altFormula[formulaKey]) acc.altFormula[`-=${formulaKey}`] = null;

                return acc;
            },
            { altFormula: {} }
        );

        return { 'flags.app-example': foundry.utils.mergeObject(this.appExampleFlag.toObject(), deleteUpdate) };
    }

    static async #addFormula() {
        await this.appExampleFlag.updateSource({
            [`altFormula.${foundry.utils.randomID()}`]: game.system.api.data.DhRollTable.getDefaultFormula()
        });
        this.render({ internalRefresh: true });
    }

    static async #removeFormula(_event, target) {
        await this.appExampleFlag.updateSource({
            [`altFormula.-=${target.dataset.key}`]: null
        });
        this.render({ internalRefresh: true });
    }

    /* -------------------------------------------- */
    /*  Extended RollTable methods                  */
    /* -------------------------------------------- */

    /**
     * Alternate between view and edit modes.
     * @this {RollTableSheet}
     * @type {ApplicationClickAction}
     */
    static async #onChangeMode() {
        this.mode = this.isEditMode ? 'view' : 'edit';
        await this.document.update(this.getSystemFlagUpdate());
        await this.render({ internalRefresh: true });
    }

    /** @inheritdoc */
    async _processSubmitData(event, form, submitData, options) {
        /* RollTable sends an empty dummy event when swapping from view/edit first time */
        if (Object.keys(submitData).length) {
            if (!submitData.flags) submitData.flags = { "app-example": {} };
            submitData.flags["app-example"] = this.getSystemFlagUpdate();
        }

        super._processSubmitData(event, form, submitData, options);
    }

    /** @inheritdoc */
    static async #onResetResults() {
        await this.document.update(this.getSystemFlagUpdate());
        await this.document.resetResults();
    }

    /**
     * Roll and draw a TableResult.
     * @this {RollTableSheet}
     * @type {ApplicationClickAction}
     */
    static async #onDrawResult(_event, button) {
        if (this.form) await this.submit({ operation: { render: false } });
        button.disabled = true;
        const table = this.document;

        await this.document.update(this.getSystemFlagUpdate());

        /* Sending in the currently selectd activeFormula to table.roll to use as the formula */
        const selectedFormula = this.appExampleFlag.getActiveFormula(this.document.formula);
        const tableRoll = await table.roll({ selectedFormula });
        const draws = table.getResultsForRoll(tableRoll.roll.total);
        if (draws.length > 0) {
            if (game.settings.get('core', 'animateRollTable')) await this._animateRoll(draws);
            await table.draw(tableRoll);
        }

        // Reenable the button if drawing with replacement since the draw won't trigger a sheet re-render
        if (table.replacement) button.disabled = false;
    }
}
