import { Product } from "../../../models/Product";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body._id || body.id;

  if (!id) {
    throw createError({ statusCode: 400, message: "Product ID is required" });
  }

  // Auto-sync price/image if variants/images changed
  if (body.variants && body.variants.length > 0) {
    body.price = body.variants[0].price;
  }
  if (body.images && body.images.length > 0) {
    body.image = body.images[0];
  }

  const updated = await Product.findByIdAndUpdate(id, body, { new: true });
  return updated;
});
