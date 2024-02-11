<script setup lang="ts">
import { ref } from 'vue'
import * as Ably from 'ably'
import type { GameUpdate, LiveMessageData } from '@/types/live'
import useAbly from '@/composables/ably'
import Skeleton from 'primevue/skeleton'

const recentUpdates = ref<GameUpdate[]>([])

const props = defineProps<{
  isDebug?: boolean
}>()

const onMessage = (message: Ably.Types.Message) => {
  const { eventIDs, events } = message.data as LiveMessageData
  const eventsById = [...recentUpdates.value, ...events].reduce(
    (acc, ev) => {
      if (eventIDs.includes(ev.id)) {
        acc[ev.id] = ev
      }
      return acc
    },
    {} as Record<number, GameUpdate>
  )
  recentUpdates.value = Object.values(eventsById)
}

const historyHandler = (historyItems: Ably.Types.Message[]) => {
  historyItems.reverse().forEach(onMessage)
}

const isLoading = ref(false)

const CardBackground = [
  '#C31E3A',
  '#542583',
  '#046A45',
  '#002962'
]

if (props.isDebug) {
  historyHandler([
    {
      data: {
        eventIDs: [1, 2, 3],
        events: [
          {
            id: 1,
            status: {
              description: '2nd quarter'
            },
            homeTeam: {
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',
              arenaName: 'Capital One Arena',
              shortName: 'Wizards',
              abbr: 'WAS'
            },
            awayTeam: {
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
              arenaName: 'Madison Square Garden',
              shortName: 'Knicks',
              abbr: 'NYK'
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
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
              arenaName: 'Crypto.com Arena',
              shortName: 'Lakers',
              abbr: 'LAL'
            },
            awayTeam: {
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
              arenaName: 'State Farm Arena',
              shortName: 'Hawks',
              abbr: 'ATL'
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
          },
          {
            id: 3,
            status: {
              description: '3rd quarter'
            },
            homeTeam: {
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
              arenaName: 'TD Garden',
              shortName: 'Celtics',
              abbr: 'BOS'
            },
            awayTeam: {
              logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
              arenaName: 'FedExForum',
              shortName: 'Grizzlies',
              abbr: 'MEM'
            },
            homeScore: {
              current: 99
            },
            awayScore: {
              current: 88
            },
            time: {
              played: 2 * 720 + 10,
              periodLength: 720,
              overtimeLength: 300,
              totalPeriodCount: 4
            }
          }
        ]
      }
    } as Ably.Types.Message
  ])
} else {
  useAbly({
    isLoading,
    channelName: 'live:main',
    eventName: 'message',
    history: {
      timeMills: 5 * 60 * 1000,
      handler: historyHandler
    },
    onMessage,
    authOptions: {
      authMethod: 'GET',
      authUrl: `${import.meta.env.VITE_APP_SERVICE_BASE_URL}/live/token`
    }
  })
}

type MetaItem = {
  currentPeriod: number
}

const getGameClock = () => {
  const metaData = {} as Record<number, MetaItem>
  const statusFirstQuarterCode = 13
  const statusOvertimeCode = 40
  return (gameUpdate: GameUpdate) => {
    const time = gameUpdate.time
    const {
      currentPeriod
    } = metaData[gameUpdate.id] ?? {}
    const period = gameUpdate.status.code === 30
      ? currentPeriod ?? '?'
      : gameUpdate.status.code - statusFirstQuarterCode + 1
    const isOvertime = gameUpdate.status.code === statusOvertimeCode
    const totalSeconds = isOvertime
      ? time.overtimeLength - (time.played % (time.periodLength * time.totalPeriodCount))
      : time.periodLength - time.played % time.periodLength
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const secondsWithLeadingZero = seconds < 10 ? `0${seconds}` : seconds
    const periodLabel = isOvertime ? 'OT' : `Q${period}`
    metaData[gameUpdate.id] = {
      currentPeriod: period
    }
    return `${periodLabel} ${minutes}:${secondsWithLeadingZero}`
  }
}
const gameTime = getGameClock()

</script>

<template>
  <div class="p-2 w-full max-w-25rem mx-auto flex flex-column align-items-center gap-2">
    <template v-if="isLoading">
      <div
        v-for="_,idx in Array(5)"
        :key="idx"
        class="w-12 flex justify-content-between align-items-start surface-50 border-round-xl p-2"
      >
        <section class="w-3 flex flex-column align-items-center gap-2">
          <Skeleton height="4rem" width="4rem" />
          <Skeleton height="1rem" width="75%" />
        </section>
        <section class="w-full flex flex-column align-items-center gap-2">
          <Skeleton height="3rem" width="70%" />
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="1rem" width="30%" />
        </section>
        <section class="w-3 flex flex-column align-items-center gap-2">
          <Skeleton height="4rem" width="4rem" />
          <Skeleton height="1rem" width="75%" />
        </section>
      </div>
    </template>
    <template v-else>
      <h2 v-if="!recentUpdates.length" class="mt-4 lg:mt-8 text-gray-400 select-none">
        No live matches
      </h2>
      <template v-for="ev,idx of recentUpdates" :key="idx">
        <article
          class="w-12 flex justify-content-between align-items-start select-none"
          :style="{
            'background-color': CardBackground[idx % CardBackground.length],
            'margin-top': idx ? '-35px' : 0,
            'height': idx < recentUpdates.length-1 ? '120px' : '95px',
            'border-radius': '12px'
          }"
        >
          <section class="team">
            <img v-if="ev.awayTeam.logo" :src="ev.awayTeam.logo" class="team-logo">
            <img v-else src="@/assets/basketball-svgrepo-com.svg" class="team-logo">
            <h5 class="team-name">
              {{ ev.awayTeam.abbr }}
            </h5>
          </section>
          <section class="score">
            <span class="score-text">
              {{ ev.awayScore.current }}
            </span>
          </section>
          <section class="status">
            <div class="status-live">
              <span>live</span>
            </div>
            <div class="status-time">
              <span>{{ gameTime(ev) }}</span>
            </div>
            <div class="status-arena">
              <span>{{ ev.homeTeam.arenaName }}</span>
            </div>
          </section>
          <section class="score">
            <span class="score-text">
              {{ ev.homeScore.current }}
            </span>
          </section>
          <section class="team">
            <img v-if="ev.homeTeam.logo" :src="ev.homeTeam.logo" class="team-logo">
            <img v-else src="@/assets/basketball-svgrepo-com.svg" class="team-logo">
            <h5 class="team-name">
              {{ ev.homeTeam.abbr }}
            </h5>
          </section>
        </article>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>

  .team {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 8px;
    width: 80px;
    .team-logo {
      margin-top: 20px;
      width: 36px;
    }
    .team-name {
      color: white;
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0em;
      text-align: center;
      margin: 0;
      padding: 0;
    }
  }
  .score {
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    .score-text {
      margin-top: 36px;
      font-size: 20px;
      font-weight: 500;
      line-height: 26px;
      color: white;
    }
  }
  .status {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 6px;
    .status-live {
      margin-top: 20px;
      text-transform: uppercase;
      font-size: 10px;
      background: #FFFFFF4A;
      color: #FFFFFF;
      padding: 2px 6px;
      border-radius: 12px;
    }
    .status-arena {
      font-size: 10px;
      font-weight: 400;
      line-height: 13px;
      color: #FFFFFF82;
    }
    .status-time {
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
    }
  }
</style>
