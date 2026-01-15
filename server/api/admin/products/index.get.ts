import { Product } from "../../../models/Product";

export default defineEventHandler(async (event) => {
  return await Product.find().sort({ createdAt: -1 }).populate("category");
});
