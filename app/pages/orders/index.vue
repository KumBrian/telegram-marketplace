<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTelegramStore } from "~/stores/telegram";
import api from "~/utils/api";

const orders = ref<any[]>([]);
const loading = ref(true);
const uploading = ref<string | null>(null); // orderId being uploaded to

onMounted(async () => {
  await fetchOrders();
});

async function fetchOrders() {
  const WebApp = (await import("@twa-dev/sdk")).default;
  const telegramStore = useTelegramStore();

  // Ensure store is init (idempotent)
  telegramStore.init();

  let initData = telegramStore.initData || WebApp.initData;

  if (!initData && (window as any).Telegram?.WebApp?.initData) {
    initData = (window as any).Telegram.WebApp.initData;
  }

  // Robust parsing handled by telegramStore

  if (!initData) {
    loading.value = false;
    return;
  }

  const payload = btoa(initData);
  try {
    orders.value = await api.get(`/api/orders?payload=${payload}`);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function handleFileUpload(e: Event, orderId: string) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = orderId;
  const formData = new FormData();
  formData.append("file", file);

  try {
    // 1. Upload
    const res = await $fetch("/api/upload-proof", {
      method: "POST",
      body: formData,
    });
    const proofUrl = (res as any).url;

    // 2. Attach
    // 2. Attach
    const WebApp = (await import("@twa-dev/sdk")).default;
    const telegramStore = useTelegramStore();
    let initData = telegramStore.initData || WebApp.initData;

    // Robust fallback for attach proof action
    if (!initData && (window as any).Telegram?.WebApp?.initData) {
      initData = (window as any).Telegram.WebApp.initData;
    }

    const payload = btoa(initData);

    await api.post("/api/orders/attach-proof", {
      payload,
      orderId,
      proofUrl,
    });

    alert("Proof uploaded! Status updated.");
    await fetchOrders();
  } catch (err: any) {
    alert("Upload failed: " + err.message);
  } finally {
    uploading.value = null;
  }
}

function formatDate(dateStr: string) {
  return (
    new Date(dateStr).toLocaleDateString() +
    " " +
    new Date(dateStr).toLocaleTimeString()
  );
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white pb-24"
  >
    <div
      class="p-4 flex items-center gap-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10"
    >
      <NuxtLink
        to="/"
        class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold"
      >
        ← Shop
      </NuxtLink>
      <h1 class="text-xl font-bold">My Orders</h1>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading orders...
    </div>

    <div v-else class="p-4 space-y-4">
      <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
        No orders found.
      </div>

      <div
        v-for="order in orders"
        :key="order._id"
        class="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-xs text-gray-400 font-mono"
              >#{{ order._id.slice(-6) }}</span
            >
            <p class="text-xs text-gray-500">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <div class="text-right">
            <span
              class="inline-block px-2 py-1 rounded text-xs font-bold uppercase"
              :class="{
                'bg-yellow-100 text-yellow-700':
                  order.status.includes('pending'),
                'bg-blue-100 text-blue-700': order.status === 'under_review',
                'bg-green-100 text-green-700':
                  order.status === 'completed' || order.status === 'shipped',
                'bg-red-100 text-red-700': order.status === 'cancelled',
              }"
            >
              {{ order.status.replace("_", " ") }}
            </span>
          </div>
        </div>

        <div class="space-y-2 mb-3">
          <div
            v-for="item in order.items"
            :key="item._id"
            class="flex justify-between text-sm"
          >
            <span class="text-gray-700 dark:text-gray-300"
              >{{ item.quantity }}x {{ item.name }}</span
            >
            <span class="font-bold">${{ item.price * item.quantity }}</span>
          </div>
        </div>

        <div
          class="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between items-center font-bold"
        >
          <span>Total</span>
          <span>${{ order.totalAmount }}</span>
        </div>

        <!-- PAYMENT INFO & PROOF UPLOAD -->
        <div
          v-if="order.paymentMethod"
          class="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm"
        >
          <p class="font-bold text-xs uppercase text-gray-400 mb-1">Payment</p>
          <div class="flex justify-between">
            <span>{{ order.paymentMethod.name }}</span>
            <span
              v-if="order.paymentMethod.network"
              class="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded"
              >{{ order.paymentMethod.network }}</span
            >
          </div>

          <div v-if="order.status === 'pending_proof'" class="mt-3">
            <p class="text-xs text-orange-500 mb-2">
              ⚠️ Payment proof required
            </p>
            <label
              class="block w-full text-center py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg cursor-pointer font-bold relative overflow-hidden"
            >
              <span v-if="uploading === order._id">Uploading...</span>
              <span v-else>Upload Proof</span>
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload($event, order._id)"
                class="absolute inset-0 opacity-0 cursor-pointer"
                :disabled="uploading === order._id"
              />
            </label>
          </div>

          <div v-if="order.paymentProof" class="mt-3">
            <p class="text-xs text-green-500 mb-1">✓ Proof Uploaded</p>
            <a
              :href="order.paymentProof"
              target="_blank"
              class="text-blue-500 text-xs underline"
              >View Proof</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
