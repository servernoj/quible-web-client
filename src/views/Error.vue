<script setup lang="ts">
import { useRoute } from 'vue-router'
import Card from 'primevue/card'
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
}[code as string] ?? ''
</script>

<template>
  <div class="h-full flex flex-column justify-content-center align-items-center">
    <div class="h-10rem" />
    <Card class="p-3">
      <template #title>
        Error {{ code }}
      </template>
      <template #content>
        {{ message }}
      </template>
    </Card>
    <div class="flex-grow-1" />
  </div>
</template>
