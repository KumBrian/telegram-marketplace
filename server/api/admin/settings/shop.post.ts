import ShopSettings from "../../../models/ShopSettings";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    let settings = await ShopSettings.findOne();
    if (!settings) {
      settings = new ShopSettings(body);
    } else {
      if (body.storeName !== undefined) settings.storeName = body.storeName;
      if (body.logoUrl !== undefined) settings.logoUrl = body.logoUrl;
    }
    await settings.save();
    return settings;
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to save settings",
    });
  }
});
