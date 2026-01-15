import ShippingMethod from "../../../models/ShippingMethod";

export default defineEventHandler(async (event) => {
  const methods = await ShippingMethod.find().sort({ createdAt: -1 });
  return methods;
});
