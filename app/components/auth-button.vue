<script lang="ts" setup>
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <details v-if="!authStore.loading && authStore.user" class="dropdown dropdown-end">
    <summary class="btn m-1">
      <div v-if="authStore.user.image" class="avatar">
        <div class="w-8 rounded-full">
          <img :src="authStore.user.image" :alt="authStore.user.name">
        </div>
      </div>
      {{ authStore.user.name }}
    </summary>
    <ul class="menu dropdown-content bg-base-200 border-1 border-white rounded-box z-1 w-52 p-2 mt-3 shadow-sm">
      <li>
        <NuxtLink to="/sign-out">
          <Icon name="tabler:logout-2" size="24" />
          Sign Out
        </NuxtLink>
      </li>
    </ul>
  </details>

  <button v-else :disabled="authStore.loading" class="btn btn-accent" @click="authStore.signIn">
    Sing In With Github
    <span v-if="authStore.loading" class="loading loading-spinner loading-md" />
    <Icon v-else name="tabler:brand-github" size="24" />
  </button>
</template>
