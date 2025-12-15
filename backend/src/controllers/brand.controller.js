import { Brand } from "../models/brand.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  isValidName,
  isValidDescription,
  isValidImage,
} from "../utils/brandValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";

const MODULE = "[BRAND] [brand.controller.js]";

const createBrand = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const validation = validateFields([
    {
      value: name,
      field: "name",
      validator: isValidName,
      message:
        "Brand name must be 2-50 characters and contain only letters, spaces, apostrophes, and hyphens",
    },

    {
      value: description,
      field: "description",
      validator: isValidDescription,
      message:
        "Description must be 10-500 characters long and contain only letters, numbers, spaces, and common punctuation (e.g., . , ! @ # % & ( ) ' \" : ; / -).",
    },

    {
      value: image,
      field: "image",
      validator: isValidImage,
      message: "Invalid image format",
    },
  ]);

  if (!validation.isValid) {
    throw new ApiError(400, "Validation failed", MODULE, validation.errors);
  }

  const existingBrand = await Brand.findOne({ name: name.trim() });
  if (existingBrand) {
    throw new ApiError(409, "Brand with this name already exists", MODULE);
  }

  const newBrand = await Brand.create({
    name: name.trim(),
    description: description.trim(),
    image,
  });

  if (!newBrand) {
    throw new ApiError(
      500,
      "Something went wrong while creating brand",
      MODULE
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Brand created successfully", newBrand));
});

export { createBrand };
