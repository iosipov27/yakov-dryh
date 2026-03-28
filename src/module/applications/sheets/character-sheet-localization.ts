export function localize(key: string, fallback: string): string {
  const localizedValue = game.i18n?.localize(key) ?? key;

  return localizedValue === key ? fallback : localizedValue;
}

export function formatLocalization(
  key: string,
  data: Record<string, string | number>,
  fallback: string
): string {
  const formatData = Object.fromEntries(
    Object.entries(data).map(([entryKey, value]) => [entryKey, String(value)])
  );
  const localizedValue = game.i18n?.format(key, formatData) ?? key;

  return localizedValue === key ? fallback : localizedValue;
}

export function localizeActorType(actorType: string): string {
  const localizationKey = `TYPES.Actor.${actorType}`;
  const localizedActorType = game.i18n?.localize(localizationKey) ?? localizationKey;

  return localizedActorType === localizationKey ? actorType : localizedActorType;
}
