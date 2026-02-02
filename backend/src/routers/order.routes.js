import { Router } from "express";
import { 
  initiateEsewaPayment, 
  verifyPayment

} from "../controllers/order.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Initiate payment (requires auth)
router.post("/initiate-esewa-payment", verifyUser, initiateEsewaPayment);

router.post("/verify-payment", verifyUser,verifyPayment);

export default router;