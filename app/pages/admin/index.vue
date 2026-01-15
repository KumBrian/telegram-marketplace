<script setup lang="ts">
import type { OrderItem } from "#shared/types";
import { useAdminStore } from "~/stores/admin";
import { storeToRefs } from "pinia";
import api from "~/utils/api";

const adminStore = useAdminStore();
const { orders, totalRevenue, pendingCount } = storeToRefs(adminStore);

const selectedOrder = ref<any>(null);

function openReview(order: any) {
  selectedOrder.value = order;
}

async function updateStatus(orderId: string, status: string) {
  if (!confirm(`Change status to ${status}?`)) return;
  try {
    await adminStore.updateOrderStatus(orderId, status);
    selectedOrder.value = null; // Close modal
  } catch (e: any) {
    alert(e.message);
  }
}

// Fetch orders on mount
onMounted(() => {
  adminStore.fetchOrders();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatItems = (items: OrderItem[]) => {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const currentQty = map.get(item.name) || 0;
    map.set(item.name, currentQty + item.quantity);
  });

  const parts: string[] = [];
  map.forEach((qty, name) => {
    parts.push(`${qty}x ${name}`);
  });

  return parts.join(", ");
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-white pb-20"
  >
    <div
      class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm"
    >
      <h1 class="text-xl font-bold flex items-center gap-2">
        <span
          class="bg-black dark:bg-white text-white dark:text-black px-2 rounded text-sm"
          >ADMIN</span
        >
        Dashboard
      </h1>
      <button
        @click="adminStore.fetchOrders()"
        class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        Refresh ⟳
      </button>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/settings"
          class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          ⚙️ Settings
        </NuxtLink>
        <NuxtLink
          to="/admin/products"
          class="bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black dark:hover:bg-gray-700 transition"
        >
          Manage Products
        </NuxtLink>
      </div>
    </div>

    <div class="max-w-6xl mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1"
          >
            Total Revenue
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            ${{ totalRevenue.toLocaleString() }}
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1"
          >
            Total Orders
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ orders?.length || 0 }}
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1"
          >
            Pending
          </div>
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
            {{ pendingCount }}
          </div>
        </div>
      </div>

      <h2 class="text-xl font-bold mb-4">Orders</h2>
      <div class="overflow-x-auto">
        <table
          class="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-collapse"
        >
          <thead
            class="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 text-sm uppercase text-gray-500"
          >
            <tr>
              <th class="p-4">Customer</th>
              <th class="p-4">Items</th>
              <th class="p-4">Status</th>
              <th class="p-4">Total</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto"
          >
            <tr v-if="orders.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-400">
                No orders yet.
              </td>
            </tr>
            <tr
              v-for="order in orders"
              :key="order._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="p-4">
                <div class="font-bold text-sm text-gray-900 dark:text-white">
                  {{
                    order.telegramUserName ||
                    order.shippingAddress?.fullName ||
                    "Unknown"
                  }}
                </div>
                <div class="text-xs text-gray-400">
                  ID: {{ order.telegramUserId }}
                </div>
              </td>
              <td
                class="p-4 max-w-xs text-sm text-gray-600 dark:text-gray-400 truncate"
                :title="formatItems(order.items)"
              >
                {{ formatItems(order.items) }}
              </td>
              <td class="p-4">
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-bold uppercase"
                  :class="{
                    'bg-yellow-100 text-yellow-700':
                      order.status.includes('pending'),
                    'bg-blue-100 text-blue-700':
                      order.status === 'under_review',
                    'bg-green-100 text-green-700':
                      order.status === 'completed' ||
                      order.status === 'shipped' ||
                      order.status === 'paid',
                    'bg-red-100 text-red-700': order.status === 'cancelled',
                  }"
                >
                  {{ order.status.replace("_", " ") }}
                </span>
              </td>
              <td class="p-4 font-bold text-gray-900 dark:text-gray-100">
                ${{ order.totalAmount }}
              </td>
              <td class="p-4 text-right">
                <button
                  @click="openReview(order)"
                  class="text-sm font-bold bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded hover:opacity-80"
                >
                  {{ order.status === "under_review" ? "Review" : "Manage" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- REVIEW MODAL -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      @click="selectedOrder = null"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        @click.stop
      >
        <div
          class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
        >
          <h3 class="font-bold">
            Order Details #{{ selectedOrder._id.slice(-6) }}
          </h3>
          <button
            @click="selectedOrder = null"
            class="text-gray-400 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6">
          <!-- Items -->
          <section>
            <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">
              Items
            </h4>
            <div
              v-for="item in selectedOrder.items"
              :key="item._id"
              class="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span class="font-bold">${{ item.price * item.quantity }}</span>
            </div>
          </section>

          <!-- Shipping -->
          <section v-if="selectedOrder.shippingAddress">
            <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">
              Shipping
            </h4>
            <div class="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p class="font-bold">
                {{ selectedOrder.shippingAddress.fullName }}
              </p>
              <p>{{ selectedOrder.shippingAddress.address }}</p>
              <p>
                {{ selectedOrder.shippingAddress.city }},
                {{ selectedOrder.shippingAddress.country }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Phone: {{ selectedOrder.shippingAddress.phone }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Method: {{ selectedOrder.shippingMethod?.name }} (${{
                  selectedOrder.shippingMethod?.price
                }})
              </p>
            </div>
          </section>

          <!-- Payment -->
          <section v-if="selectedOrder.paymentMethod">
            <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">
              Payment
            </h4>
            <div class="text-sm">
              <p>
                Method:
                <span class="font-bold">{{
                  selectedOrder.paymentMethod.name
                }}</span>
                {{ selectedOrder.paymentMethod.network }}
              </p>
              <p class="text-xs text-gray-500 font-mono mt-1 break-all">
                {{ selectedOrder.paymentMethod.walletAddress }}
              </p>
            </div>
          </section>

          <!-- Proof -->
          <section v-if="selectedOrder.paymentProof">
            <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">
              Payment Proof
            </h4>
            <a
              :href="selectedOrder.paymentProof"
              target="_blank"
              class="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90"
            >
              <img
                :src="selectedOrder.paymentProof"
                class="w-full h-48 object-cover"
              />
            </a>
          </section>
          <section v-else>
            <div
              class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded text-sm text-center"
            >
              ⚠️ No payment proof uploaded yet.
            </div>
          </section>
        </div>

        <!-- Actions -->
        <div
          class="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50"
        >
          <div class="flex gap-2">
            <button
              @click="updateStatus(selectedOrder._id, 'paid')"
              class="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Mark Paid
            </button>
            <button
              @click="updateStatus(selectedOrder._id, 'shipped')"
              class="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Mark Shipped
            </button>
          </div>

          <div class="flex gap-2">
            <button
              @click="updateStatus(selectedOrder._id, 'pending_proof')"
              class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Retry Proof
            </button>
            <button
              @click="updateStatus(selectedOrder._id, 'cancelled')"
              class="flex-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
