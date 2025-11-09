import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidName } from "../utils/generalValidators.js";
import { isValidDescription } from "../utils/categoryValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";

const MODULE = "[CATEGORY] [category.controller.js]";
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const validation = validateFields([
    {
      value: name,
      field: "name",
      validator: isValidName,
      message:
        "Category name must be 2-50 characters and contain only letters, spaces, apostrophes, and hyphens",
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

  const newCategory = await Category.create({
    name: name.trim(),
    description: description.trim(),
  });

  if (!newCategory) {
    throw new ApiError(
      500,
      "Something went wrong while creating category. Please try again later.",
      MODULE
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Category created successfully", newCategory, MODULE)
    );
});

export { createCategory };
