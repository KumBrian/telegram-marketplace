<script setup lang="ts">
// app/pages/index.vue
import { storeToRefs } from "pinia";
import ImageModal from "~/components/ImageModal.vue";
import { useCartStore } from "~/stores/cart";
import { useTelegramStore } from "~/stores/telegram";
import { useProductsStore } from "~/stores/products";
import { useCategoriesStore } from "~/stores/categories";
import { useShopStore } from "~/stores/shop";
import api from "~/utils/api";

const telegramStore = useTelegramStore();
const shopStore = useShopStore();

const productsStore = useProductsStore();
const { products } = storeToRefs(productsStore);

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);

const cartStore = useCartStore();
const { isSheetOpen, cart, cartCount, cartTotal } = storeToRefs(cartStore);

const selectedCategory = ref("");

// Fetch products and categories on mount
onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    categoriesStore.fetchCategories(),
    shopStore.fetchShopSettings(),
  ]);
});

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter((p) => {
    // Handle both populated object and ID string
    const pCatId = (p.category as any)?._id || p.category;
    return pCatId === selectedCategory.value;
  });
});

type TelegramWebApp = typeof import("@twa-dev/sdk").default;
let _tg: TelegramWebApp | null = null;

const cartSheetRef = ref();

onMounted(async () => {
  const WebApp = (await import("@twa-dev/sdk")).default;
  _tg = WebApp;
  _tg.ready();
  _tg.expand();
  // Ensure MainButton defaults
  updateMainButtonState({ text: "CHECKOUT", isVisible: cart.value.length > 0 });

  _tg.onEvent("mainButtonClicked", () => {
    if (!isSheetOpen.value) {
      isSheetOpen.value = true;
    } else {
      // Delegate to CartSheet
      cartSheetRef.value?.handleMainButtonClick();
    }
  });
});

// Watch cart to show initial button if sheet is closed
watch(
  cart,
  () => {
    if (!isSheetOpen.value && _tg) {
      // Default state when closed
      updateMainButtonState({
        text: "CHECKOUT",
        isVisible: cart.value.length > 0,
      });
    }
  },
  { deep: true }
);

function updateMainButtonState(state: { text: string; isVisible: boolean }) {
  if (!_tg) return;
  _tg.MainButton.setText(state.text);
  if (state.isVisible) _tg.MainButton.show();
  else _tg.MainButton.hide();
}
async function handleSubmitOrder(orderData: any) {
  if (!_tg) return;
  _tg.MainButton.showProgress();

  // Use centralized store data
  let rawInitData = telegramStore.initData;

  // Fallback: Check window directly (sometimes wrapper is stale) if store empty
  if (!rawInitData && (window as any).Telegram?.WebApp?.initData) {
    rawInitData = (window as any).Telegram.WebApp.initData;
  }

  // Try directly from sdk instance if available locally (as last resort, though store should catch it)
  if (!rawInitData && _tg.initData) {
    rawInitData = _tg.initData;
  }

  if (!rawInitData) {
    _tg.MainButton.hideProgress();
    alert("Error: Telegram InitData is missing. Please restart the bot.");
    return;
  }

  // Payload now includes everything
  const payload = btoa(rawInitData);

  try {
    const { cartItems, shippingAddress, shippingMethod, paymentMethod } =
      orderData;

    await api.post("/api/orders", {
      payload,
      cartItems,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      paymentProof: orderData.paymentProof,
    });

    _tg.MainButton.hideProgress();
    isSheetOpen.value = false;
    cartStore.clearCart();
    _tg.showPopup({
      title: "Order Placed",
      message: "Please upload your payment proof in the Order History.",
      buttons: [{ type: "ok" }],
    });
    // TODO: Navigate to Order History
  } catch (e: any) {
    _tg.MainButton.hideProgress();
    alert("Error: " + e.message);
  }
}
// Image Modal State
const showModal = ref(false);
const modalImages = ref<string[]>([]);

function openImageModal(product: any) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  if (images.length > 0 && images[0]) {
    modalImages.value = images;
    showModal.value = true;
  }
}

function closeModal() {
  showModal.value = false;
}
</script>

<template>
  <div
    class="min-h-screen pb-24 font-sans"
    style="
      background-color: var(--tg-theme-bg-color, #fff);
      color: var(--tg-theme-text-color, #000);
    "
  >
    <div
      class="sticky top-0 z-40 px-4 py-3 flex justify-between items-center backdrop-blur-md shadow-sm border-b"
      style="
        color: var(--tg-theme-text-color, #000);
        background-color: var(--tg-theme-bg-color, #fff);
        border-color: var(--tg-theme-section-separator-color, #eee);
      "
    >
      <div class="flex items-center gap-2">
        <img
          v-if="shopStore.logo"
          :src="shopStore.logo"
          alt="Logo"
          class="h-8 w-auto object-contain"
        />
        <h1 v-else class="text-xl font-bold tracking-tight">
          {{ shopStore.name }}
        </h1>
      </div>

      <div class="flex items-center">
        <NuxtLink
          to="/orders"
          class="text-sm font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200 ml-2"
          >My Orders</NuxtLink
        >
      </div>

      <button
        @click="isSheetOpen = true"
        class="flex items-center gap-2 px-3 py-2 rounded-full active:scale-95 transition-all"
        style="background-color: var(--tg-theme-secondary-bg-color, #f5f5f5)"
      >
        <span v-if="cartTotal > 0" class="text-sm font-bold"
          >${{ cartTotal }}</span
        >

        <div class="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>

          <span
            v-if="cartCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white"
          >
            {{ cartCount }}
          </span>
        </div>
      </button>
    </div>

    <div class="px-3 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
      <button
        @click="selectedCategory = ''"
        class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
        :class="
          !selectedCategory
            ? 'bg-black text-white'
            : 'bg-gray-100 text-gray-700'
        "
      >
        All
      </button>
      <button
        v-for="cat in categories"
        :key="cat._id"
        @click="selectedCategory = cat._id"
        class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
        :class="
          selectedCategory === cat._id
            ? 'bg-black text-white'
            : 'bg-gray-100 text-gray-700'
        "
      >
        {{ cat.name }}
      </button>
    </div>

    <div class="p-3 pb-24">
      <div
        v-show="!selectedCategory"
        class="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product._id.toString()"
            :product="product"
            @expand="openImageModal"
          />
        </div>
        <div
          v-if="filteredProducts.length === 0"
          class="text-center py-12 text-gray-500"
        >
          No products found.
        </div>
      </div>

      <div v-for="cat in categories" :key="cat._id">
        <div
          v-show="selectedCategory === cat._id"
          class="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product._id.toString()"
              :product="product"
              @expand="openImageModal"
            />
          </div>
          <div
            v-if="filteredProducts.length === 0"
            class="text-center py-12 text-gray-500"
          >
            No products found in this category.
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal
      v-if="showModal"
      :images="modalImages"
      :initial-index="0"
      @close="closeModal"
    />

    <CartSheet
      ref="cartSheetRef"
      @updateMainButton="updateMainButtonState"
      @submitOrder="handleSubmitOrder"
    />
  </div>
</template>
```
