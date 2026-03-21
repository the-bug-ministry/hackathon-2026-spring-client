import { useQuery } from "@tanstack/react-query"
import type { TleDemoQueryParams } from "../api/dto/tle-demo"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useTleDemoQuery(filters: TleDemoQueryParams) {
  return useQuery(satelliteOptions.tleDemo(filters))
}
