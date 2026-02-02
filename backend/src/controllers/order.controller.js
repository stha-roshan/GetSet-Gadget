import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateHash } from "../utils/crypto.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import crypto from "crypto";

const MODULE = "[ORDER] [order.controller.js]";
const ESEWA = {
    secret: process.env.ESEWA_HMAC_SECRET,  // ← Read from .env
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
    // console.log("Incoming Shipping Data:", req.body.shippingAddress);

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
            transactionUuid: transaction_uuid, // Bridge established
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


// Add this to your existing order.controller.js
const verifyPayment = asyncHandler(async (req, res) => {
    const { data } = req.body;

    if (!data) {
        throw new ApiError(400, "No payment data received");
    }

    // 1. Decode Base64 string from eSewa
    const decodedString = Buffer.from(data, 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedString);

    // 2. Find the order by the UUID we sent to eSewa originally
    // We stored this in payment.transactionUuid during the initiation step
    const order = await Order.findOne({ "payment.transactionUuid": decodedData.transaction_uuid });

    if (!order) {
        throw new ApiError(404, "Order not found or invalid transaction");
    }

    // 3. Check if eSewa says the payment is COMPLETE
    if (decodedData.status !== "COMPLETE") {
        throw new ApiError(400, "Payment has not been completed");
    }

    // 4. Update the Order status
    order.payment.status = "completed";
    // order.payment.details = decodedData; // Store the full response for auditing
    
    // Optional: Update product stock here if you haven't already
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Payment verified and order updated successfully"));
});



export { initiateEsewaPayment, verifyPayment };