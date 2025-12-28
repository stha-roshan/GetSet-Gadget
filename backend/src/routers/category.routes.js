import { Router } from "express";
import multer from "multer";
import { createCategory, categoryList } from "../controllers/category.controller.js";

const router = Router();
const upload = multer();

router.post("/create-category", upload.none(), createCategory);

router.get("/category-list", categoryList)

export default router;
