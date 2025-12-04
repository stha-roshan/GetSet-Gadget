import { Router } from "express";
import multer from "multer";
import { createProduct, editProduct } from "../controllers/product.controller.js";

const router = Router()
const upload = multer()

router.post("/create", upload.single('image'), createProduct)
router.patch("/edit/:productId", upload.single('image'),editProduct)

export default router