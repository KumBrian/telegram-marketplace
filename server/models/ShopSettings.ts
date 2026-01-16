import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    storeName: { type: String, default: "My Store" },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ShopSettings ||
  mongoose.model("ShopSettings", schema);
