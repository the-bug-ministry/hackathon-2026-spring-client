import { useQuery } from "@tanstack/react-query"
import type { SatelliteDemoQueryParams } from "../api/dto/satellite-demo"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useSatelliteDemoQuery(filters: SatelliteDemoQueryParams) {
  return useQuery(satelliteOptions.satelliteDemo(filters))
}
