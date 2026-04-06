import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { buildProductValidation } from "../utils/productValidator.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const MODULE = "[PRODUCT] [product.controller.js]";

const createProduct = asyncHandler(async (req, res) => {
  const validations = buildProductValidation(req.body);
  const validation = validateFields(validations);

  if (!validation.isValid) {
    throw new ApiError(
      400,
      "Product Validation error",
      MODULE,
      validation.errors,
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
      new ApiResponse(201, "product created successfully", newProduct, MODULE),
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
    throw new ApiError(400, "Edit Product Validation error", MODULE, validation.errors);
  }

  const { name, description, category, brand, price, stock, totalSales } = req.body;

  const updateData = {};
  if (name !== undefined)        updateData.name = name.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined)    updateData.category = category;
  if (brand !== undefined)       updateData.brand = brand;
  if (price !== undefined)       updateData.price = Number(price);
  if (stock !== undefined)       updateData.stock = Number(stock);
  if (totalSales !== undefined)  updateData.totalSales = Number(totalSales);

  // Only upload image if a new file was actually sent
  if (req.file) {
    const signedImage = await uploadOnCloudinary(req.file.path);
    if (!signedImage) {
      throw new ApiError(500, "Product image upload failed", MODULE);
    }
    updateData.image = signedImage.secure_url;
  }

  const updateProduct = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Product data updated successfully", updateProduct, MODULE));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format", MODULE);
  }

  const product = await Product.findById(productId)
    .populate("category", "name description")
    .populate("brand", "name description ");

  if (!product) {
    throw new ApiError(404, "Product not found", MODULE);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Product fetched successfully", product, MODULE),
    );
});

const fetchAllProduct = asyncHandler(async (req, res) => {
  const allProducts = await Product.find()
    .populate("category", "name description")
    .populate("brand", "name description ");

  if (allProducts.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No products found", []));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully", allProducts));
});

const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  // console.log("Received search query:", q);
  // console.log("Limit:", limit);

  if (!q || q.trim().length < 2) {
    throw new ApiError(
      400,
      "Search query must be at least 2 characters long",
      MODULE,
    );
  }

  const searchQuery = q.trim();

  const searchFilter = {
    $or: [{ name: { $regex: searchQuery, $options: "i" } }],
    stock: { $gt: 0 },
  };

  const suggestions = await Product.find(searchFilter)
    .select("name category image price brand stock")
    .populate("category", "name")
    .limit(parseInt(limit) || 5);

  if (!suggestions) {
    throw new ApiError(500, "Error fetching search suggestions", MODULE);
  }

  if (suggestions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No matching products found", []));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Search suggestions fetched successfully",
        suggestions,
      ),
    );
});

const getSimilarProducts = asyncHandler(async (req, res) => {
  const { categoryId, excludeId, limit = 6 } = req.query;

  // Validation
  if (!categoryId) {
    return res.status(400).json(
      new ApiResponse(400, "Category ID is required", null)
    );
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json(
      new ApiResponse(400, "Invalid category ID format", null)
    );
  }

  const query = { category: categoryId };
  
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: excludeId };
  }

  const similarProducts = await Product.find(query)
    .populate("category", "name")
    .populate("brand", "name")
    .limit(parseInt(limit));
  
  return res.status(200).json(
    new ApiResponse(200, "Similar products fetched successfully", similarProducts)
  );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid product ID format", MODULE);
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(404, "Product not found", MODULE);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully", product, MODULE));
});

const getBestSellers = asyncHandler(async (req, res) => {
    const bestSellers = await Product.find()
        .populate("category", "name")
        .populate("brand", "name")
        .sort({ totalSales: -1 })
        .limit(4);

    if (!bestSellers || bestSellers.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No products found", []));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Best sellers fetched successfully", bestSellers));
});

export { createProduct, editProduct, getProductById, fetchAllProduct, searchProducts, getSimilarProducts, deleteProduct, getBestSellers };
