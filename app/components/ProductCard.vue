<script setup lang="ts">
import type { IProduct, ProductVariant } from "#shared/types";
import { useCartStore } from "~/stores/cart";

const props = defineProps<{
  product: IProduct;
}>();

const cartStore = useCartStore();

// UI State for variant selection
const showVariants = ref(false);

const hasVariants = computed(() => {
  return props.product.variants && props.product.variants.length > 0;
});

const displayPrice = computed(() => {
  if (hasVariants.value && props.product.variants) {
    // Find lowest price
    const min = Math.min(...props.product.variants.map((v) => v.price));
    return `From $${min}`;
  }
  return `$${props.product.price}`;
});

function handleAddClick() {
  if (hasVariants.value) {
    showVariants.value = true;
  } else {
    cartStore.addToCart(props.product);
    // Haptic feedback logic could go here
  }
}

function selectVariant(variant: ProductVariant) {
  cartStore.addToCart(props.product, variant);
  showVariants.value = false;
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm flex flex-col h-full relative group transition-transform active:scale-[0.99] border border-transparent dark:border-gray-700"
  >
    <div
      class="h-32 rounded-xl bg-gray-100 dark:bg-gray-700 mb-3 overflow-hidden relative"
    >
      <img
        v-if="product.images?.[0] || product.image"
        :src="product.images?.[0] || product.image"
        alt="Product Image"
        class="w-full h-full object-cover"
        @click="$emit('expand', product)"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-300 text-xs"
      >
        No Image
      </div>

      <!-- Expand Icon (Top Left) -->
      <button
        v-if="product.images?.[0] || product.image"
        @click.stop="$emit('expand', product)"
        class="absolute top-1 left-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span class="text-xs">⤢</span>
      </button>

      <!-- Variant Badge -->
      <div
        v-if="hasVariants"
        class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md"
      >
        {{ product.variants?.length }} Options
      </div>
    </div>

    <div class="flex-grow">
      <h3
        class="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1"
      >
        {{ product.name }}
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {{ product.description }}
      </p>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <span class="font-bold text-gray-900 dark:text-white">{{
        displayPrice
      }}</span>
      <button
        @click.stop="handleAddClick"
        class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm active:scale-95 transition-transform"
      >
        <span class="text-lg leading-none mb-0.5">+</span>
      </button>
    </div>

    <!-- Variant Selector Overlay -->
    <div
      v-if="showVariants"
      class="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 rounded-2xl p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-xl"
      @click.stop
    >
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-sm text-gray-900 dark:text-white"
          >Select Option</span
        >
        <button
          @click="showVariants = false"
          class="text-gray-400 hover:text-black dark:hover:text-white text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div class="flex-grow overflow-y-auto space-y-2 no-scrollbar">
        <button
          v-for="(variant, idx) in product.variants"
          :key="idx"
          @click="selectVariant(variant)"
          class="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded-lg text-sm border border-transparent hover:border-blue-200 dark:hover:border-gray-500 transition-colors"
        >
          <span class="font-medium text-gray-700 dark:text-gray-200">{{
            variant.weight
          }}</span>
          <span class="font-bold text-black dark:text-white"
            >${{ variant.price }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fix for HMR/Vite Cache issue */
</style>
