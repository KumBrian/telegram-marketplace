export default defineNuxtRouteMiddleware((to, from) => {
  // Only protect /admin routes
  if (to.path.startsWith("/admin") && to.path !== "/admin/login") {
    // Check for the cookie (set by server login)
    // Note: useCookie is reactive.
    const authCookie = useCookie("admin_auth");

    if (!authCookie.value) {
      return navigateTo("/admin/login");
    }
  }
});
