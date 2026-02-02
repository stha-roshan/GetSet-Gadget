import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        // Example: "ORD-1738500000-123"
    },

    status: {
        type: String,
        enum: ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending",
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    customerName: {
        type: String,
        required: true,
        trim: true,
    },

    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },

    customerPhone: {
        type: String,
        trim: true,
        // Optional — some users might not provide phone
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },

            name: {
                type: String,
                required: true,
                // Product name at time of purchase
            },

            image: {
                type: String,
                // Product image URL at time of purchase
            },

            price: {
                type: Number,
                required: true,
                min: 0,
                // Price per unit at time of purchase
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
                // How many units ordered
            },
        },
    ],

    shippingAddress: {
        address: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        zipCode: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            default: "Nepal",
            trim: true,
        },
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0,
        // Sum of all items (price × quantity)
    },

    tax: {
        type: Number,
        default: 0,
        min: 0,
        // VAT or sales tax (13% in Nepal)
    },

    shippingCost: {
        type: Number,
        default: 0,
        min: 0,
        // Delivery charge
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
        // subtotal + tax + shippingCost - discount
    },

    payment: {
        method: {
            type: String,
            enum: ["esewa"],
            required: true,
            default: "esewa",
        },

        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },

        // ============ THE BRIDGE! ============
        // This UUID connects the pending order to eSewa's callback
        // Generated before redirecting to eSewa
        // Used to find the order when eSewa redirects back
        transactionUuid: {
            type: String,
            unique: true,
            sparse: true, // allows null values but ensures uniqueness when present
            // Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        },

        // eSewa's transaction ID (returned after successful payment)
        esewaTransactionId: {
            type: String,
            // Example: "0007KBI" or similar from eSewa
        },

        // eSewa's payment/reference ID
        esewaPaymentId: {
            type: String,
            // Additional reference from eSewa if available
        },

        // Timestamp when payment was completed
        paidAt: {
            type: Date,
        },
    },

    deliveryStatus: {
        type: String,
        enum: ["not_shipped", "in_transit", "out_for_delivery", "delivered"],
        default: "not_shipped",
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export { Order };