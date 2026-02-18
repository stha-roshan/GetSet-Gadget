import { Router } from "express";
import {
  initiateEsewaPayment,
  verifyPayment,
  getCompletedOrders,
  getOrderDetails,
  updateOrderStatus,
  getRevenueData,
  getPendingOrders,
  getRevenueChartData,
  getMonthlyRevenueData,
  getOrderStatusData

} from "../controllers/order.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

import multer from "multer";

const router = Router();
const upload = multer();

router.post("/initiate-esewa-payment", verifyUser, initiateEsewaPayment);

router.post("/verify-payment", verifyUser, verifyPayment);
router.get("/completed-orders", getCompletedOrders)
router.get("/order-details/:orderId", getOrderDetails);
router.patch("/:orderId/status", upload.none(), updateOrderStatus);
router.get("/revenue-data", getRevenueData);
router.get("/pending-orders", getPendingOrders);
router.get("/revenue-chart-data", getRevenueChartData);
router.get("/monthly-revenue-data", getMonthlyRevenueData);
router.get("/order-status-data", getOrderStatusData);

export default router;