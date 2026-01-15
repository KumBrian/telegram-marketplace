import { defineStore } from "pinia";
import type { IProduct } from "#shared/types";
import api from "~/utils/api";

export const useAdminProductsStore = defineStore("adminProducts", () => {
  const products = ref<IProduct[]>([]);
  const loading = ref(false);

  // This fetches ALL products (including hidden ones potentially if endpoint supported it,
  // currently we reuse public endpoint or need new admin endpoint?
  // Public endpoint filters isVisible=true.
  // We should make a new admin endpoint for listing ALL products if needed,
  // but for now let's reuse public or assuming admin sees everything logic needs adjustment.
  // Actually, let's just make a simple admin list endpoint or use public for now.
  // Wait, public `products.get.ts` enforces `isVisible: true`.
  // Admin needs to see all.
  // Let's create `api/admin/products/index.get.ts` for listing all.

  async function fetchAllProducts() {
    loading.value = true;
    try {
      products.value = (await api.get(
        "/api/admin/products"
      )) as unknown as IProduct[];
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(product: Partial<IProduct>) {
    await api.post("/api/admin/products", product);
  }

  async function updateProduct(product: Partial<IProduct>) {
    await api.put("/api/admin/products", product);
  }

  async function deleteProduct(id: string) {
    await api.delete(`/api/admin/products?id=${id}`);
    products.value = products.value.filter((p) => p._id !== id);
  }

  // Image Upload Helper
  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    // Use $fetch for FormData to avoid Axios header issues
    const res = await $fetch<{ urls: string[] }>("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    return res.urls[0];
  }

  // Gallery
  const galleryImages = ref<{ url: string; name: string }[]>([]);
  async function fetchGallery() {
    galleryImages.value = (await api.get("/api/admin/images")) as any;
  }

  return {
    products,
    loading,
    galleryImages,
    fetchAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    fetchGallery,
  };
});
