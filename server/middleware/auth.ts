export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // Protect /api/admin/*
  if (url.pathname.startsWith("/api/admin")) {
    const authCookie = getCookie(event, "admin_auth");
    if (authCookie !== "true") {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
  }
});
