import { defineStore } from "pinia";
import type { OrderItem } from "#shared/types";

// Helper to calculate total price
// We'll trust the items have price and quantity
export const useCartStore = defineStore("cart", () => {
  const cart = ref<OrderItem[]>([]);
  const isSheetOpen = ref(false);

  const cartCount = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return cart.value.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  });

  function addToCart(
    product: any,
    variant?: { weight: string; price: number }
  ) {
    // If no variant passed but product has variants, use first one?
    // Ideally UI should enforce variant selection.
    // For now assuming `variant` is passed if needed.

    // Composite key if variant exists
    const variantLabel = variant ? `-${variant.weight}` : "";
    const itemId = (product._id || product.id) + variantLabel;

    // Price to use
    const price = variant ? variant.price : product.price;
    const name = variant ? `${product.name} (${variant.weight})` : product.name;

    const existingItem = cart.value.find(
      (item: any) => item._itemId === itemId
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.value.push({
        _id: product._id || product.id, // Keep reference to product ID
        _itemId: itemId, // Unique composite ID for cart logic
        name: name,
        price: price,
        image: product.images?.[0] || product.image,
        quantity: 1,
      } as any);
    }
  }

  function removeFromCart(itemId: string) {
    const index = cart.value.findIndex(
      (item: any) => item._itemId === itemId || item._id === itemId
    );
    if (index !== -1) {
      const item = cart.value[index];
      if (!item) return;

      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.value.splice(index, 1);
      }
    }
  }

  function clearCart() {
    cart.value = [];
  }

  return {
    cart,
    isSheetOpen,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
  };
});
