import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { buildProductValidation } from "../utils/productValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  const { name, description, category, brand, price, stock, totalSales } =
    req.body;

  const image = req.file.path;

  const signedImage = await uploadOnCloudinary(image);
  if (!signedImage) {
    throw new ApiError(500, "Product image upload failed", MODULE);
  }
  const signedImageUrl = signedImage.secure_url;

  const newProduct = await Product.create({
    name: name.trim(),
    description: description.trim(),
    category: category,
    brand: brand,
    price: Number(price),
    stock: Number(stock),
    image: signedImageUrl,
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

  const signedImage = await uploadOnCloudinary(image);
  console.log(image);
  if (!signedImage) {
    throw new ApiError(500, "Product image upload failed", MODULE);
  }
  const signedImageUrl = signedImage.secure_url;

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined) updateData.category = category;
  if (brand !== undefined) updateData.brand = brand;
  if (price !== undefined) updateData.price = Number(price);
  if (stock !== undefined) updateData.stock = Number(stock);
  if (image !== undefined) updateData.image = signedImageUrl;
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

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format", MODULE);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found", MODULE);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Product fetched successfully", product, MODULE)
    );
});

export { createProduct, editProduct, getProductById };
