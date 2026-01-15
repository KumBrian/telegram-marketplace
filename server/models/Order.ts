import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
  {
    telegramUserId: { type: Number, required: true },
    telegramUserName: { type: String },
    status: {
      type: String,
      enum: [
        "pending", // Legacy
        "pending_proof", // Waiting for payment proof
        "under_review", // Proof uploaded, admin checking
        "paid",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "pending_proof",
    },
    totalAmount: { type: Number, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    // New Fields
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      country: String,
      zipCode: String,
      phone: String,
    },
    shippingMethod: {
      name: String,
      price: Number,
    },
    paymentMethod: {
      name: String,
      network: String,
      walletAddress: String,
    },
    paymentProof: { type: String }, // URL to image
  },
  { timestamps: true }
);

export const Order = model("Order", OrderSchema);
