export const recurStripNullValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(recurStripNullValues);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        recurStripNullValues(value),
      ]),
    );
  }
  if (value instanceof Date) {
    return value;
  }
  if (value !== null) {
    return value;
  }
};
