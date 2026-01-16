import ShopSettings from "../../../models/ShopSettings";

export default defineEventHandler(async (event) => {
  try {
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = await ShopSettings.create({
        storeName: "My Telegram Shop",
        logoUrl: "",
      });
    }
    return settings;
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: "Server Error" });
  }
});
