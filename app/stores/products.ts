import { defineStore } from "pinia";
import type { IProduct } from "#shared/types";
import api from "~/utils/api";

export const useProductsStore = defineStore("products", () => {
  const products = ref<IProduct[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      products.value = (await api.get(
        "/api/products"
      )) as unknown as IProduct[];
    } catch (e: any) {
      error.value = e.message || "Failed to fetch products";
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
});
