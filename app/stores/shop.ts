import { defineStore } from "pinia";

export const useShopStore = defineStore("shop", () => {
  const name = ref("My Telegram Shop");
  const logo = ref("");
  const loading = ref(false);

  async function fetchShopSettings() {
    loading.value = true;
    try {
      const data = await $fetch("/api/shop/settings");
      if (data) {
        name.value = (data as any).storeName || "My Telegram Shop";
        logo.value = (data as any).logoUrl || "";
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  return { name, logo, loading, fetchShopSettings };
});
