import { useQuery } from "@tanstack/react-query"
import type { SatelliteUserQueryParams } from "../api/dto/satellite-user"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useSatelliteUserQuery(filters: SatelliteUserQueryParams) {
  return useQuery(satelliteOptions.satelliteUser(filters))
}
