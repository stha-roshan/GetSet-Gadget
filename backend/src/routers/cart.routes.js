// routes/cart.routes.js
import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer()

// All cart routes require authentication
router.use(verifyUser);

// Get user's cart
router.get("/", getCart);

// Add item to cart
router.post("/add",upload.none(), addToCart);

// Update item quantity
router.put("/update", updateCartItem);

// Remove item from cart
router.delete("/remove/:productId", removeFromCart);

// Clear entire cart (typically called after order completion)
router.delete("/clear", clearCart);

export default router;