export const coerceToArray = data => {
  if (data === null || typeof data === 'undefined') {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
};
