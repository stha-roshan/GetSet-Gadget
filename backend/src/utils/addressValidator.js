import { isValidName, isValidPhoneNumber } from "./generalValidators.js";

export const REGEX = {
  addressLine: /^[a-zA-Z0-9\s,.\-#/]+$/,
  landmark: /^[a-zA-Z0-9\s,.\-()]+$/,
  cityStateCountry: /^[a-zA-Z\s.\-]+$/,
  postalCode: /^[a-zA-Z0-9\s\-]{3,10}$/,
};

export const isValidAddressLine = (addressLine) => {
  if (!addressLine || typeof addressLine !== "string") return false;

  const trimmed = addressLine.trim();
  if (trimmed.length < 5 || trimmed.length > 100) return false;

  return REGEX.addressLine.test(trimmed);
};

export const isValidLandmark = (landmark) => {
  if (!landmark || landmark.trim() === "") return true;

  if (typeof landmark !== "string") return false;

  const trimmed = landmark.trim();

  if (trimmed.length > 100) return false;

  return REGEX.landmark.test(trimmed);
};

export const isValidCityStateCountry = (value) => {
  if (!value || typeof value !== "string") return false;

  const trimmed = value.trim();

  if (trimmed.length < 2 || trimmed.length > 50) return false;

  return REGEX.cityStateCountry.test(trimmed);
};

export const isValidPostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== "string") return false;

  const trimmed = postalCode.trim();

  return REGEX.postalCode.test(trimmed);
};

export const isValidLabel = (label) => {
  const validLabels = ["Home", "Office", "Other"];
  return validLabels.includes(label);
};

export const buildAddressValidations = (data) => {
  const {
    recipientName,
    phoneNumber,
    label,
    addressLine,
    landmark,
    city,
    state,
    postalCode,
    country,
  } = data;

  const validations = [
    {
      value: recipientName,
      field: "recipientName",
      validator: isValidName,
      message:
        "Recipient name must be 2-50 characters and contain only letters, spaces, apostrophes, and hyphens",
    },
    {
      value: phoneNumber,
      field: "phoneNumber",
      validator: isValidPhoneNumber,
      message: "Phone number must be 10 digits starting with 97 or 98",
    },
    {
      value: addressLine,
      field: "addressLine",
      validator: isValidAddressLine,
      message:
        "Address line must be 5-100 characters and contain only letters, numbers, spaces, and common characters (. , - # /)",
    },
    {
      value: city,
      field: "city",
      validator: isValidCityStateCountry,
      message:
        "City must be 2-50 characters and contain only letters, spaces, dots, and hyphens",
    },
    {
      value: state,
      field: "state",
      validator: isValidCityStateCountry,
      message:
        "State must be 2-50 characters and contain only letters, spaces, dots, and hyphens",
    },
    {
      value: postalCode,
      field: "postalCode",
      validator: isValidPostalCode,
      message: "Postal code must be 3-10 characters",
    },
    {
      value: country,
      field: "country",
      validator: isValidCityStateCountry,
      message:
        "Country must be 2-50 characters and contain only letters, spaces, dots, and hyphens",
    },
  ];

  if (label) {
    validations.push({
      value: label,
      field: "label",
      validator: isValidLabel,
      message: "Label must be either 'Home', 'Office', or 'Other'",
    });
  }

  if (landmark) {
    validations.push({
      value: landmark,
      field: "landmark",
      validator: isValidLandmark,
      message:
        "Landmark must be 1-100 characters and contain only letters, numbers, spaces, and common punctuation",
    });
  }

  return validations;
};
