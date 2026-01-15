<script setup lang="ts">
import { useAdminProductsStore } from "~/stores/adminProducts";
import { useCategoriesStore } from "~/stores/categories";
import { storeToRefs } from "pinia";
import type { IProduct, ProductVariant } from "#shared/types";
import { CategoryManager, ImageGallery } from "~/components/admin";

const route = useRoute();
const router = useRouter();
const productStore = useAdminProductsStore();
const categoryStore = useCategoriesStore();

const { categories } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const isEditing = computed(() => !!route.query.id);
const loading = ref(false);

const form = reactive<{
  name: string;
  description: string;
  categoryId: string;
  images: string[];
  variants: ProductVariant[];
  isVisible: boolean;
}>({
  name: "",
  description: "",
  categoryId: "",
  images: [],
  variants: [],
  isVisible: true,
});

onMounted(async () => {
  await categoryStore.fetchCategories();

  if (isEditing.value) {
    // If editing, find product. We might need to fetch single product if not in list,
    // but for now assume list is populated or we fetch all.
    // Better: ensure we have data.
    if (productStore.products.length === 0) {
      await productStore.fetchAllProducts();
    }

    const product = productStore.products.find((p) => p._id === route.query.id);
    if (product) {
      form.name = product.name;
      form.description = product.description || "";
      // Handle populated category or ID
      form.categoryId =
        (product.category as any)?._id || product.category || "";
      form.images = [...(product.images || [])];
      if (product.image && !form.images.includes(product.image)) {
        // back-compat
        form.images.push(product.image);
      }
      form.variants = product.variants
        ? product.variants.map((v) => ({ ...v }))
        : [];
      // If no variants but price exists, create one default variant?
      if (form.variants.length === 0 && product.price) {
        form.variants.push({
          weight: "Default",
          price: product.price,
          available: true,
        });
      }
      form.isVisible = product.isVisible;
    }
  }
});

// -- Methods --

function addVariant() {
  form.variants.push({ weight: "", price: 0, available: true });
}

function removeVariant(index: number) {
  form.variants.splice(index, 1);
}

function addImage(url: string) {
  if (!form.images.includes(url)) {
    form.images.push(url);
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1);
}

async function save() {
  if (!form.name) return alert("Name is required");
  if (form.variants.length === 0)
    return alert("At least one variant (e.g. Standard Price) is required");

  loading.value = true;
  try {
    const payload: any = {
      name: form.name,
      description: form.description,
      category: form.categoryId || null,
      images: form.images,
      variants: form.variants,
      isVisible: form.isVisible,
    };

    if (isEditing.value) {
      payload._id = route.query.id;
      await productStore.updateProduct(payload);
    } else {
      await productStore.createProduct(payload);
    }

    router.push("/admin/products");
  } catch (e: any) {
    alert(e.message || "Save failed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 pb-24 text-gray-900 dark:text-white">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink
        to="/admin/products"
        class="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >← Back</NuxtLink
      >
      <h1 class="text-2xl font-bold">
        {{ isEditing ? "Edit Product" : "New Product" }}
      </h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info -->
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4"
        >
          <h2 class="font-bold text-lg text-gray-900 dark:text-white">
            Basic Info
          </h2>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Product Name</label
            >
            <input
              v-model="form.name"
              class="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="e.g. Vintage Camera"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Description</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            ></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="form.isVisible"
              id="vis"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label
              for="vis"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Visible in Store</label
            >
          </div>
        </div>

        <!-- Variants -->
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4"
        >
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-lg text-gray-900 dark:text-white">
              Pricing & Variants
            </h2>
            <button
              @click="addVariant"
              class="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              + Add Variant
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(variant, idx) in form.variants"
              :key="idx"
              class="flex gap-3 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-transparent dark:border-gray-700"
            >
              <input
                v-model="variant.weight"
                placeholder="Weight/Size (e.g. 500g)"
                class="flex-grow p-2 text-sm border rounded bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <div class="relative w-32">
                <span
                  class="absolute left-2 top-2 text-gray-500 dark:text-gray-400"
                  >$</span
                >
                <input
                  v-model.number="variant.price"
                  type="number"
                  class="w-full pl-6 p-2 text-sm border rounded font-bold bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <button
                @click="removeVariant(idx)"
                class="text-red-500 hover:bg-white dark:hover:bg-gray-700 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <div v-if="form.variants.length === 0" class="text-xs text-red-500">
              Please add at least one pricing option.
            </div>
          </div>
        </div>

        <!-- Images -->
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4"
        >
          <h2 class="font-bold text-lg text-gray-900 dark:text-white">
            Images
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Selected images (First is cover)
          </p>

          <div class="flex gap-2 flex-wrap">
            <div
              v-for="(img, idx) in form.images"
              :key="idx"
              class="w-20 h-20 relative rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
            >
              <img :src="img" class="w-full h-full object-cover" />
              <button
                @click="removeImage(idx)"
                class="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p class="text-sm font-bold mb-2 text-gray-900 dark:text-white">
              Select from Gallery
            </p>
            <ImageGallery selectable @select="addImage" />
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Category -->
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <h2 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">
            Category
          </h2>
          <select
            v-model="form.categoryId"
            class="w-full p-2 border rounded-lg mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Uncategorized</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>

          <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Manage Categories
            </p>
            <CategoryManager />
          </div>
        </div>

        <!-- Actions -->
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6"
        >
          <button
            @click="save"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {{ loading ? "Saving..." : "Save Product" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
