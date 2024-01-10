<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="h-full flex flex-column gap-3 justify-content-center align-items-center">
    <RouterLink :to="{name: 'login'}">
      Login
    </RouterLink>
    <RouterLink :to="{name: 'live'}">
      Live
    </RouterLink>
    <RouterLink :to="{name: 'error', query: {kind: 401}}">
      Error
    </RouterLink>
  </div>
</template>
