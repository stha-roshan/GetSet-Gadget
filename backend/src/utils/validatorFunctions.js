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