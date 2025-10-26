const nameRegex = /^[A-Za-z\s'-]+$/;
const phoneNumberRegex = /^(98|97)[0-9]{8}$/;
const addressLineRegex = /^[a-zA-Z0-9\s,.\-#/]+$/;
const landmarkRegex = /^[a-zA-Z0-9\s,.\-()]+$/;
const city_state_countryRegex = /^[a-zA-Z\s.\-]+$/;
const postalCodeRegex = /^[a-zA-Z0-9\s\-]{3,10}$/;

export const validateAddressFields = (fields) => {
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
  } = fields;

  if (
    !recipientName ||
    !phoneNumber ||
    !addressLine ||
    !city ||
    !state ||
    !postalCode
  ) {
    return {
      isValid: false,
      message: "Missing required fields",
      errors: {
        recipientName: !recipientName
          ? "Recipient name is required"
          : undefined,
        phoneNumber: !phoneNumber ? "Phone number is required" : undefined,
        addressLine: !addressLine ? "Address line is required" : undefined,
        city: !city ? "City is required" : undefined,
        state: !state ? "State is required" : undefined,
        postalCode: !postalCode ? "Postal code is required" : undefined,
      },
    };
  }

  // Recipient Name validations
  if (recipientName.trim().length < 2) {
    return {
      isValid: false,
      message: "Recipient name must be at least 2 characters long",
    };
  }
  if (recipientName.trim().length > 50) {
    return {
      isValid: false,
      message: "Recipient name cannot exceed 50 characters",
    };
  }
  if (!nameRegex.test(recipientName.trim())) {
    return {
      isValid: false,
      message:
        "Recipient name can only contain letters, spaces, hyphens and apostrophes",
    };
  }

  // Phone Number validation
  if (!phoneNumberRegex.test(phoneNumber.trim())) {
    return {
      isValid: false,
      message:
        "Phone number must be 10 digits starting with 98 or 97 (e.g., 9812345678)",
    };
  }

  // Label validation
  if (label && !["Home", "Office", "Other"].includes(label)) {
    return {
      isValid: false,
      message: "Label must be either 'Home', 'Office', or 'Other'",
    };
  }

  // Address Line validations
  if (addressLine.trim().length < 5) {
    return {
      isValid: false,
      message: "Address line must be at least 5 characters long",
    };
  }
  if (addressLine.trim().length > 100) {
    return {
      isValid: false,
      message: "Address line cannot exceed 100 characters",
    };
  }
  if (!addressLineRegex.test(addressLine.trim())) {
    return {
      isValid: false,
      message: "Address line contains invalid characters",
    };
  }

  // Landmark validation (optional)
  if (landmark) {
    if (landmark.trim().length > 100) {
      return {
        isValid: false,
        message: "Landmark cannot exceed 100 characters",
      };
    }
    if (!landmarkRegex.test(landmark.trim())) {
      return {
        isValid: false,
        message: "Landmark contains invalid characters",
      };
    }
  }

  // City validations
  if (city.trim().length < 2) {
    return {
      isValid: false,
      message: "City must be at least 2 characters long",
    };
  }
  if (city.trim().length > 50) {
    return {
      isValid: false,
      message: "City cannot exceed 50 characters",
    };
  }
  if (!city_state_countryRegex.test(city.trim())) {
    return {
      isValid: false,
      message: "City name can only contain letters, spaces, dots and hyphens",
    };
  }

  // State validations
  if (state.trim().length < 2) {
    return {
      isValid: false,
      message: "State must be at least 2 characters long",
    };
  }
  if (state.trim().length > 50) {
    return {
      isValid: false,
      message: "State cannot exceed 50 characters",
    };
  }
  if (!city_state_countryRegex.test(state.trim())) {
    return {
      isValid: false,
      message: "State can only contain letters, spaces, dots and hyphens",
    };
  }

  // Postal Code validation
  if (!postalCodeRegex.test(postalCode.trim())) {
    return {
      isValid: false,
      message: "Please enter a valid postal code (e.g., 44200)",
    };
  }

  // Country validation (optional)
  if (country) {
    if (country.trim().length < 2) {
      return {
        isValid: false,
        message: "Country must be at least 2 characters long",
      };
    }
    if (country.trim().length > 50) {
      return {
        isValid: false,
        message: "Country cannot exceed 50 characters",
      };
    }
    if (!city_state_countryRegex.test(country.trim())) {
      return {
        isValid: false,
        message: "Country can only contain letters, spaces, dots and hyphens",
      };
    }
  }

  // All validations passed
  return {
    isValid: true,
  };
};
