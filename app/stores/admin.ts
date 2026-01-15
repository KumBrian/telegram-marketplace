import { defineStore } from "pinia";
import type { IOrder } from "#shared/types";
import api from "~/utils/api";

export const useAdminStore = defineStore("admin", () => {
  const orders = ref<IOrder[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed: Calculate total revenue
  const totalRevenue = computed(() => {
    return orders.value.reduce((sum, order) => sum + order.totalAmount, 0);
  });

  // Computed: Pending orders count
  const pendingCount = computed(() => {
    return orders.value.filter((o) => o.status === "pending").length;
  });

  async function fetchOrders() {
    loading.value = true;
    error.value = null;
    try {
      orders.value = (await api.get(
        "/api/admin/orders"
      )) as unknown as IOrder[];
    } catch (e: any) {
      error.value = e.message || "Failed to fetch orders";
    } finally {
      loading.value = false;
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    // Optimistic update
    const order = orders.value.find((o) => o._id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    order.status = newStatus as any;

    try {
      await api.patch("/api/admin/orders", {
        id: orderId,
        status: newStatus,
      });
    } catch (e: any) {
      // Revert on error
      order.status = oldStatus;
      error.value = e.message || "Failed to update order status";
      throw e; // Re-throw to let UI handle it if needed
    }
  }

  return {
    orders,
    loading,
    error,
    totalRevenue,
    pendingCount,
    fetchOrders,
    updateOrderStatus,
  };
});
