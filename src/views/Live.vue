<script setup lang="ts">
import { ref } from 'vue'
import * as Ably from 'ably'
import { getAccessToken } from '@/bridge'
import type { GameUpdate, LiveMessageData } from '@/types/live'
import useAbly from '@/composables/ably'
import Skeleton from 'primevue/skeleton'

const recentUpdates = ref<GameUpdate[]>([])

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

const { isLoading } = useAbly({
  channelName: 'live:main',
  eventName: 'message',
  history: {
    timeMills: 5 * 60 * 1000,
    handler: historyHandler
  },
  tokenOrGetToken: getAccessToken,
  onMessage
})

const getInPeriodTime = (time: GameUpdate['time']) => {
  const isOvertime = time.played > time.totalPeriodCount * time.periodLength
  const totalSeconds = isOvertime
    ? time.played - time.periodLength * time.totalPeriodCount
    : time.played % time.periodLength
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const secondsWithLeadingZero = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}:${secondsWithLeadingZero}`
}

</script>

<template>
  <div class="p-2 lg:p-5 w-full flex flex-column align-items-center gap-2">
    <template v-if="isLoading">
      <div
        v-for="_,idx in Array(3)"
        :key="idx"
        class="w-12 lg:w-6 flex justify-content-between align-items-start surface-50 border-round-xl py-3"
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
      <h2 v-if="!recentUpdates.length" class="mt-4 lg:mt-8 text-gray-400">
        No live matches at the moment
      </h2>
      <template v-for="ev,idx of recentUpdates" :key="idx">
        <article
          class="w-12 lg:w-6 flex justify-content-between align-items-start surface-50 border-round-xl p-2 select-none"
        >
          <section class="w-3 flex flex-column align-items-center">
            <img v-if="ev.homeTeam.logoUrl" :src="ev.homeTeam.logoUrl" class="h-5rem sm:h-3rem">
            <img v-else src="@/assets/basketball-svgrepo-com.svg" class="h-5rem sm:h-3rem">
            <h5 class="text-gray-300 text-center">
              {{ ev.homeTeam.shortName }}
            </h5>
          </section>
          <section class="flex-grow flex flex-column align-items-center">
            <h1 class="m-0 text-6xl sm:text-4xls text-color-primary">
              {{ ev.homeScore.current }}:{{ ev.awayScore.current }}
            </h1>
            <h2 class="my-2 font-light text-color-secondary">
              {{ ev.status.description }}
            </h2>
            <h3 class="my-1 font-light text-gray-400">
              {{ getInPeriodTime(ev.time) }}
            </h3>
          </section>
          <section class="w-3 flex flex-column align-items-center">
            <img v-if="ev.awayTeam.logoUrl" :src="ev.awayTeam.logoUrl" class="h-5rem sm:h-3rem">
            <img v-else src="@/assets/basketball-svgrepo-com.svg" class="h-5rem sm:h-3rem">
            <h5 class="text-gray-300 text-center">
              {{ ev.awayTeam.shortName }}
            </h5>
          </section>
        </article>
      </template>
    </template>
  </div>
</template>
