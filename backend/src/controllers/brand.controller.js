import { Brand } from "../models/brand.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidName, isValidDescription } from "../utils/brandValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const MODULE = "[BRAND] [brand.controller.js]";

const createBrand = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image is required", MODULE);
  }

  const { name, description } = req.body;
  const image = req.file.path;

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
  ]);

  if (!validation.isValid) {
    throw new ApiError(400, "Validation failed", MODULE, validation.errors);
  }

  const existingBrand = await Brand.findOne({ name: name.trim() });
  if (existingBrand) {
    throw new ApiError(409, "Brand with this name already exists", MODULE);
  }

  const signedImage = await uploadOnCloudinary(image);
  if (!signedImage) {
    throw new ApiError(500, "Brand image upload failed", MODULE);
  }

  const signedImageUrl = signedImage.secure_url;

  const newBrand = await Brand.create({
    name: name.trim(),
    description: description.trim(),
    image: signedImageUrl,
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

const brandList = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).select("name _id");

  if (!brands) {
    throw new ApiError(500, "Failed to fetch brands", MODULE);
  }

  return res.json(
    new ApiResponse(200, "All Brand fetched successfully", brands)
  );
});
export { createBrand, brandList };
