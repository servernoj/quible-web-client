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
  <div class="message-container flex align-items-start gap-3 w-full p-2">
    <img
      v-if="props.image"
      :src="props.image"
      class="w-3rem"
      :data-timestamp="props.timestamp"
    >
    <img v-else src="@/assets/avatar-svgrepo-com.svg" class="w-3rem">
    <article class="flex flex-column align-items-start gap-2">
      <section class="flex align-items-center">
        <h3 class="m-0">
          {{ props.name }}
        </h3>
        <small class="ml-2 text-gray-400">{{ props.timestamp }}</small>
      </section>
      <p class="m-0">
        {{ props.text }}
      </p>
    </article>
  </div>
</template>

<style lang="scss" scoped>
  .message-container {
    &:hover {
      background-color: rgba(255,255,255,0.2);
      border-radius: 5px;
    }
    &.my-message {
      .content > .header > .name {
        color: var(--cyan-100)
      }
    }
  }
</style>
