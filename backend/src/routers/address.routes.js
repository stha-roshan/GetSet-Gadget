import { Router } from "express";
import multer from "multer";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { createAddress } from "../controllers/address.controller.js";

const router = Router();
const upload = multer();

router.post("/create", verifyUser, upload.none(), createAddress);

export default router;
