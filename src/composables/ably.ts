import { ref, onMounted, onUnmounted } from 'vue'
import * as Ably from 'ably'

type BaseOptions = {
  onMessage: (message: Ably.Types.Message) => void,
  onHistoryItem?: (message: Ably.Types.Message) => void,
  channelName: string,
  eventName: string
  isDebug: boolean,
  history? : {
    timeMills: number,
    // -- assumes [0] to be the most recent historical message
    handler: (messages: Ably.Types.Message[]) => void
  }
}
export type UseAblyOptions = BaseOptions & (
  {
    tokenOrGetToken: string | (() => string | Promise<string>)
    authOptions?: never
  } | {
    tokenOrGetToken?: never
    authOptions: Ably.Types.ClientOptions
  }
)

const useAbly = (options: UseAblyOptions) => {
  const { onMessage, history, channelName, eventName } = options
  const realtime = ref<Ably.Types.RealtimePromise>()
  const channel = ref<Ably.Types.RealtimeChannelPromise>()
  const isLoading = ref(true)
  const getAuthOptions = async (options: UseAblyOptions): Promise<Ably.Types.ClientOptions> => {
    // Get the [quible] access token to authorize Ably SDK initialization
    if (options?.authOptions) {
      return options.authOptions
    } else {
      const token = typeof options.tokenOrGetToken === 'string'
        ? options.tokenOrGetToken
        : await options.tokenOrGetToken()
      return {
        authMethod: 'GET',
        authHeaders: {
          Authorization: `Bearer ${token}`
        },
        authUrl: `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/rt/token`
      }
    }
  }
  onMounted(
    async () => {
      // initialize Ably SDK
      const authOptions = await getAuthOptions(options)
      realtime.value = new Ably.Realtime.Promise(authOptions)
      // make sure we are connected
      await realtime.value.connection.once('connected')
      // channel
      channel.value = await realtime.value.channels.get(channelName)
      await channel.value.attach()
      // retrieve history
      if (history) {
        const oldMessages = options.isDebug
          ? {
              items: [
                {
                  data: {
                    eventIDs: [1, 2, 3],
                    events: [
                      {
                        id: 1,
                        status: {
                          description: '1st quarter'
                        },
                        homeTeam: {
                          logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
                          shortName: 'Pacers',
                          nameCode: 'IND'
                        },
                        awayTeam: {
                          logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
                          shortName: 'Warriors',
                          nameCode: 'GSW'
                        },
                        homeScore: {
                          current: 34
                        },
                        awayScore: {
                          current: 115
                        },
                        time: {
                          played: 800,
                          periodLength: 720,
                          overtimeLength: 300,
                          totalPeriodCount: 4
                        }
                      },
                      {
                        id: 2,
                        status: {
                          description: 'Overtime'
                        },
                        homeTeam: {
                          logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
                          shortName: 'Magic',
                          nameCode: 'ORL'
                        },
                        awayTeam: {
                          logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
                          shortName: 'Spurs',
                          nameCode: 'SAS'
                        },
                        homeScore: {
                          current: 123
                        },
                        awayScore: {
                          current: 101
                        },
                        time: {
                          played: 4 * 720 + 100,
                          periodLength: 720,
                          overtimeLength: 300,
                          totalPeriodCount: 4
                        }
                      }
                    ]
                  }
                } as Ably.Types.Message
              ]
            }
          : await channel.value.history({
            start: new Date().getTime() - history.timeMills,
            untilAttach: true
          })
        await history.handler(oldMessages.items)
      }
      // subscribe for new items
      if (!options.isDebug) {
        await channel.value.subscribe(eventName, onMessage)
      }
      isLoading.value = false
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
    channel,
    isLoading
  }
}

export default useAbly
