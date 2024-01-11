<script setup lang="ts">
const props = defineProps<{
  userId: string
  name: string
  timestamp: string
  text: string
  image: string | null
}>()
</script>

<template>
  <div class="flex align-items-start gap-3 w-full p-2 hover:surface-50 border-round-xl">
    <article class="w-4rem h-4rem flex justify-content-center align-items-center surface-50 border-round-xl shadow-8">
      <img
        v-if="props.image"
        :src="props.image"
        class="w-3rem border-round-xl"
        :data-timestamp="props.timestamp"
      >
      <img v-else src="@/assets/avatar-svgrepo-com.svg" class="w-3rem border-round-xl">
    </article>
    <article class="flex flex-column align-items-start gap-2">
      <section class="flex align-items-center">
        <h3 class="name m-0 text-cyan-100">
          {{ props.name }}
        </h3>
        <small class="ml-2 text-gray-600">{{ props.timestamp }}</small>
      </section>
      <p class="m-0 text-gray-400">
        {{ props.text }}
      </p>
    </article>
  </div>
</template>

<style lang="scss" scoped>
  .my-message .name {
    color: var(--cyan-400) !important;
  }
</style>
