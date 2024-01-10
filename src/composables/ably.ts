import { ref, onMounted, onUnmounted } from 'vue'
import * as Ably from 'ably'

type Options = {
  onMessage: (message: Ably.Types.Message) => void,
  onHistoryItem?: (message: Ably.Types.Message) => void,
  channelName: string,
  historyLengthMills?: number,
  eventName: string
  tokenOrGetToken: string | (() => string | Promise<string>)
}

const useAbly = async (options: Options) => {
  const { onMessage, onHistoryItem, channelName, historyLengthMills, eventName } = options
  const realtime = ref<Ably.Types.RealtimePromise>()
  const channel = ref<Ably.Types.RealtimeChannelPromise>()
  onMounted(
    async () => {
      const token = typeof options.tokenOrGetToken === 'string'
        ? options.tokenOrGetToken
        : await options.tokenOrGetToken()

      realtime.value = new Ably.Realtime.Promise({
        authMethod: 'GET',
        authHeaders: {
          Authorization: `Bearer ${token}`
        },
        authUrl: `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/rt/token`
      })
      await realtime.value.connection.once('connected')
      // channel
      channel.value = await realtime.value.channels.get(channelName)
      await channel.value.attach()
      if (typeof historyLengthMills !== 'undefined') {
        const oldMessages = await channel.value.history({
          start: new Date().getTime() - historyLengthMills,
          untilAttach: true
        })
        oldMessages.items.reverse().forEach(onHistoryItem ?? onMessage)
      }

      await channel.value.subscribe(eventName, onMessage)
    }
  )
  onUnmounted(
    async () => {
      await channel.value?.unsubscribe(eventName, onMessage)
      await channel.value?.detach()
      realtime.value?.channels.release(channelName)
    }
  )
  return {
    realtime,
    channel
  }
}

export default useAbly
