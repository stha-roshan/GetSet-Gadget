export const REGEX = {
  name: /^[A-Za-z0-9\s'’"(),.-]{2,100}$/,
  description: /^[A-Za-z0-9\s.,'"!?:;()%&/\-+]{10,500}$/,
};

export const isValidName = (name) => {
     if (!name || typeof name !== "string") return false;
      return REGEX.name.test(name.trim());
}

export const isValidDescription = (description) => {
  if (!description || typeof description !== "string") return false;
  return REGEX.description.test(description.trim());
};

export const isValidImage = (image) => {
  if (!image || typeof image !== "string") return false;
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return urlRegex.test(image.trim()) || base64Regex.test(image);
};