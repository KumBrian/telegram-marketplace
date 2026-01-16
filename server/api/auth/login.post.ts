export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  if (body.password === config.adminPassword) {
    // secure: true in prod, but for local dev with http it might fail if secure is enforced without check
    const isSecure = process.env.NODE_ENV === "production";
    setCookie(event, "admin_auth", "true", {
      httpOnly: false, // Must be false so useCookie in middleware can see it
      secure: isSecure,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  } else {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
