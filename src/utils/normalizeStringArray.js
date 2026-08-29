export const normalizeStringArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of strings`);
  }

  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
};
