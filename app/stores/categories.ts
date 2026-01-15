import { defineStore } from "pinia";
import type { ICategory } from "#shared/types";
import api from "~/utils/api";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<ICategory[]>([]);
  const loading = ref(false);

  async function fetchCategories() {
    loading.value = true;
    try {
      categories.value = (await api.get(
        "/api/admin/categories"
      )) as unknown as ICategory[];
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(name: string, icon?: string) {
    const newCat = (await api.post("/api/admin/categories", {
      name,
      icon,
    })) as unknown as ICategory;
    categories.value.push(newCat);
  }

  async function deleteCategory(id: string) {
    await api.delete(`/api/admin/categories?id=${id}`);
    categories.value = categories.value.filter((c) => c._id !== id);
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    deleteCategory,
  };
});
