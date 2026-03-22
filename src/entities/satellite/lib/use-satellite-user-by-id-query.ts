import { useQuery } from "@tanstack/react-query"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useSatelliteUserByIdQuery(id: string | undefined) {
  return useQuery({
    ...satelliteOptions.satelliteUserById(id ?? ""),
    enabled: Boolean(id),
  })
}
