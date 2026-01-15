import { Product } from "../../../models/Product";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id;

  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }

  await Product.findByIdAndDelete(id);
  return { success: true };
});
