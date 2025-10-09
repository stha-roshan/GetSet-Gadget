import { Router } from "express"
import multer from "multer"
import { registerUser } from "../controllers/user.controller.js"

const router = Router();
const upload = multer()

router.post("/register",upload.none(), registerUser)

export default router;