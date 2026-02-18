import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },

    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
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
            },

            image: {
                type: String,
            },

            price: {
                type: Number,
                required: true,
                min: 0,
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
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
    },

    tax: {
        type: Number,
        default: 0,
        min: 0,
    },

    shippingCost: {
        type: Number,
        default: 0,
        min: 0,
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
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
            sparse: true, 
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

    // deliveryStatus: {
    //     type: String,
    //     enum: ["not_shipped", "in_transit", "out_for_delivery", "delivered"],
    //     default: "not_shipped",
    // },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export { Order };