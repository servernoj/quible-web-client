<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import * as Ably from 'ably'
import { getAccessToken } from '@/bridge'
import useAbly from '@/composables/ably'
import type { MessageItem, User } from '@/types/chat'
import queryClient from '@/queryClient'
import axios from 'axios'
import Message from '@/components/message.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

const messages = ref<MessageItem[]>([])
const messageContainer = ref<HTMLElement|null>(null)
const me = ref<User|null>(null)
const input = ref('')

const getUser = async (userId: string | undefined) => {
  const token = await getAccessToken()
  const data = await queryClient.fetchQuery({
    queryKey: ['user', userId],
    staleTime: userId ? Infinity : 0,
    retry: false,
    queryFn: () => axios<User | null>({
      method: 'GET',
      url: userId
        ? `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user/${userId}/profile`
        : `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(
      ({ data }) => data,
      () => null
    )
  })
  return data
}

const onMessage = async (message: Ably.Types.Message) => {
  const user = await getUser(message.clientId)
  if (user) {
    messages.value.push({
      userId: user.id,
      name: user.full_name,
      image: user.image,
      timestamp: message.timestamp,
      text: message.data
    })
    nextTick(() => {
      const el = messageContainer.value
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    })
  }
}

const historyHandler = async (historyItems: Ably.Types.Message[]) => {
  messages.value = await historyItems.reverse().reduce(
    async (acc, message) => {
      const racc = await acc
      const user = await getUser(message.clientId).catch(() => null)
      if (user) {
        racc.push({
          userId: user.id,
          name: user.full_name,
          image: user.image,
          timestamp: message.timestamp,
          text: message.data
        })
      }
      return racc
    },
    Promise.resolve([] as MessageItem[])
  )
  nextTick(() => {
    const el = messageContainer.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

const isLoading = ref(false)

const { channel, realtime } = useAbly({
  isLoading,
  channelName: 'chat:main',
  eventName: 'message',
  history: {
    timeMills: 20 * 60 * 1000,
    handler: historyHandler
  },
  tokenOrGetToken: getAccessToken,
  onMessage
})

const onSend = async () => {
  await channel.value?.publish('message', input.value)
  input.value = ''
}

onMounted(async () => {
  me.value = await getUser(realtime.value?.auth.clientId ?? '')
})

</script>

<template>
  <div class="h-full flex flex-column p-2 gap-2">
    <nav class="flex h-3rem align-items-center surface-0 p-2">
      <Skeleton v-if="isLoading" height="2rem" width="50%" />
      <h3 v-else class="m-0">
        {{ me?.full_name ?? "" }}
      </h3>
    </nav>
    <article class="flex-grow-1 flex flex-column gap-2 overflow-y-hidden">
      <section ref="messageConatiner" class="overflow-y-scroll flex-grow-1 flex flex-column gap-2 surface-0 p-2">
        <template v-if="isLoading">
          <div
            v-for="_,idx in Array(5)"
            :key="idx"
            class="flex align-items-start gap-3 w-full p-2"
          >
            <Skeleton width="3rem" height="3rem" />
            <div class="flex-grow-1 flex flex-column align-items-start gap-2">
              <div class="w-full flex align-items-center gap-3">
                <Skeleton height="1.5rem" width="50%" />
                <Skeleton height="1rem" width="25%" />
              </div>
              <Skeleton height="3rem" width="100%" />
            </div>
          </div>
        </template>
        <template v-else>
          <Message
            v-for="msg,idx in messages"
            :key="idx"
            :user-id="msg.userId"
            :image="msg.image"
            :name="msg.name"
            :timestamp="new Date(msg.timestamp).toLocaleString()"
            :text="msg.text"
            :class="{'my-message': msg.userId === me?.id}"
          />
        </template>
      </section>
      <form class="flex gap-2">
        <InputText
          v-model="input"
          placeholder="enter your message here"
          class="flex-grow-1"
        />
        <Button
          type="submit"
          :disabled="!input.length"
          @click.prevent="onSend"
        >
          Send
        </Button>
      </form>
    </article>
  </div>
</template>
