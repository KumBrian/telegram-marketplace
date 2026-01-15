<script setup lang="ts">
import { useAdminProductsStore } from "~/stores/adminProducts";

const props = defineProps<{
  selectable?: boolean;
}>();

const emit = defineEmits(["select"]);

const store = useAdminProductsStore();
const { galleryImages } = storeToRefs(store);

onMounted(() => {
  store.fetchGallery();
});

const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

async function handleUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;

  uploading.value = true;
  try {
    for (const file of files) {
      await store.uploadImage(file);
    }
    await store.fetchGallery(); // Refresh list
  } catch (e: any) {
    alert("Upload failed: " + e.message);
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

function selectImage(url: string) {
  if (props.selectable) {
    emit("select", url);
  }
}
</script>

<template>
  <div
    class="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
  >
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">
        Image Gallery
      </h2>
      <label
        class="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
      >
        {{ uploading ? "Uploading..." : "Upload New" }}
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="hidden"
          @change="handleUpload"
          :disabled="uploading"
        />
      </label>
    </div>

    <div
      class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1"
    >
      <div
        v-for="img in galleryImages"
        :key="img.url"
        class="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 relative group cursor-pointer"
        @click="selectImage(img.url)"
      >
        <img :src="img.url" class="w-full h-full object-cover" />
        <div
          v-if="selectable"
          class="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors"
        >
          <span
            class="opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] px-2 py-1 rounded-full font-bold shadow-sm"
          >
            Select
          </span>
        </div>
      </div>
      <div
        v-if="galleryImages.length === 0"
        class="col-span-full text-center text-gray-400 dark:text-gray-500 text-xs py-8 italic"
      >
        No images uploaded yet.
      </div>
    </div>
  </div>
</template>
