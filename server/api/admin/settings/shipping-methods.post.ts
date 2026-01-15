import ShippingMethod from "../../../models/ShippingMethod";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const method = await ShippingMethod.create(body);
  return method;
});
