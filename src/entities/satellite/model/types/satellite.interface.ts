import type { SatelliteMission } from "./satellite-mission"
import type { SatelliteStatus } from "./satellite-status"
import type { SatelliteType } from "./satellite-type"

export interface Satellite {
  id: string
  name: string
  desc: string
  type: SatelliteType
  mission: SatelliteMission
  status: SatelliteStatus
  launchDate: string
  operator: string
  country: string
  noradId: number
  altitudeKm: number
  speedKms: number
  inclinationDeg: number
}
