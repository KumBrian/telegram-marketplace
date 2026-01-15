<script setup lang="ts">
import { useTelegramStore } from "~/stores/telegram";

const telegramStore = useTelegramStore();

onMounted(() => {
  telegramStore.init();
});
</script>

<template>
  <NuxtPage />
</template>
