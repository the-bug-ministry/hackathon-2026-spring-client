/** Радиус Земли, км — совпадает с propagation.ts / globe */
export const EARTH_RADIUS_KM = 6371

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/**
 * Угловой радиус круга горизонта на поверхности Земли (рад):
 * область поверхности, «видимая» со спутника на высоте h (круг покрытия подспутниковой точки).
 */
export function horizonFootprintAngularRadiusRad(altitudeKm: number): number {
  const h = Math.max(0, altitudeKm)
  const ratio = EARTH_RADIUS_KM / (EARTH_RADIUS_KM + h)
  return Math.acos(Math.min(1, Math.max(-1, ratio)))
}

/**
 * Кольцо на сфере (долгота/широта), замкнутое [lng, lat] × (resolution+1),
 * последняя точка совпадает с первой — для GeoJSON Polygon закройте явно.
 */
export function footprintRingLngLat(
  lat: number,
  lng: number,
  altitudeKm: number,
  resolution = 72
): [number, number][] {
  const coverageAngle = horizonFootprintAngularRadiusRad(altitudeKm)
  const latRad = lat * DEG_TO_RAD
  const lngRad = lng * DEG_TO_RAD
  const ring: [number, number][] = []

  for (let i = 0; i <= resolution; i++) {
    const bearing = (i / resolution) * 2 * Math.PI
    const sinLat2 =
      Math.sin(latRad) * Math.cos(coverageAngle) +
      Math.cos(latRad) * Math.sin(coverageAngle) * Math.cos(bearing)
    const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)))

    const numerator =
      Math.sin(bearing) * Math.sin(coverageAngle) * Math.cos(latRad)
    const denominator =
      Math.cos(coverageAngle) - Math.sin(latRad) * Math.sin(lat2)
    let lon2 = lngRad + Math.atan2(numerator, denominator)
    let degLng = lon2 * RAD_TO_DEG
    while (degLng > 180) degLng -= 360
    while (degLng < -180) degLng += 360

    ring.push([degLng, lat2 * RAD_TO_DEG])
  }

  return ring
}
