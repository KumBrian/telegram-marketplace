import { Product } from "../../../models/Product";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validation
  if (!body.name)
    throw createError({ statusCode: 400, message: "Name is required" });

  // Logic to determine "primary" price if not explicitly sent but variants are
  let price = body.price;
  if (body.variants && body.variants.length > 0 && !price) {
    price = body.variants[0].price;
  }

  // Similar logic for image
  let image = body.image;
  if (body.images && body.images.length > 0 && !image) {
    image = body.images[0];
  }

  const newProduct = await Product.create({
    ...body,
    price,
    image,
  });

  return newProduct;
});
