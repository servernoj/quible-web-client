<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="h-full flex justify-content-center align-items-center">
    <RouterLink :to="{name: 'login'}">
      Login
    </RouterLink>
  </div>
</template>
