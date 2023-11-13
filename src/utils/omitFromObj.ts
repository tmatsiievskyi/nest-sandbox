export const omit = (keys: string[], obj: object) => {
  const exclude = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter((e) => !exclude.has(e[0])),
  );
};
