import PaymentMethod from "../../../models/PaymentMethod";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const method = await PaymentMethod.create(body);
  return method;
});
