// server/models/PaymentMethod.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Bitcoin"
    walletAddress: { type: String, required: true },
    network: { type: String }, // e.g. "BTC", "ERC20"
    description: { type: String },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentMethod ||
  mongoose.model("PaymentMethod", schema);
