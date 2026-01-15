// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
    server: {
      allowedHosts: ["aide-unmutational-hellen.ngrok-free.dev"],
    },
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI, // Private (Server only)
    botToken: process.env.BOT_TOKEN, // Private (For verifying orders)
    public: {
      // Public keys if needed
    },
  },
});
