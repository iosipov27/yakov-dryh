export default class DhMetagaming extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            hideObserverPermissionInChat: new fields.BooleanField({
                initial: false,
                label: 'APP_EXAMPLE.SETTINGS.Metagaming.FIELDS.hideObserverPermissionInChat.label',
                hint: 'APP_EXAMPLE.SETTINGS.Metagaming.FIELDS.hideObserverPermissionInChat.hint'
            })
        };
    }
}
