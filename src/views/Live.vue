<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as Ably from 'ably'
import { getAccessToken } from '@/bridge'
// -- types
type Score = {
  current: number
  display: number
  period1?: number
  period2?: number
  period3?: number
  period4?: number
  overtime?: number
}
type Team = {
  id: number
  name: string
  slug: string
  shortName: string
  nameCode: string
  logoUrl: string
}
type Time = {
  played: number
  periodLength: number
  overtimeLength: number
  totalPeriodCount: number
  currentPeriodStartTimestamp?: number
}
type Status = {
  code: number
  description: string
  type: string
}
type Season = {
  name: string
  year: string
  id: number
}
type Tournament = {
  name: string
  id: number
}
type GameUpdate = {
  tournament: Tournament
  season: Season
  status: Status
  homeTeam: Team
  awayTeam: Team
  homeScore: Score
  awayScore: Score
  time: Time
  id: number
  startTimestamp: number
  slug: string
}
type LiveMessageData = {
  eventIDs: number[],
  events: GameUpdate[]
}

// -- constants
const EventMessage = 'update'
const ChannelName = 'live:BasketAPI'
// -- refs
const realtime = ref<Ably.Types.RealtimePromise>()
const channel = ref<Ably.Types.RealtimeChannelPromise>()
const recentUpdates = ref<GameUpdate[]>([])

const onMessage = async (message: Ably.Types.Message) => {
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
onMounted(
  async () => {
    // get the token
    const accessToken = await getAccessToken()
    // initialize the realtime engine (ably)
    realtime.value = new Ably.Realtime.Promise({
      authMethod: 'GET',
      authHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      authUrl: `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/rt/token`
    })
    await realtime.value.connection.once('connected')
    // channel
    channel.value = await realtime.value.channels.get(ChannelName)
    await channel.value.attach()
    await channel.value.subscribe(EventMessage, onMessage)
  }
)
onUnmounted(
  async () => {
    await channel.value?.unsubscribe(EventMessage, onMessage)
    await channel.value?.detach()
    realtime.value?.channels.release(ChannelName)
  }
)
</script>

<template>
  <div class="flex flex-column align-items-center">
    <template v-for="ev,idx of recentUpdates" :key="idx">
      <article class="m-5 w-6 flex justify-content-between align-items">
        <section class="flex-grow flex flex-column align-items-center">
          <img :src="ev.homeTeam.logoUrl" class="h-5rem">
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
        <section class="flex-grow flex flex-column align-items-center">
          <img :src="ev.awayTeam.logoUrl" class="h-5rem">
          <h3>
            {{ ev.homeTeam.shortName }}
          </h3>
        </section>
      </article>
    </template>
  </div>
</template>
