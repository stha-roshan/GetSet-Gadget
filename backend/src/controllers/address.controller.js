import { Address } from "../models/address.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { buildAddressValidations } from "../utils/addressValidator.js";

const MODULE = "[ADDRESS] [address.controller.js]";
const createAddress = asyncHandler(async (req, res) => {
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

  const validations = buildAddressValidations(req.body);

  const validation = validateFields(validations);

  if (!validation.isValid) {
    throw new ApiError(
      400,
      "Address Validation Error",
      MODULE,
      validation.errors
    );
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

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Address created successfully", newAddress, MODULE)
    );
});

const editAddress = asyncHandler(async (req, res) => {
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

  const validations = buildAddressValidations(req.body);

  const validation = validateFields(validations);

  if (!validation.isValid) {
    throw new ApiError(
      400,
      "Address Validation Error",
      MODULE,
      validation.errors
    );
  }

  const existingAddress = await Address.findOne({
    _id: addressId,
    user: user,
  });

  if (!existingAddress) {
    throw new ApiError(
      404,
      "Address not found or you don't have permission to edit it",
      MODULE
    );
  }

  const updateData = {
    recipientName: recipientName.trim(),
    phoneNumber: phoneNumber.trim(),
    label: label ? label.trim() : "Home",
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
    throw new ApiError(
      500,
      "Something went wrong while updating Address.",
      MODULE
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Address updated successfully",
        updatedAddress,
        MODULE
      )
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  if (!addressId) {
    throw new ApiError(400, "Address ID is required", MODULE);
  }

  const deletedAddress = await Address.findOneAndDelete({
    _id: addressId,
    user: userId,
  });

  if (!deletedAddress) {
    throw new ApiError(404, "Address not found", MODULE);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Address deleted successfully", null, MODULE));
});

export { createAddress, editAddress, deleteAddress };
