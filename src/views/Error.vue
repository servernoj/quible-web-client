<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const code = route.query.kind ?? '404'
const message = {
  404: (
    route.params.pathMatch
      ? `Page /${route.params.pathMatch} not found`
      : 'Page not found'
  ),
  403: (
    route.query.path
      ? `Unauthorized access to ${route.query.path}`
      : 'Unauthorized access'
  )
}[code as string] ?? 'Unknown error'
</script>

<template>
  <div class="h-full flex flex-column justify-content-center align-items-center">
    <div class="h-10rem" />
    <section class="flex flex-column gap-3 align-items-start">
      <h1 class="text-8xl m-0">
        {{ code }}
      </h1>
      <h1 class="m-0 font-light">
        {{ message }}
      </h1>
    </section>
    <div class="flex-grow-1" />
  </div>
</template>
