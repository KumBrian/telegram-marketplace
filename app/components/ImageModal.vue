<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  images: string[];
  initialIndex?: number;
}>();

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex || 0);

function next() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1; // Loop
  }
}

// Keyboard nav
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

// Simple touch swipe support
const touchStartX = ref(0);
const touchEndX = ref(0);

function onTouchStart(e: TouchEvent) {
  if (e.changedTouches && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    if (touch) {
      touchStartX.value = touch.screenX;
    }
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.changedTouches && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    if (touch) {
      touchEndX.value = touch.screenX;
      handleSwipe();
    }
  }
}

function handleSwipe() {
  if (touchEndX.value < touchStartX.value - 50) next();
  if (touchEndX.value > touchStartX.value + 50) prev();
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200"
    @click="$emit('close')"
  >
    <!-- Close Button -->
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 text-white text-4xl leading-none z-50 hover:text-gray-300"
    >
      &times;
    </button>

    <!-- Main Image -->
    <div
      class="w-full h-full flex items-center justify-center p-4 relative"
      @click.stop
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <img
        :src="images[currentIndex]"
        class="max-w-full max-h-full object-contain pointer-events-none select-none transition-opacity duration-300"
      />

      <!-- Navigation Arrows (Desktop) -->
      <button
        v-if="images.length > 1"
        @click="prev"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur hidden md:flex"
      >
        ←
      </button>
      <button
        v-if="images.length > 1"
        @click="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur hidden md:flex"
      >
        →
      </button>
    </div>

    <!-- Dots/Counter -->
    <div
      v-if="images.length > 1"
      class="absolute bottom-8 flex gap-2"
      @click.stop
    >
      <button
        v-for="(_, idx) in images"
        :key="idx"
        @click="currentIndex = idx"
        class="w-2 h-2 rounded-full transition-all"
        :class="currentIndex === idx ? 'bg-white w-4' : 'bg-white/50'"
      ></button>
    </div>
  </div>
</template>
