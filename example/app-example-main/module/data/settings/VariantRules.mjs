export default class DhVariantRules extends foundry.abstract.DataModel {
    static LOCALIZATION_PREFIXES = ['APP_EXAMPLE.SETTINGS.VariantRules'];

    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            actionTokens: new fields.SchemaField({
                enabled: new fields.BooleanField({
                    required: true,
                    initial: false,
                    label: 'APP_EXAMPLE.SETTINGS.VariantRules.FIELDS.actionTokens.enabled.label'
                }),
                tokens: new fields.NumberField({
                    required: true,
                    integer: true,
                    initial: 3,
                    label: 'APP_EXAMPLE.SETTINGS.VariantRules.FIELDS.actionTokens.tokens.label'
                })
            }),
            rangeMeasurement: new fields.SchemaField({
                enabled: new fields.BooleanField({
                    required: true,
                    initial: true,
                    label: 'APP_EXAMPLE.GENERAL.enabled'
                }),
                melee: new fields.NumberField({
                    required: true,
                    initial: 5,
                    label: 'APP_EXAMPLE.CONFIG.Range.melee.name'
                }),
                veryClose: new fields.NumberField({
                    required: true,
                    initial: 15,
                    label: 'APP_EXAMPLE.CONFIG.Range.veryClose.name'
                }),
                close: new fields.NumberField({
                    required: true,
                    initial: 30,
                    label: 'APP_EXAMPLE.CONFIG.Range.close.name'
                }),
                far: new fields.NumberField({ required: true, initial: 60, label: 'APP_EXAMPLE.CONFIG.Range.far.name' })
            }),
            massiveDamage: new fields.SchemaField({
                enabled: new fields.BooleanField({
                    required: true,
                    initial: false,
                    label: 'APP_EXAMPLE.SETTINGS.VariantRules.FIELDS.massiveDamage.enabled.label'
                })
            })
        };
    }
}
