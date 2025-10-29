import { Category } from "../models/category.model.js";

const MODULE = "[CATEGORY] [category.controller.js]";
const nameRegex = /^[A-Za-z\s'-]+$/;

const createCategory = async (req, res) => {
  let validationErrors = [];
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} createCategory`,
        message: "Name and description are required",
      });
    }

    if (name.trim().length < 2) {
      validationErrors.push("Category name must be at least 2 characters long");
    }
    if (!nameRegex.test(name.trim())) {
      validationErrors.push(
        "Category name can only contain letters, spaces, hyphens and apostrophes"
      );
    }

    if (description.trim().length < 2) {
      validationErrors.push("Description must be at least 2 characters long");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} createCategory`,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      description: description.trim(),
    });

    if (!newCategory) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        module: `${MODULE} createCategory`,
        message:
          "Something went wrong while creating category. Please try again later.",
      });
    }

    return res.status(201).json({
      success: true,
      statusCode: 201,
      module: `${MODULE} createCategory`,
      message: "Category created successfully!",
      category: newCategory,
    });
  } catch (error) {
    console.error(`${MODULE} Error:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Category. Please try again.",
    });
  }
};

export { createCategory };
