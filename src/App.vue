<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <main class="h-screen">
    <Toast />
    <RouterView />
    <VueQueryDevtools />
  </main>
</template>
