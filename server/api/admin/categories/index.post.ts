import { Category } from "../../../models/Category";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name) {
    throw createError({ statusCode: 400, message: "Name is required" });
  }

  // Simple clean slug generation
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const category = await Category.create({
      name: body.name,
      slug: slug,
      icon: body.icon,
    });
    return category;
  } catch (e: any) {
    if (e.code === 11000) {
      throw createError({
        statusCode: 409,
        message: "Category name must be unique",
      });
    }
    throw e;
  }
});
