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
  abbr: string
  arenaName: string
  arenaSize: number
  color: string
  secondaryColor: string
  logo: string
}
type Time = {
  played: number
  periodLength: number
  overtimeLength: number
  totalPeriodCount: number
  currentPeriodStartTimestamp: number
}
type Status = {
  code: number
  description: string
  type: string
}
export type GameUpdate = {
  id: number
  status: Status
  homeTeam: Team
  awayTeam: Team
  homeScore: Score
  awayScore: Score
  time: Time
  startTimestamp: number
}
export type LiveMessageData = {
  eventIDs: number[],
  events: GameUpdate[]
}
