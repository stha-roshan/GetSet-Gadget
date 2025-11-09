export const REGEX = {
  email: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[A-Za-z\s'-]+$/,
  phoneNumber: /^(98|97)[0-9]{8}$/,
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return REGEX.email.test(email.trim());
};

export const isValidName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return (
    trimmed.length >= 2 && trimmed.length <= 50 && REGEX.name.test(trimmed)
  );
};

export const isValidPhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  return REGEX.phoneNumber.test(phone.trim());
};

export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 8;
};

export const validateField = (value, fieldName, validator, errorMessage) => {
  if (!validator(value)) {
    return { isValid: false, field: fieldName, message: errorMessage };
  }
  return { isValid: true };
};

export const validateFields = (validations) => {
  const errors = [];

  for (const validation of validations) {
    const result = validateField(
      validation.value,
      validation.field,
      validation.validator,
      validation.message
    );

    if (!result.isValid) {
      errors.push(result.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length === 0 ? null : errors,
  };
};
