<script setup lang="ts">
import Message, { type MessageProps } from 'primevue/message'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios, { AxiosError } from 'axios'

type Result = {
  content: string,
  props: MessageProps
}

const messageDetails = ref<Result>()
const route = useRoute()

onMounted(async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user/activate`,
      { token: route.query.token }
    )
    messageDetails.value = {
      content: 'User has been successfully activated',
      props: {
        severity: 'success'
      }
    }
  } catch (e) {
    const message = (e as AxiosError<{message: string}>)?.response?.data?.message ?? 'unable to complete request'
    messageDetails.value = {
      content: message[0].toUpperCase() + message.slice(1),
      props: {
        severity: 'error'
      }
    }
  }
})

</script>

<template>
  <div class="h-full flex justify-content-center align-items-start p-5">
    <Message v-if="messageDetails" class="w-full" v-bind="messageDetails?.props" :closable="false">
      {{ messageDetails?.content }}
    </Message>
  </div>
</template>
