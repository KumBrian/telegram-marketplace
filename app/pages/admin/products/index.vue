<script setup lang="ts">
import { useAdminProductsStore } from "~/stores/adminProducts";
import { storeToRefs } from "pinia";
import type { IProduct } from "#shared/types";

const store = useAdminProductsStore();
const { products, loading } = storeToRefs(store);

onMounted(() => {
  store.fetchAllProducts();
});

async function handleDelete(id: string) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    await store.deleteProduct(id);
  } catch (e: any) {
    alert(e.message);
  }
}
</script>

<template>
  <div class="p-6 text-gray-900 dark:text-white">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Products</h1>
      <NuxtLink
        to="/admin/products/edit"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
      >
        + Add New Product
      </NuxtLink>
    </div>

    <div
      v-if="loading"
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      Loading products...
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="product in products"
        :key="product._id"
        class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center transition-colors"
      >
        <div
          class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0"
        >
          <img
            :src="product.images?.[0] || product.image"
            class="w-full h-full object-cover"
            v-if="product.images?.[0] || product.image"
          />
        </div>

        <div class="flex-grow">
          <h3 class="font-bold text-gray-900 dark:text-white">
            {{ product.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {{ product.description }}
          </p>
          <div class="flex gap-2 mt-1">
            <span
              class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-300"
              >{{ product.category?.name || "Uncategorized" }}</span
            >
            <span
              class="text-xs font-mono bg-green-50 dark:bg-green-900/30 px-1 text-green-700 dark:text-green-400 rounded"
              v-if="product.variants?.length"
            >
              {{ product.variants.length }} variants
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2 text-right">
          <span class="font-bold text-sm text-gray-900 dark:text-white"
            >${{ product.price }}</span
          >
          <div class="flex gap-2">
            <NuxtLink
              :to="`/admin/products/edit?id=${product._id}`"
              class="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
              >Edit</NuxtLink
            >
            <button
              @click="handleDelete(product._id)"
              class="text-red-500 text-xs font-bold hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="products.length === 0"
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed"
      >
        <p class="text-gray-500 dark:text-gray-400">No products found.</p>
      </div>
    </div>
  </div>
</template>
