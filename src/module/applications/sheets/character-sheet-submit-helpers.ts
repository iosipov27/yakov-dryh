export function normalizeCharacterSheetSubmitData(input: {
  currentName: string | null | undefined;
  submitData: Record<string, unknown>;
}): {
  shouldWarnEmptyName: boolean;
  submitData: Record<string, unknown>;
} {
  const normalizedSubmitData = { ...input.submitData };
  const hasNameUpdate = Object.prototype.hasOwnProperty.call(
    normalizedSubmitData,
    "name"
  );
  const rawName = normalizedSubmitData.name;

  if (!hasNameUpdate) {
    return {
      shouldWarnEmptyName: false,
      submitData: normalizedSubmitData
    };
  }

  if (typeof rawName === "string") {
    const trimmedName = rawName.trim();

    if (trimmedName.length > 0) {
      normalizedSubmitData.name = trimmedName;
      return {
        shouldWarnEmptyName: false,
        submitData: normalizedSubmitData
      };
    }
  }

  const currentName = input.currentName?.trim();

  if (currentName) {
    normalizedSubmitData.name = input.currentName;
  } else {
    delete normalizedSubmitData.name;
  }

  return {
    shouldWarnEmptyName: true,
    submitData: normalizedSubmitData
  };
}
