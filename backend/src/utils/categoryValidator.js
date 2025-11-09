const REGEX = {
    description: /^[A-Za-z0-9\s.,!@#%&()'":;\/\-]{10,500}$/,
}

export const isValidDescription = (description) => {
  if (!description || typeof description !== "string") return false;
  const trimmed = description.trim();
  return (
    trimmed.length >= 10 && trimmed.length <= 500 && REGEX.description.test(trimmed)
  );
};