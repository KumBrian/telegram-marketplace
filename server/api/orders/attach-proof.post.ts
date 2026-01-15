import { Order } from "../../models/Order";
import { validateTelegramData } from "../../utils/telegram";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { payload, orderId, proofUrl } = body;

  if (!payload || !orderId || !proofUrl) {
    throw createError({ statusCode: 400, message: "Missing fields" });
  }

  // Validate User
  let initData = "";
  if (!payload.includes("query_id=") && !payload.includes("user=")) {
    try {
      initData = atob(payload);
    } catch (e) {
      initData = payload;
    }
  } else {
    initData = payload;
  }

  const isValid = validateTelegramData(initData, config.botToken);
  if (!isValid) {
    throw createError({ statusCode: 403, message: "Invalid Telegram Data" });
  }

  const params = new URLSearchParams(initData);
  const userStr = params.get("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    throw createError({ statusCode: 400, message: "No user found" });
  }

  // Find and Update Order
  const order = await Order.findOne({ _id: orderId, telegramUserId: user.id });
  if (!order) {
    throw createError({ statusCode: 404, message: "Order not found" });
  }

  order.paymentProof = proofUrl;
  order.status = "under_review";
  await order.save();

  return { success: true };
});
