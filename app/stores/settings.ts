import { defineStore } from "pinia";
import api from "~/utils/api";

export const useSettingsStore = defineStore("settings", () => {
  const paymentMethods = ref<any[]>([]);
  const shippingMethods = ref<any[]>([]);
  const loading = ref(false);

  async function fetchSettings() {
    loading.value = true;
    try {
      const results = await Promise.all([
        api.get("/api/admin/settings/payment-methods"),
        api.get("/api/admin/settings/shipping-methods"),
        api.get("/api/admin/settings/shop"),
      ]);
      paymentMethods.value = results[0] as unknown as any[];
      shippingMethods.value = results[1] as unknown as any[];
      if (results[2]) shopSettings.value = results[2] as any;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function addPaymentMethod(data: any) {
    await api.post("/api/admin/settings/payment-methods", data);
    await fetchSettings();
  }

  async function deletePaymentMethod(id: string) {
    if (!confirm("Delete this payment method?")) return;
    await api.delete(`/api/admin/settings/payment-methods?id=${id}`);
    await fetchSettings();
  }

  async function addShippingMethod(data: any) {
    await api.post("/api/admin/settings/shipping-methods", data);
    await fetchSettings();
  }

  async function deleteShippingMethod(id: string) {
    if (!confirm("Delete this shipping method?")) return;
    await api.delete(`/api/admin/settings/shipping-methods?id=${id}`);
    await fetchSettings();
  }

  // Shop Settings
  const shopSettings = ref({ storeName: "My Store", logoUrl: "" });

  async function updateShopSettings(storeName: string, logoUrl: string) {
    try {
      const data = await $fetch("/api/admin/settings/shop", {
        method: "POST",
        body: { storeName, logoUrl },
      });
      if (data) shopSettings.value = data as any;
      alert("Settings saved!");
    } catch (e) {
      alert("Failed to save settings");
    }
  }

  return {
    paymentMethods,
    shippingMethods,
    shopSettings,
    loading,
    fetchSettings,
    addPaymentMethod,
    deletePaymentMethod,
    addShippingMethod,
    deleteShippingMethod,
    updateShopSettings,
  };
});
