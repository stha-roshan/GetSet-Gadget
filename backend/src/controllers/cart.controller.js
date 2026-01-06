// controllers/cart.controller.js
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const MODULE = "[CART] [cart.controller.js]";

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate('items.productId', 'name price image');
  
  if (!cart) {
    return res.status(200).json(new ApiResponse(200, "Cart is empty", { items: [] }, MODULE));
  }
  
  return res.status(200).json(new ApiResponse(200, "Cart fetched successfully", cart, MODULE));
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  // Validate product exists and get current price
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found", MODULE);
  }
  
  // Check stock availability
  if (product.stock < quantity) {
    throw new ApiError(400, "Insufficient stock", MODULE);
  }
  
  let cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      userId: req.user._id,
      items: [{
        productId,
        quantity,
        priceAtAdd: product.price
      }]
    });
  } else {
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Replace quantity (not add to it)
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        priceAtAdd: product.price
      });
    }
    
    await cart.save();
  }
  
  await cart.populate('items.productId', 'name price image');
  
  return res.status(200).json(new ApiResponse(200, "Item added to cart", cart, MODULE));
});

// Update item quantity
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1", MODULE);
  }
  
  const cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    throw new ApiError(404, "Cart not found", MODULE);
  }
  
  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );
  
  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart", MODULE);
  }
  
  // Check stock
  const product = await Product.findById(productId);
  if (product.stock < quantity) {
    throw new ApiError(400, "Insufficient stock", MODULE);
  }
  
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.productId', 'name price image');
  
  return res.status(200).json(new ApiResponse(200, "Cart updated successfully", cart, MODULE));
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    throw new ApiError(404, "Cart not found", MODULE);
  }
  
  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );
  
  await cart.save();
  await cart.populate('items.productId', 'name price image');
  
  return res.status(200).json(new ApiResponse(200, "Item removed from cart", cart, MODULE));
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  return res.status(200).json(new ApiResponse(200, "Cart cleared successfully", {}, MODULE));
});

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };