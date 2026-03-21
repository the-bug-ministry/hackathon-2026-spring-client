import * as satellite from "satellite.js"
import type { SatelliteMap } from "@/entities/satellite/model"

export type OrbitalPosition = {
  lat: number
  lng: number
  altitudeKm: number
  speedKms: number
}

const EARTH_RADIUS_KM = 6371
const STANDARD_GRAVITATIONAL_PARAMETER = 398600.4418

function normalizeLongitude(lng: number) {
  let value = lng
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}

export function propagateSatellitePosition(
  satelliteData: SatelliteMap,
  at: Date
): OrbitalPosition | null {
  if (!satelliteData.tle1 || !satelliteData.tle2) return null

  const satrec = satellite.twoline2satrec(
    satelliteData.tle1,
    satelliteData.tle2
  )
  const pv = satellite.propagate(satrec, at)

  const position = pv?.position
  const velocity = pv?.velocity
  if (!position || !velocity) return null

  const gmst = satellite.gstime(at)
  const geodetic = satellite.eciToGeodetic(position, gmst)

  const lat = satellite.degreesLat(geodetic.latitude)
  const lng = normalizeLongitude(satellite.degreesLong(geodetic.longitude))
  const altitudeKm = geodetic.height

  const { x, y, z } = velocity
  const speedKms = Math.sqrt(x * x + y * y + z * z)

  return {
    lat,
    lng,
    altitudeKm,
    speedKms,
  }
}

export function calculateOrbitalPeriodMin(altitudeKm: number) {
  const radius = EARTH_RADIUS_KM + Math.max(0, altitudeKm)
  const periodSeconds =
    2 *
    Math.PI *
    Math.sqrt(Math.pow(radius, 3) / STANDARD_GRAVITATIONAL_PARAMETER)
  return periodSeconds / 60
}
