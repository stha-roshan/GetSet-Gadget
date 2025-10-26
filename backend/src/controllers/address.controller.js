import { Address } from "../models/address.model.js";
import { validateAddressFields } from "../utils/addressValidator.js";

const MODULE = "[ADDRESS] [address.controller.js]";

const createAddress = async (req, res) => {
  try {
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
      isDefault,
    } = req.body;

    const user = req.user._id;

    const validation = validateAddressFields({
      recipientName,
      phoneNumber,
      label,
      addressLine,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const newAddress = await Address.create({
      user,
      recipientName: recipientName.trim(),
      phoneNumber: phoneNumber.trim(),
      label: label || "Home",
      addressLine: addressLine.trim(),
      landmark: landmark ? landmark.trim() : undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country ? country.trim() : "Nepal",
      isDefault: isDefault || false,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error(`${MODULE} Error:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to create address. Please try again.",
    });
  }
};

export { createAddress };
