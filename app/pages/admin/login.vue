<script setup lang="ts">
const password = ref("");
const router = useRouter();

async function handleLogin() {
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { password: password.value },
    });
    router.push("/admin");
  } catch (e) {
    alert("Invalid Password");
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-black dark:text-white"
  >
    <div
      class="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 w-full max-w-md"
    >
      <h1 class="text-2xl font-bold mb-6 text-center">Admin Access</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-bold mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            placeholder="Enter Admin Password"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-lg hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>
