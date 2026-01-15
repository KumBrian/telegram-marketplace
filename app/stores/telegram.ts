import { defineStore } from "pinia";

export const useTelegramStore = defineStore("telegram", () => {
  const initData = ref<string>("");
  const user = ref<any>(null);

  function init() {
    if (initData.value) return; // Already initialized

    // 1. Try SDK (sometimes it works)
    // We defer import to client-side only
    if (import.meta.client) {
      // Logic from index.vue
      let raw = "";

      // Try window.Telegram first (direct access)
      const w = window as any;
      if (w.Telegram?.WebApp?.initData) {
        raw = w.Telegram.WebApp.initData;
      }

      // Robust Hash Rescue
      // If SDK data is missing OR it's truncated (missing hash= means it's bad)
      if (!raw || !raw.includes("hash=")) {
        const hash = window.location.hash;
        const key = "tgWebAppData=";
        const start = hash.indexOf(key);
        if (start !== -1) {
          let extracted = hash.substring(start + key.length);
          const knownParams = ["&tgWebAppVersion=", "&tgWebAppThemeParams="];
          let end = -1;
          for (const p of knownParams) {
            const idx = extracted.indexOf(p);
            if (idx !== -1 && (end === -1 || idx < end)) {
              end = idx;
            }
          }
          if (end !== -1) {
            extracted = extracted.substring(0, end);
          }
          try {
            raw = extracted.includes("%")
              ? decodeURIComponent(extracted)
              : extracted;
          } catch (e) {
            raw = extracted;
          }
        }
      }

      // Mock Data for Dev
      if (!raw && import.meta.dev) {
        console.log("⚠️ DEV MODE: Using Mock Telegram Data");
        const mockUser = encodeURIComponent(
          JSON.stringify({
            id: 123456789,
            first_name: "Test User",
            username: "testuser",
            language_code: "en",
          })
        );
        const authDate = Math.floor(Date.now() / 1000);
        raw = `user=${mockUser}&chat_instance=123&chat_type=private&auth_date=${authDate}&hash=mock`;
      }

      if (raw) {
        initData.value = raw;
        // Parse user if possible
        const params = new URLSearchParams(raw);
        const u = params.get("user");
        if (u) {
          try {
            user.value = JSON.parse(u);
          } catch (e) {}
        }
      }
    }
  }

  return {
    initData,
    user,
    init,
  };
});
