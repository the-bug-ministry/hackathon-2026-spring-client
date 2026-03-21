import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { satelliteKeys } from "./satellite.keys"
import { satelliteApi } from "./satellite"
import type { TleDemoQueryParams } from "../dto/tle-demo"
import { TIME } from "@/shared/config/time"

export const satelliteOptions = {
  tleDemo: (filters: TleDemoQueryParams) =>
    queryOptions({
      queryKey: satelliteKeys.tleDemo(filters),
      queryFn: ({ signal }) =>
        satelliteApi.getDemoTle({ ...filters, signal }),
      staleTime: 5 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),

  uploadTle: () =>
    mutationOptions({
      mutationKey: satelliteKeys.tleUpload(),
      mutationFn: satelliteApi.uploadTle,
    }),
}
