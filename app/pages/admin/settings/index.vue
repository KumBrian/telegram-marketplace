<script setup lang="ts">
import { useSettingsStore } from "~/stores/settings";
import { storeToRefs } from "pinia";

const store = useSettingsStore();
const { paymentMethods, shippingMethods, loading } = storeToRefs(store);

onMounted(() => {
  store.fetchSettings();
});

// Forms
const newPayment = ref({
  name: "",
  walletAddress: "",
  network: "",
  description: "",
});

const newShipping = ref({
  name: "",
  price: 0,
  estimatedTime: "",
});

async function handleAddPayment() {
  if (!newPayment.value.name || !newPayment.value.walletAddress)
    return alert("Name and Address required");
  try {
    await store.addPaymentMethod({ ...newPayment.value });
    newPayment.value = {
      name: "",
      walletAddress: "",
      network: "",
      description: "",
    };
  } catch (e: any) {
    alert(e.message);
  }
}

async function handleAddShipping() {
  if (!newShipping.value.name) return alert("Name required");
  try {
    await store.addShippingMethod({ ...newShipping.value });
    newShipping.value = { name: "", price: 0, estimatedTime: "" };
  } catch (e: any) {
    alert(e.message);
  }
}

const uploadingLogo = ref(false);
async function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploadingLogo.value = true;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await $fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    // The upload endpoint returns { urls: string[] }
    if ((res as any).urls && (res as any).urls.length > 0) {
      store.shopSettings.logoUrl = (res as any).urls[0];
    }
  } catch (e: any) {
    alert("Upload failed: " + e.message);
  } finally {
    uploadingLogo.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto text-gray-900 dark:text-white">
    <div
      class="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4"
    >
      <NuxtLink
        to="/admin"
        class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        ← Back
      </NuxtLink>
      <h1 class="text-2xl font-bold">Store Settings</h1>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      Loading settings...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- GENERAL SETTINGS -->
      <section class="md:col-span-2">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🏪</span> General Settings
        </h2>
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold mb-2">Store Name</label>
              <input
                v-model="store.shopSettings.storeName"
                class="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                placeholder="My Awesome Shop"
              />
            </div>
            <div>
              <label class="block text-sm font-bold mb-2">Logo</label>

              <!-- Preview -->
              <div v-if="store.shopSettings.logoUrl" class="mb-2">
                <img
                  :src="store.shopSettings.logoUrl"
                  class="h-12 w-auto object-contain border rounded bg-gray-50 dark:bg-black"
                />
              </div>

              <div class="flex gap-2">
                <input
                  v-model="store.shopSettings.logoUrl"
                  class="flex-1 text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  placeholder="https://example.com/logo.png"
                />
                <label
                  class="relative cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center min-w-[100px]"
                >
                  <span v-if="uploadingLogo" class="text-xs font-bold"
                    >Uploading...</span
                  >
                  <span v-else class="text-xs font-bold">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="handleLogoUpload"
                    :disabled="uploadingLogo"
                  />
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Paste a URL or upload an image.
              </p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              @click="
                store.updateShopSettings(
                  store.shopSettings.storeName,
                  store.shopSettings.logoUrl
                )
              "
              class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-blue-700"
            >
              Save General Settings
            </button>
          </div>
        </div>
      </section>

      <!-- PAYMENT METHODS -->
      <section>
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💳</span> Payment Methods (Crypto)
        </h2>

        <div class="space-y-4 mb-6">
          <div
            v-for="pm in paymentMethods"
            :key="pm._id"
            class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group"
          >
            <h3 class="font-bold">
              {{ pm.name }}
              <span
                v-if="pm.network"
                class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded ml-1"
                >{{ pm.network }}</span
              >
            </h3>
            <p
              class="text-xs text-gray-500 dark:text-gray-400 break-all font-mono mt-1"
            >
              {{ pm.walletAddress }}
            </p>
            <p v-if="pm.description" class="text-xs text-gray-400 mt-1">
              {{ pm.description }}
            </p>

            <button
              @click="store.deletePaymentMethod(pm._id)"
              class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              Delete
            </button>
          </div>

          <div
            v-if="paymentMethods.length === 0"
            class="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400"
          >
            No payment methods configured.
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-sm font-bold mb-3">Add New Method</h3>
          <div class="space-y-2">
            <input
              v-model="newPayment.name"
              placeholder="Name (e.g. Bitcoin)"
              class="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              v-model="newPayment.walletAddress"
              placeholder="Wallet Address"
              class="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-mono"
            />
            <input
              v-model="newPayment.network"
              placeholder="Network (Optional, e.g. TRC20)"
              class="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              @click="handleAddPayment"
              class="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-lg text-sm hover:opacity-90"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </section>

      <!-- SHIPPING METHODS -->
      <section>
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📦</span> Shipping Methods
        </h2>

        <div class="space-y-4 mb-6">
          <div
            v-for="sm in shippingMethods"
            :key="sm._id"
            class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group"
          >
            <div class="flex justify-between items-start">
              <h3 class="font-bold">{{ sm.name }}</h3>
              <span class="font-bold">${{ sm.price }}</span>
            </div>
            <p
              v-if="sm.estimatedTime"
              class="text-xs text-gray-500 dark:text-gray-400 mt-1"
            >
              Est. Time: {{ sm.estimatedTime }}
            </p>

            <button
              @click="store.deleteShippingMethod(sm._id)"
              class="absolute top-10 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              Delete
            </button>
          </div>

          <div
            v-if="shippingMethods.length === 0"
            class="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400"
          >
            No shipping methods configured.
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-sm font-bold mb-3">Add New Method</h3>
          <div class="space-y-2">
            <input
              v-model="newShipping.name"
              placeholder="Name (e.g. Express)"
              class="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <div class="flex gap-2">
              <input
                v-model.number="newShipping.price"
                type="number"
                placeholder="Price ($)"
                class="w-1/2 text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <input
                v-model="newShipping.estimatedTime"
                placeholder="Time (e.g. 2 days)"
                class="w-1/2 text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              @click="handleAddShipping"
              class="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-lg text-sm hover:opacity-90"
            >
              Add Shipping Method
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
