import { Router } from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
} from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";

const router = Router();
const upload = multer();

router.post("/register", upload.none(), registerUser);
router.post("/login", upload.none(), loginUser);
router.post("/logout", verifyUser, logoutUser);
router.post("/refresh", refreshAccessToken);
router.post("/changePassword", upload.none(), verifyUser, changePassword);

//temproary route for jwt  user verification testing
router.get("/profile", verifyUser, (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    user: req.user,
  });
});

export default router;
