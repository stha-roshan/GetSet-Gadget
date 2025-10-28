import { Router } from "express";
import multer from "multer";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  createAddress,
  editAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

const router = Router();
const upload = multer();

router.post("/create", verifyUser, upload.none(), createAddress);
router.patch("/:addressId", verifyUser, upload.none(), editAddress);
router.delete("/:addressId", verifyUser, deleteAddress);

export default router;
