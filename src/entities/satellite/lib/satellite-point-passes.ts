import { geoDistance } from "d3-geo"
import type { SatelliteMap } from "@/entities/satellite/model"
import { propagateSatellitePosition } from "@/entities/satellite/lib/propagation"

export const RECENT_WINDOW_MIN = 20
export const UPCOMING_WINDOW_MIN = 20
export const PASS_SAMPLE_STEP_SEC = 60
/** Порог «над точкой», км (по дуге); согласован с шагом выборки трека. */
export const PASS_NEAR_POINT_KM = 85

const EARTH_RADIUS_KM = 6371

export type PassBucketItem = {
  id: string
  name: string
  type: string
  offsetMinutes?: number
}

export type PassBuckets = {
  current: PassBucketItem[]
  recent: PassBucketItem[]
  upcoming: PassBucketItem[]
}

export function isNearMapPoint(
  targetLng: number,
  targetLat: number,
  pos: { lng: number; lat: number } | null,
  radiusKm = PASS_NEAR_POINT_KM
) {
  if (!pos) return false
  const rad = geoDistance([targetLng, targetLat], [pos.lng, pos.lat])
  return rad * EARTH_RADIUS_KM <= radiusKm
}

export function findPassOffsetMinutesForPoint(
  targetLng: number,
  targetLat: number,
  satellite: SatelliteMap,
  referenceTime: Date,
  direction: "past" | "future"
) {
  const step = PASS_SAMPLE_STEP_SEC * 1000
  const limitMs =
    (direction === "past" ? -RECENT_WINDOW_MIN : UPCOMING_WINDOW_MIN) *
    60 *
    1000
  const start = direction === "past" ? -step : step
  const condition =
    direction === "past"
      ? (offset: number) => offset >= limitMs
      : (offset: number) => offset <= limitMs

  for (
    let offset = start;
    condition(offset);
    offset += direction === "past" ? -step : step
  ) {
    const date = new Date(referenceTime.getTime() + offset)
    const pos = propagateSatellitePosition(satellite, date)
    if (isNearMapPoint(targetLng, targetLat, pos)) {
      return Math.round(offset / 60000)
    }
  }

  return null
}

export function classifyPointPasses(
  targetLng: number,
  targetLat: number,
  satellites: SatelliteMap[],
  referenceTime: Date
): PassBuckets {
  const result: PassBuckets = {
    current: [],
    recent: [],
    upcoming: [],
  }

  for (const sat of satellites) {
    const currentPos = propagateSatellitePosition(sat, referenceTime)

    if (isNearMapPoint(targetLng, targetLat, currentPos)) {
      result.current.push({
        id: sat.id,
        name: sat.name,
        type: sat.type,
        offsetMinutes: 0,
      })
      continue
    }

    const recentOffset = findPassOffsetMinutesForPoint(
      targetLng,
      targetLat,
      sat,
      referenceTime,
      "past"
    )
    if (recentOffset !== null) {
      result.recent.push({
        id: sat.id,
        name: sat.name,
        type: sat.type,
        offsetMinutes: recentOffset,
      })
      continue
    }

    const upcomingOffset = findPassOffsetMinutesForPoint(
      targetLng,
      targetLat,
      sat,
      referenceTime,
      "future"
    )
    if (upcomingOffset !== null) {
      result.upcoming.push({
        id: sat.id,
        name: sat.name,
        type: sat.type,
        offsetMinutes: upcomingOffset,
      })
    }
  }

  return result
}
