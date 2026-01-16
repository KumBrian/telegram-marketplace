import ShopSettings from "../../models/ShopSettings";

export default defineEventHandler(async (event) => {
  try {
    const settings = await ShopSettings.findOne().select(
      "storeName logoUrl -_id"
    );
    if (!settings) {
      return { storeName: "My Telegram Shop", logoUrl: "" };
    }
    return settings;
  } catch (e) {
    return { storeName: "My Telegram Shop", logoUrl: "" };
  }
});
