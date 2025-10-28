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

const editAddress = async (req, res) => {
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
    const { addressId } = req.params;

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
        statusCode: 400,
        module: `${MODULE} editAddress`,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const existingAddress = await Address.findOne({
      _id: addressId,
      user: user,
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        module: `${MODULE} editAddress`,
        message: "Address not found or you don't have permission to edit it",
      });
    }

    const updateData = {
      recipientName: recipientName.trim(),
      phoneNumber: phoneNumber.trim(),
      label: label.trim(),
      addressLine: addressLine.trim(),
      landmark: landmark ? landmark.trim() : undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country ? country.trim() : "Nepal",
      isDefault: isDefault,
    };

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        module: `${MODULE} editAddress`,
        message: "Something went wrong while updating Address.",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      module: `${MODULE} editAddress`,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error(`${MODULE} editAddress Error:`, error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} editAddress`,
      message: "Failed to update address. Please try again.",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} deleteAddress`,
        message: "Address Id is required",
      });
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      user: userId,
    });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        module: `${MODULE} deleteAddress`,
        message: "Address not found.",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      module: `${MODULE} deleteAddress`,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error(`${MODULE} deleteAddress error:`, error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} deleteAddress`,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
export { createAddress, editAddress, deleteAddress };
