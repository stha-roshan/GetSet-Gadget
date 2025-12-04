import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { buildProductValidation } from "../utils/productValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";

const MODULE = "[PRODUCT] [product.controller.js]";

const createProduct = asyncHandler(async (req, res) => {
  const validations = buildProductValidation(req.body);
  const validation = validateFields(validations);

  if (!validation.isValid) {
    throw new ApiError(
      400,
      "Product Validation error",
      MODULE,
      validation.errors
    );
  }

  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    image,
    totalSales,
  } = req.body;

  const newProduct = await Product.create({
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    brand: brand.trim(),
    price: Number(price),
    stock: Number(stock),
    image: image.trim(),
    totalSales: totalSales ? Number(totalSales) : 0,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "product created successfully", newProduct, MODULE)
    );
});

const editProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format", MODULE);
  }

  const validations = buildProductValidation(req.body);

  const validation = validateFields(validations);
  if (!validation.isValid) {
    throw new ApiError(
      400,
      "Edit Product Validation error",
      MODULE,
      validation.errors
    );
  }

  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    image,
    totalSales,
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined) updateData.category = category.trim();
  if (brand !== undefined) updateData.brand = brand.trim();
  if (price !== undefined) updateData.price = Number(price);
  if (stock !== undefined) updateData.stock = Number(stock);
  if (image !== undefined) updateData.image = image.trim();
  if (totalSales !== undefined) updateData.totalSales = Number(totalSales);

  const updateProduct = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Product data updated successfully",
        updateProduct,
        MODULE
      )
    );
});

export { createProduct, editProduct };
 