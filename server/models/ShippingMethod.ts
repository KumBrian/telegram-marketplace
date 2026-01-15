// server/models/ShippingMethod.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Express Shipping"
    price: { type: Number, required: true },
    estimatedTime: { type: String }, // e.g. "3-5 days"
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ShippingMethod ||
  mongoose.model("ShippingMethod", schema);
