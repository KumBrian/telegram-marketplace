import PaymentMethod from "../../../models/PaymentMethod";

export default defineEventHandler(async (event) => {
  const methods = await PaymentMethod.find().sort({ createdAt: -1 });
  return methods;
});
