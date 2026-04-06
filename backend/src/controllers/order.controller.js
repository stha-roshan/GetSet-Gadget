import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateHash } from "../utils/crypto.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import crypto from "crypto";

const MODULE = "[ORDER] [order.controller.js]";
const ESEWA = {
  secret: process.env.ESEWA_HMAC_SECRET,
  merchantId: "EPAYTEST",
  paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusUrl: "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
};

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
}

const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const {
    productId,
    quantity,
    shippingAddress,
    customerName,
    customerPhone,
    customerEmail,
  } = req.body;

  if (!shippingAddress || !shippingAddress.address) {
    throw new ApiError(400, "Shipping address is missing from the request");
  }

  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    throw new ApiError(400, "Product unavailable or out of stock");
  }

  const subtotal = product.price * quantity;
  const tax = Math.round(subtotal * 0.13);
  const totalAmount = subtotal + tax;

  const orderNumber = generateOrderNumber();

  const product_code = "EPAYTEST";
  const { hash, transaction_uuid } = await generateHash(
    totalAmount,
    product_code,
  );

  const order = new Order({
    orderNumber,
    user: userId,
    customerName: customerName || req.user.name,
    customerEmail: customerEmail || req.user.email,
    customerPhone: customerPhone || "",
    items: [
      {
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: quantity,
      },
    ],
    shippingAddress: {
      address: shippingAddress.address,
      city: shippingAddress.city,
      zipCode: shippingAddress.zipCode,
    },
    subtotal,
    tax,
    totalAmount,
    payment: {
      method: "esewa",
      status: "pending",
      transactionUuid: transaction_uuid,
    },
  });

  await order.save();

  return res.status(201).json(
    new ApiResponse(201, "Order initiated. Redirecting to payment...", {
      orderId: order._id,
      esewaData: {
        amount: subtotal,
        tax_amount: tax,
        total_amount: totalAmount,
        transaction_uuid: transaction_uuid,
        product_code: product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: hash,
        payment_url: ESEWA.paymentUrl,
        success_url: "http://localhost:3000/payment-success",
        failure_url: "http://localhost:3000/payment-failure",
      },
    }),
  );
});

const initiateEsewaPaymentCart = asyncHandler(async (req, res) => {
  const {
    items, // [{ productId, quantity }, ...]
    shippingAddress,
    customerName,
    customerPhone,
    customerEmail,
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "No items in cart");
  }

  if (!shippingAddress || !shippingAddress.address) {
    throw new ApiError(400, "Shipping address is missing");
  }

  const userId = req.user._id;

  // ── Validate all products & build order items in one pass ──
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(404, `Product not found: ${item.productId}`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for: ${product.name}`);
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const tax = Math.round(subtotal * 0.13);
  const totalAmount = subtotal + tax;

  const orderNumber = generateOrderNumber();
  const product_code = "EPAYTEST";
  const { hash, transaction_uuid } = await generateHash(
    totalAmount,
    product_code,
  );

  const order = new Order({
    orderNumber,
    user: userId,
    customerName: customerName || req.user.name,
    customerEmail: customerEmail || req.user.email,
    customerPhone: customerPhone || "",
    items: orderItems,
    shippingAddress: {
      address: shippingAddress.address,
      city: shippingAddress.city,
      zipCode: shippingAddress.zipCode,
    },
    subtotal,
    tax,
    totalAmount,
    payment: {
      method: "esewa",
      status: "pending",
      transactionUuid: transaction_uuid,
    },
  });

  await order.save();

  return res.status(201).json(
    new ApiResponse(201, "Cart order initiated. Redirecting to payment...", {
      orderId: order._id,
      esewaData: {
        amount: subtotal,
        tax_amount: tax,
        total_amount: totalAmount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: hash,
        payment_url: ESEWA.paymentUrl,
        success_url: "http://localhost:3000/payment-success",
        failure_url: "http://localhost:3000/payment-failure",
      },
    }),
  );
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { data } = req.body;

  if (!data) {
    throw new ApiError(400, "No payment data received");
  }

  const decodedString = Buffer.from(data, "base64").toString("utf-8");
  const decodedData = JSON.parse(decodedString);

  const order = await Order.findOne({
    "payment.transactionUuid": decodedData.transaction_uuid,
  });

  if (!order) {
    throw new ApiError(404, "Order not found or invalid transaction");
  }

  if (order.payment.status === "completed") {
    return res
      .status(200)
      .json(new ApiResponse(200, order, "Payment already verified"));
  }

  if (decodedData.status !== "COMPLETE") {
    throw new ApiError(400, "Payment has not been completed");
  }

  for (const item of order.items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(404, `Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    product.stock -= item.quantity;
     product.totalSales += item.quantity;
    await product.save();
  }

  const cartResult =await Cart.findOneAndUpdate({ userId: order.user }, { $set: { items: [] } });
  console.log("Cart clear result:", cartResult);

  order.payment.status = "completed";
  order.payment.transactionId = decodedData.transaction_code;
  order.payment.completedAt = new Date();

  await order.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        order,
        "Payment verified and order updated successfully",
      ),
    );
});

const getCompletedOrders = asyncHandler(async (req, res) => {

   const { status } = req.query;

  const filter = { "payment.status": "completed" };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No completed orders found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, `Found ${orders.length} completed orders`, orders),
    );
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  // .populate("user", "name email")
  // .populate("items.productId", "name price image");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Order details retrieved successfully", order));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  // Find and update order
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Prevent updating cancelled orders
  if (order.status === "cancelled") {
    throw new ApiError(400, "Cannot update a cancelled order");
  }

  // Prevent going backwards in the order flow (optional business logic)
  const statusProgression = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  // Allow cancellation at any time, but prevent backwards progression otherwise
  if (
    status !== "cancelled" &&
    statusProgression[status] < statusProgression[order.status]
  ) {
    throw new ApiError(
      400,
      `Cannot move order from ${order.status} to ${status}`,
    );
  }

  // Update the status
  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Order status updated successfully", order));
});

const getRevenueData = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Single aggregation query to get all revenue data at once
  const revenueStats = await Order.aggregate([
    {
      $match: {
        "payment.status": "completed",
      },
    },
    {
      $facet: {
        // Total Revenue (All Time)
        totalRevenue: [
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ],
        // Revenue Today
        revenueToday: [
          {
            $match: {
              createdAt: { $gte: today },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ],
        // Revenue This Month
        revenueThisMonth: [
          {
            $match: {
              createdAt: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ],
        // Revenue This Year
        revenueThisYear: [
          {
            $match: {
              createdAt: { $gte: startOfYear },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ],
      },
    },
  ]);

  // Extract values and handle empty results
  const data = {
    totalRevenue: revenueStats[0].totalRevenue[0]?.total || 0,
    revenueToday: revenueStats[0].revenueToday[0]?.total || 0,
    revenueThisMonth: revenueStats[0].revenueThisMonth[0]?.total || 0,
    revenueThisYear: revenueStats[0].revenueThisYear[0]?.total || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Revenue data retrieved successfully", data));
});

const getPendingOrders = asyncHandler(async (req, res) => {
  const pendingOrders = await Order.find({
    status: "pending",
    "payment.status": "completed",
  });

  if (!pendingOrders || pendingOrders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No pending orders found", []));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Pending orders retrieved successfully",
        pendingOrders,
      ),
    );
});

const getRevenueChartData = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6 days ago + today = 7 days
  sevenDaysAgo.setHours(0, 0, 0, 0); // Start of that day

  // Aggregate revenue by date for the last 7 days
  const revenueByDay = await Order.aggregate([
    {
      $match: {
        "payment.status": "completed",
        createdAt: {
          $gte: sevenDaysAgo,
          $lte: today,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: 1,
      },
    },
  ]);

  // Create array of last 7 days with 0 revenue if no orders
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Find revenue for this date
    const dayData = revenueByDay.find((item) => item.date === dateString);

    chartData.push({
      date: dateString,
      revenue: dayData ? dayData.revenue : 0,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Revenue chart data retrieved successfully",
        chartData,
      ),
    );
});

const getMonthlyRevenueData = asyncHandler(async (req, res) => {
  const today = new Date();

  // Get first day of 6 months ago
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Aggregate revenue by month for last 6 months
  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        "payment.status": "completed",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Create array of last 6 months with 0 revenue if no orders
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const chartData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Find revenue for this month
    const monthData = revenueByMonth.find(
      (item) => item._id.year === year && item._id.month === month,
    );

    chartData.push({
      month: `${monthNames[month - 1]} ${year}`,
      revenue: monthData ? monthData.revenue : 0,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Monthly revenue data retrieved successfully",
        chartData,
      ),
    );
});

// ===================================
// Order Status Distribution - For Pie Chart
// ===================================
const getOrderStatusData = asyncHandler(async (req, res) => {
  // Aggregate orders by status (only completed payments)
  const ordersByStatus = await Order.aggregate([
    {
      $match: {
        "payment.status": "completed",
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Create object with all statuses (default to 0 if not found)
  const statusData = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  // Fill in actual counts
  ordersByStatus.forEach((item) => {
    const status = item._id.toLowerCase();
    if (statusData.hasOwnProperty(status)) {
      statusData[status] = item.count;
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Order status data retrieved successfully",
        statusData,
      ),
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id; // comes from verifyUser middleware

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No orders found", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Orders fetched successfully", orders));
});

export {
  initiateEsewaPayment,
  verifyPayment,
  getCompletedOrders,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  getRevenueData,
  getPendingOrders,
  getRevenueChartData,
  getMonthlyRevenueData,
  getOrderStatusData,
  initiateEsewaPaymentCart,
};
