import { Order } from "../models/Order";
import { validateTelegramData } from "../utils/telegram";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const payload = query.payload as string;

  if (!payload) {
    throw createError({ statusCode: 400, message: "Missing payload" });
  }

  // Reuse logic from orders.post.ts or extract to utility
  // Ideally we decode and validate
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
  if (!userStr) {
    throw createError({ statusCode: 400, message: "No user data" });
  }

  const user = JSON.parse(userStr);
  const orders = await Order.find({ telegramUserId: user.id }).sort({
    createdAt: -1,
  });

  return orders;
});
