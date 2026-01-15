import { Order } from "../../models/Order";

export default defineEventHandler(async (event) => {
  try {
    // Fetch all orders, sorted by newest first (-1)
    // .lean() makes queries faster by returning plain JS objects instead of Mongoose Documents
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return orders;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch orders",
    });
  }
});
