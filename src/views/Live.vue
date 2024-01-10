<script setup lang="ts">
import { ref } from 'vue'
import * as Ably from 'ably'
import { getAccessToken } from '@/bridge'
import type { GameUpdate, LiveMessageData } from '@/types/live'
import useAbly from '@/composables/ably'

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
useAbly({
  channelName: 'live:BasketAPI',
  eventName: 'update',
  historyLengthMills: 5 * 60 * 1000,
  tokenOrGetToken: getAccessToken,
  onMessage
})
</script>

<template>
  <div class="flex flex-column align-items-center">
    <h2 v-if="!recentUpdates.length" class="my-8">
      No live matches at the moment
    </h2>
    <template v-for="ev,idx of recentUpdates" :key="idx">
      <article class="my-5 w-12 flex justify-content-between align-items-center">
        <section class="w-3 flex flex-column align-items-center">
          <img v-if="ev.homeTeam.logoUrl" :src="ev.homeTeam.logoUrl" class="h-5rem">
          <img v-else src="@/assets/basketball-svgrepo-com.svg" class="h-5rem">
          <h3>
            {{ ev.homeTeam.shortName }}
          </h3>
        </section>
        <section class="flex-grow flex flex-column align-items-center">
          <h1 class="m-0 text-8xl">
            {{ ev.homeScore.current }}:{{ ev.awayScore.current }}
          </h1>
          <h3>
            {{ ev.status.description }}
          </h3>
        </section>
        <section class="w-3 flex flex-column align-items-center">
          <img v-if="ev.awayTeam.logoUrl" :src="ev.awayTeam.logoUrl" class="h-5rem">
          <img v-else src="@/assets/basketball-svgrepo-com.svg" class="h-5rem">
          <h3>
            {{ ev.awayTeam.shortName }}
          </h3>
        </section>
      </article>
    </template>
  </div>
</template>
