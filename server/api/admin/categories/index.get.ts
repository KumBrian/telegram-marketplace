import { Category } from "../../../models/Category";

export default defineEventHandler(async (event) => {
  return await Category.find().sort({ name: 1 });
});
