import type { TleDemoItem } from "../api/dto/tle-demo"
import type { SatelliteMap } from "../model"

export function tleDemoItemToSatelliteMap(item: TleDemoItem): SatelliteMap {
  return {
    id: String(item.noradId),
    name: `NORAD ${item.noradId}`,
    desc: "Демо TLE",
    type: "LEO",
    mission: "Observation",
    status: "Active",
    launchDate: "",
    operator: "",
    country: "",
    noradId: item.noradId,
    altitudeKm: 400,
    speedKms: 7.66,
    inclinationDeg: 51.6,
    tle1: item.tle1,
    tle2: item.tle2,
  }
}

export function tleDemoItemsToSatelliteMap(items: TleDemoItem[]): SatelliteMap[] {
  return items.map(tleDemoItemToSatelliteMap)
}
