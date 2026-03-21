import { useQuery } from "@tanstack/react-query"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useSatelliteDemoByIdQuery(id: string | undefined) {
  return useQuery({
    ...satelliteOptions.satelliteDemoById(id ?? ""),
    enabled: Boolean(id),
  })
}
