import { ResourcesField } from '../fields/actorField.mjs';
import BaseDataActor from './base.mjs';

export default class DhCreature extends BaseDataActor {
    /**@inheritdoc */
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            ...super.defineSchema(),
            resources: new ResourcesField(this.metadata.type),
            advantageSources: new fields.ArrayField(new fields.StringField(), {
                label: 'APP_EXAMPLE.ACTORS.Character.advantageSources.label',
                hint: 'APP_EXAMPLE.ACTORS.Character.advantageSources.hint'
            }),
            disadvantageSources: new fields.ArrayField(new fields.StringField(), {
                label: 'APP_EXAMPLE.ACTORS.Character.disadvantageSources.label',
                hint: 'APP_EXAMPLE.ACTORS.Character.disadvantageSources.hint'
            })
        };
    }

    get isAutoVulnerableActive() {
        const vulnerableAppliedByOther = this.parent.effects.some(
            x => x.statuses.has('vulnerable') && !x.flags["app-example"]?.autoApplyFlagId
        );
        return !vulnerableAppliedByOther;
    }

    async _preUpdate(changes, options, userId) {
        const allowed = await super._preUpdate(changes, options, userId);
        if (allowed === false) return;

        const automationSettings = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Automation);
        if (
            automationSettings.vulnerableAutomation &&
            this.parent.type !== 'companion' &&
            changes.system?.resources?.stress?.value
        ) {
            const { name, description, img, autoApplyFlagId } = CONFIG.DH.GENERAL.conditions().vulnerable;
            const autoEffects = this.parent.effects.filter(
                x => x.flags["app-example"]?.autoApplyFlagId === autoApplyFlagId
            );
            if (changes.system.resources.stress.value >= this.resources.stress.max) {
                if (!autoEffects.length)
                    this.parent.createEmbeddedDocuments('ActiveEffect', [
                        {
                            name: game.i18n.localize(name),
                            description: game.i18n.localize(description),
                            img: img,
                            statuses: ['vulnerable'],
                            flags: { "app-example": { autoApplyFlagId } }
                        }
                    ]);
            } else if (this.resources.stress.value >= this.resources.stress.max) {
                this.parent.deleteEmbeddedDocuments(
                    'ActiveEffect',
                    autoEffects.map(x => x.id)
                );
            }
        }
    }
}
