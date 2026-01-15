<script setup lang="ts">
import { useCategoriesStore } from "~/stores/categories";
import { storeToRefs } from "pinia";

const categoriesStore = useCategoriesStore();
const { categories, loading } = storeToRefs(categoriesStore);

onMounted(() => {
  categoriesStore.fetchCategories();
});

const newCategoryName = ref("");
const creating = ref(false);

async function handleCreate() {
  if (!newCategoryName.value.trim()) return;
  creating.value = true;
  try {
    await categoriesStore.createCategory(newCategoryName.value);
    newCategoryName.value = "";
  } catch (e: any) {
    alert(e.message || "Failed to create category");
  } finally {
    creating.value = false;
  }
}

async function handleDelete(id: string) {
  if (!confirm("Are you sure?")) return;
  try {
    await categoriesStore.deleteCategory(id);
  } catch (e: any) {
    alert("Failed to delete");
  }
}
</script>

<template>
  <div
    class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
  >
    <div class="flex gap-2 mb-4">
      <input
        v-model="newCategoryName"
        type="text"
        placeholder="New Category"
        class="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 min-w-0"
        @keyup.enter="handleCreate"
      />
      <button
        @click="handleCreate"
        :disabled="creating || !newCategoryName"
        class="bg-black dark:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 whitespace-nowrap"
      >
        {{ creating ? ".." : "Add" }}
      </button>
    </div>

    <div
      v-if="loading"
      class="text-center text-gray-500 dark:text-gray-400 text-sm py-4"
    >
      Loading...
    </div>

    <ul v-else class="space-y-2 max-h-60 overflow-y-auto pr-1">
      <li
        v-for="cat in categories"
        :key="cat._id"
        class="flex justify-between items-center p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg group transition-colors"
      >
        <div class="flex items-center gap-2 overflow-hidden">
          <span
            class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"
          ></span>
          <span
            class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
            >{{ cat.name }}</span
          >
        </div>
        <button
          @click="handleDelete(cat._id)"
          class="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
        >
          Delete
        </button>
      </li>
      <li
        v-if="categories.length === 0"
        class="text-center text-gray-400 dark:text-gray-500 text-xs italic"
      >
        No categories yet
      </li>
    </ul>
  </div>
</template>
