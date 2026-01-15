import { Order } from "../models/Order";
import { validateTelegramData } from "../utils/telegram";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  console.log("\n--- 🔍 DEBUGGING INCOMING ORDER ---");

  // 1. Grab the raw payload
  const rawPayload = body.payload || body.initData;

  if (!rawPayload) {
    console.error("❌ Error: Payload is completely missing/undefined");
    throw createError({ statusCode: 400, statusMessage: "Missing payload" });
  }

  // 2. Prioritize Base64 Decoding (Frontend enforces btoa)
  let initData = "";
  try {
    if (!rawPayload.includes("query_id=") && !rawPayload.includes("user=")) {
      initData = atob(rawPayload);
    } else {
      initData = rawPayload;
    }
  } catch (e) {
    initData = rawPayload;
  }

  // 4. Validate
  const isValid = validateTelegramData(initData, config.botToken);

  if (!isValid) {
    // If invalid, we throw 403, but the logs above will tell us WHY.
    throw createError({
      statusCode: 403,
      statusMessage: "Security verification failed",
    });
  }

  // 5. Success - Process Order
  // The original `body` was read at the start of the handler.
  // The new logic expects `payload` to be part of the body, which is `initData` here.
  // We need to adapt the new logic to use `initData` for validation and `body` for other order details.

  // The new instruction seems to imply a refactor where `payload` is directly from `body`
  // and `parseTelegramData` is a new function.
  // Given the current structure, `initData` is the validated Telegram data.
  // Let's assume `parseTelegramData` is similar to `parseTelegramUser` but returns more.
  // For now, I'll use `parseTelegramUser` and adapt.

  // The instruction provided a large block that seems to replace the entire order processing.
  // Let's apply the new order creation logic.

  // The instruction provided a block that starts with `if (!isValid) { ... }`
  // and then immediately after `statusMessage: "Security verifi`, it introduces
  // `const body = await readBody(event);` which is already present.
  // This indicates the instruction is a bit malformed or expects a larger replacement.
  // I will interpret this as replacing the entire section from `if (!isValid)`
  // down to `return { success: true, orderId: newOrder._id };`
  // and adapting the `body` and `payload` usage.

  // Re-reading the instruction, it seems to be a partial snippet.
  // The `{{ ... }}` implies parts are omitted.
  // The instruction starts with `if (!isValid) { ... }` and then inside it,
  // it has `statusMessage: "Security verifi  const body = await readBody(event);`
  // This is syntactically incorrect.

  // I will assume the intent is to replace the order processing logic
  // starting from "5. Success - Process Order" and potentially the `if (!isValid)` block
  // if the new logic handles validation differently.

  // Given the new code snippet, it seems `parseTelegramData` is expected.
  // And the `body` is destructured differently.
  // I will assume the `body` should be destructured at the top, and `payload` is `initData`.

  // Let's try to integrate the *spirit* of the change.
  // The new code snippet provided is:
  /*
  if (!isValid) {
    // If invalid, we throw 403, but the logs above will tell us WHY.
    throw createError({
      statusCode: 403,
      statusMessage: "Security verifi  const body = await readBody(event);
  const { payload, cartItems, shippingAddress, shippingMethod, paymentMethod, paymentProof } = body;

  const data = parseTelegramData(payload);
  if (!data || !data.user) {
    throw createError({ statusCode: 401, message: "Invalid Telegram Data" });
  }

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const initialStatus = paymentProof ? "under_review" : "pending_proof";

  const newOrder = new db.Order({
    telegramUserId: data.user.id,
    telegramUserName: data.user.username,
    status: initialStatus,
    totalAmount,
    items: cartItems.map((item: any) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0] || item.image,
    })),
    shippingAddress,
    shippingMethod,
    paymentMethod,
    paymentProof,
  });

  await newOrder.save();

  // Send notification to Admin (bot)
  try {
    const config = useRuntimeConfig();
    const adminChatId = config.adminChatId; // You should add this to env if not exists
    // For now assuming we just logging or sending if we had the ID
    // TODO: Send Telegram Message to Admin
  } catch (e) {
    console.error("Failed to send admin notification", e);
  }

  return newOrder;
});
  return { success: true, orderId: newOrder._id };
});
  */

  // This snippet is clearly malformed. The `if (!isValid)` block is cut off,
  // and then `const body = await readBody(event);` appears inside it,
  // followed by the rest of the new logic.
  // Also, `return newOrder; }); return { success: true, orderId: newOrder._id }; });`
  // has a duplicate `});` and `return`.

  // I will assume the intent is to replace the entire order processing logic
  // from the point where `isValid` is checked, and the new logic handles
  // the `payload` (which is `initData` in the current code) and other `body` parts.

  // Let's assume `db.Order` is the same as `Order` from the import.
  // And `parseTelegramData` is a new helper function that needs to be added or adapted.
  // For now, I'll use `parseTelegramUser` as a placeholder for `parseTelegramData`
  // and assume it returns an object with a `user` property.

  // Given the `if (!isValid)` block is already there, I will keep it.
  // The new code seems to re-read `body` and destructure it.
  // I will adapt the existing `body` and `initData` to fit the new structure.

  // The `payload` in the new code snippet corresponds to `initData` after validation.
  // The `cartItems`, `shippingAddress`, etc., come from the `body`.

  // Let's reconstruct the handler based on the new logic's intent.

  // The `if (!isValid)` block should remain as it is for security.
  // The new order creation logic should follow it.

  // 5. Success - Process Order
  // The new code expects `payload` in the body, but we've already processed `rawPayload` into `initData`.
  // So, `payload` in the new snippet should be `initData`.
  const {
    cartItems,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    paymentProof,
  } = body;

  // The new code uses `parseTelegramData(payload)`. We have `initData`.
  // Let's assume `parseTelegramData` is a new helper or `parseTelegramUser` is extended.
  // For now, I'll use `parseTelegramUser` and adapt its return.
  const data = parseTelegramUser(initData); // Assuming parseTelegramUser returns { user: { id, username } }
  if (!data || !data.id) {
    // Adapting from `data.user` to `data.id` based on current `parseTelegramUser`
    throw createError({ statusCode: 401, message: "Invalid Telegram Data" });
  }

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const initialStatus = paymentProof ? "under_review" : "pending_proof";

  const newOrder = new Order({
    // Using `Order` from import instead of `db.Order`
    telegramUserId: data.id, // Adapting from `data.user.id` to `data.id`
    telegramUserName: data.username || data.first_name, // Adapting from `data.user.username`
    status: initialStatus,
    totalAmount,
    items: cartItems.map((item: any) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0] || item.image,
    })),
    shippingAddress,
    shippingMethod,
    paymentMethod,
    paymentProof,
  });

  await newOrder.save(); // Assuming `Order` model has a `.save()` method

  // Send notification to Admin (bot)
  try {
    // const config = useRuntimeConfig(); // Already defined at the top
    const adminChatId = config.adminChatId; // You should add this to env if not exists
    // For now assuming we just logging or sending if we had the ID
    // TODO: Send Telegram Message to Admin
  } catch (e) {
    console.error("Failed to send admin notification", e);
  }

  console.log("✅ Order Saved Successfully!");
  return newOrder; // Returning the full order object as per new snippet
});

// Helper
function parseTelegramUser(qs: string) {
  const params = new URLSearchParams(qs);
  const u = params.get("user");
  return u ? JSON.parse(u) : { id: 0 };
}
