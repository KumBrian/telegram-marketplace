import PaymentMethod from "../../../models/PaymentMethod";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id;

  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }

  await PaymentMethod.findByIdAndDelete(id);
  return { success: true };
});
