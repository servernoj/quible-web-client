<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import queryClient from '@/queryClient'
</script>

<template>
  <main class="h-screen">
    <Toast />
    <RouterView />
    <VueQueryDevtools :client="queryClient" />
  </main>
</template>
