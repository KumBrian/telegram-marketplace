import { Product } from "../models/Product";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = { isVisible: true };

  if (query.category) {
    filter.category = query.category;
  }

  // Populate category to maybe show name in UI
  return await Product.find(filter).populate("category");
});
