import { Router } from "express";
import multer from "multer";
import { createCategory } from "../controllers/category.controller.js";

const router = Router();
const upload = multer();

router.post("/create", upload.none(), createCategory);

export default router;
