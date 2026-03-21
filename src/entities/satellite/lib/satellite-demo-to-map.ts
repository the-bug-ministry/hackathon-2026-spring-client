import type { SatelliteDemoItem } from "../api/dto/satellite-demo"
import type { SatelliteMap } from "../model"

export function satelliteDemoToSatelliteMap(item: SatelliteDemoItem): SatelliteMap {
  return item
}

export function satelliteDemoListToSatelliteMap(
  items: SatelliteDemoItem[],
): SatelliteMap[] {
  return items.map(satelliteDemoToSatelliteMap)
}
