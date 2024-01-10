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
export type GameUpdate = {
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
export type LiveMessageData = {
  eventIDs: number[],
  events: GameUpdate[]
}
