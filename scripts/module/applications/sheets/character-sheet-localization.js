export function localize(key, fallback) {
    const localizedValue = game.i18n?.localize(key) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
export function formatLocalization(key, data, fallback) {
    const formatData = Object.fromEntries(Object.entries(data).map(([entryKey, value]) => [entryKey, String(value)]));
    const localizedValue = game.i18n?.format(key, formatData) ?? key;
    return localizedValue === key ? fallback : localizedValue;
}
export function localizeActorType(actorType) {
    const localizationKey = `TYPES.Actor.${actorType}`;
    const localizedActorType = game.i18n?.localize(localizationKey) ?? localizationKey;
    return localizedActorType === localizationKey ? actorType : localizedActorType;
}
//# sourceMappingURL=character-sheet-localization.js.map