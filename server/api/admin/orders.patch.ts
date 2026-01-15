import { Order } from "../../models/Order";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.id || !body.status) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing ID or Status",
    });
  }

  // Find order by ID and update the status
  const updatedOrder = await Order.findByIdAndUpdate(
    body.id,
    { status: body.status },
    { new: true } // Return the updated object
  );

  return { success: true, order: updatedOrder };
});
