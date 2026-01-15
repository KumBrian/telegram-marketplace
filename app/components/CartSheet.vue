<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "~/stores/cart";
import { useSettingsStore } from "~/stores/settings";

const cartStore = useCartStore();
const { cart, isSheetOpen, cartTotal } = storeToRefs(cartStore);
const { addToCart, removeFromCart } = cartStore;

const settingsStore = useSettingsStore();
const { paymentMethods, shippingMethods } = storeToRefs(settingsStore);

const emit = defineEmits(["submitOrder", "updateMainButton"]);

const step = ref<"cart" | "shipping" | "payment">("cart");

// Address Form
const address = ref({
  fullName: "",
  address: "",
  city: "",
  country: "",
  zipCode: "",
  phone: "",
});

const selectedShippingId = ref("");
const selectedPaymentId = ref("");

// Computed
const selectedShippingMethod = computed(() =>
  shippingMethods.value.find((m) => m._id === selectedShippingId.value)
);
const selectedPaymentMethod = computed(() =>
  paymentMethods.value.find((m) => m._id === selectedPaymentId.value)
);

const grandTotal = computed(() => {
  let total = cartTotal.value;
  if (selectedShippingMethod.value) {
    total += selectedShippingMethod.value.price;
  }
  return total;
});

// Watch sheet open to reset or fetch data
watch(isSheetOpen, (isOpen) => {
  if (isOpen) {
    step.value = "cart";
    settingsStore.fetchSettings();
    updateMainButton();
  } else {
    // Reset?
  }
});

watch(step, () => {
  updateMainButton();
});

function updateMainButton() {
  let text = "CHECKOUT";
  if (step.value === "cart") text = "PROCEED TO SHIPPING";
  if (step.value === "shipping") text = "PROCEED TO PAYMENT";
  if (step.value === "payment") text = `PAY $${grandTotal.value} (CRYPTO)`;

  emit("updateMainButton", { text, isVisible: cart.value.length > 0 });
}

const proofUrl = ref("");
const uploadingProof = ref(false);

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploadingProof.value = true;
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Assuming we have a general upload endpoint or reusing admin/upload?
    // We created /api/upload-proof earlier!
    const res = await $fetch("/api/upload-proof", {
      method: "POST",
      body: formData,
    });
    proofUrl.value = (res as any).url;
  } catch (err: any) {
    alert("Upload failed: " + err.message);
  } finally {
    uploadingProof.value = false;
  }
}

function copyAddress(text: string) {
  navigator.clipboard.writeText(text);
  alert("Address copied!");
}

function handleMainButtonClick() {
  if (step.value === "cart") {
    if (cart.value.length === 0) return;
    step.value = "shipping";
    return;
  }

  if (step.value === "shipping") {
    if (
      !address.value.fullName ||
      !address.value.address ||
      !address.value.city
    ) {
      alert("Please fill in address details.");
      return;
    }
    if (!selectedShippingId.value) {
      alert("Please select a shipping method.");
      return;
    }
    step.value = "payment";
    return;
  }

  if (step.value === "payment") {
    if (!selectedPaymentId.value) {
      alert("Please select a payment method.");
      return;
    }
    // Optional: Enforce proof upload?
    // If not uploaded, status will be pending_proof. If uploaded, under_review.

    emit("submitOrder", {
      cartItems: cart.value,
      shippingAddress: address.value,
      shippingMethod: selectedShippingMethod.value,
      paymentMethod: selectedPaymentMethod.value,
      paymentProof: proofUrl.value,
    });
  }
}

defineExpose({ handleMainButtonClick });

function close() {
  isSheetOpen.value = false;
}

function goBack() {
  if (step.value === "payment") step.value = "shipping";
  else if (step.value === "shipping") step.value = "cart";
  else close();
}
</script>

<template>
  <div
    v-if="isSheetOpen"
    class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
    @click="close"
  ></div>

  <div
    class="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl transform transition-transform duration-300 flex flex-col h-[85vh] bg-white dark:bg-gray-900 text-black dark:text-white"
    :class="isSheetOpen ? 'translate-y-0' : 'translate-y-full'"
  >
    <div class="w-full flex justify-center pt-3 pb-1" @click="close">
      <div
        class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 opacity-50"
      ></div>
    </div>

    <div
      class="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
    >
      <div class="flex items-center gap-2">
        <button
          v-if="step !== 'cart'"
          @click="goBack"
          class="text-sm font-bold"
        >
          ←
        </button>
        <h2 class="text-lg font-bold">
          {{
            step === "cart"
              ? "Your Cart"
              : step === "shipping"
              ? "Shipping"
              : "Payment"
          }}
        </h2>
      </div>
      <button @click="close" class="text-sm opacity-60 font-medium">
        Close
      </button>
    </div>

    <div class="overflow-y-auto p-4 space-y-4 flex-grow relative">
      <!-- STEP 1: CART -->
      <div v-if="step === 'cart'" class="space-y-4">
        <div v-if="cart.length === 0" class="p-8 text-center opacity-50">
          Your cart is empty
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in cart" :key="item._id" class="flex gap-4">
            <div
              class="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0"
            >
              <img
                :src="item.image"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div class="flex-grow flex flex-col justify-between">
              <div class="flex justify-between">
                <span class="font-semibold text-sm line-clamp-1">{{
                  item.name
                }}</span>
                <span class="font-bold text-sm"
                  >${{ item.price * item.quantity }}</span
                >
              </div>
              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="removeFromCart(item._id)"
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white"
                >
                  -
                </button>
                <span class="text-sm font-medium">{{ item.quantity }}</span>
                <button
                  @click="addToCart(item)"
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: SHIPPING -->
      <div v-if="step === 'shipping'" class="space-y-6">
        <section>
          <h3 class="font-bold text-sm mb-3 uppercase text-gray-400">
            Shipping Address
          </h3>
          <div class="space-y-3">
            <input
              v-model="address.fullName"
              placeholder="Full Name"
              class="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
            />
            <input
              v-model="address.address"
              placeholder="Address"
              class="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
            />
            <div class="flex gap-3">
              <input
                v-model="address.city"
                placeholder="City"
                class="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
              />
              <input
                v-model="address.country"
                placeholder="Country"
                class="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
              />
            </div>
            <div class="flex gap-3">
              <input
                v-model="address.zipCode"
                placeholder="ZIP Code"
                class="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
              />
              <input
                v-model="address.phone"
                placeholder="Phone"
                class="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 class="font-bold text-sm mb-3 uppercase text-gray-400">
            Shipping Method
          </h3>
          <div class="space-y-2">
            <div
              v-for="method in shippingMethods"
              :key="method._id"
              @click="selectedShippingId = method._id"
              class="p-3 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors"
              :class="
                selectedShippingId === method._id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent bg-gray-50 dark:bg-gray-800'
              "
            >
              <div>
                <p class="font-bold text-sm">{{ method.name }}</p>
                <p class="text-xs text-gray-500">{{ method.estimatedTime }}</p>
              </div>
              <span class="font-bold">${{ method.price }}</span>
            </div>
            <div
              v-if="shippingMethods.length === 0"
              class="text-sm text-gray-400 text-center"
            >
              No shipping methods available
            </div>
          </div>
        </section>
      </div>

      <!-- STEP 3: PAYMENT -->
      <div v-if="step === 'payment'" class="space-y-6">
        <section>
          <h3 class="font-bold text-sm mb-3 uppercase text-gray-400">
            Payment Method
          </h3>
          <div class="space-y-2">
            <div
              v-for="method in paymentMethods"
              :key="method._id"
              @click="selectedPaymentId = method._id"
              class="p-3 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors"
              :class="
                selectedPaymentId === method._id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent bg-gray-50 dark:bg-gray-800'
              "
            >
              <div>
                <p class="font-bold text-sm">
                  {{ method.name }}
                  <span
                    v-if="method.network"
                    class="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded"
                    >{{ method.network }}</span
                  >
                </p>
              </div>
            </div>
            <div
              v-if="paymentMethods.length === 0"
              class="text-sm text-gray-400 text-center"
            >
              No payment methods available
            </div>
          </div>
        </section>

        <section
          v-if="selectedPaymentMethod"
          class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3"
        >
          <div>
            <p class="text-xs text-gray-500 uppercase mb-1">
              Send {{ selectedPaymentMethod.network }} to:
            </p>
            <div class="flex items-center gap-2">
              <p
                class="font-mono text-xs break-all bg-white dark:bg-black p-2 rounded border border-gray-200 dark:border-gray-700 flex-grow"
              >
                {{ selectedPaymentMethod.walletAddress }}
              </p>
              <button
                @click="copyAddress(selectedPaymentMethod.walletAddress)"
                class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-2 rounded font-bold"
              >
                COPY
              </button>
            </div>
          </div>

          <div>
            <p class="text-xs text-gray-500 uppercase mb-1">
              Payment Proof (Screenshot)
            </p>
            <div
              v-if="!proofUrl"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center relative hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span
                v-if="uploadingProof"
                class="text-sm font-bold animate-pulse"
                >Uploading...</span
              >
              <span v-else class="text-sm text-gray-500"
                >Tap to upload screenshot</span
              >
            </div>
            <div v-else class="relative">
              <img
                :src="proofUrl"
                class="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
              <button
                @click="proofUrl = ''"
                class="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </section>

        <section class="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-500">Subtotal</span>
            <span>${{ cartTotal }}</span>
          </div>
          <div
            class="flex justify-between text-sm mb-1"
            v-if="selectedShippingMethod"
          >
            <span class="text-gray-500">Shipping</span>
            <span>${{ selectedShippingMethod.price }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold mt-2">
            <span>Total</span>
            <span>${{ grandTotal }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
