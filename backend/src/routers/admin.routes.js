import { Router } from "express";
import multer from "multer";
import { registerAdmin, loginAdmin } from "../controllers/admin.controller.js";

const router = Router();
const upload = multer();

router.post("/register", upload.none(), registerAdmin);
router.post("/login", upload.none(), loginAdmin);

export default router;