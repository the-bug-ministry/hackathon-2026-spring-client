import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { satelliteKeys } from "./satellite.keys"
import { satelliteApi } from "./satellite"
import type {
  SatelliteDemoByIdMergedResponse,
  SatelliteDemoMergedResponse,
  SatelliteDemoQueryParams,
} from "../dto/satellite-demo"
import type {
  SatelliteUserByIdMergedResponse,
  SatelliteUserMergedResponse,
  SatelliteUserQueryParams,
} from "../dto/satellite-user"
import { mergeSatelliteDemoWithTle } from "../../lib/merge-satellite-demo-tle"
import { TIME } from "@/shared/config/time"

export const satelliteOptions = {
  satelliteDemo: (filters: SatelliteDemoQueryParams) =>
    queryOptions({
      queryKey: satelliteKeys.satelliteDemo(filters),
      queryFn: async ({ signal }): Promise<SatelliteDemoMergedResponse> => {
        const [infoResult, tleResult] = await Promise.allSettled([
          satelliteApi.getSatelliteDemo({ ...filters, signal }),
          satelliteApi.getTleDemo({ ...filters, signal }),
        ])

        if (infoResult.status === "rejected") {
          throw infoResult.reason
        }

        const info = infoResult.value
        const tleData =
          tleResult.status === "fulfilled" ? tleResult.value.data : []

        return {
          data: mergeSatelliteDemoWithTle(info.data, tleData),
        }
      },
      staleTime: 5 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),

  satelliteUser: (filters: SatelliteUserQueryParams) =>
    queryOptions({
      queryKey: satelliteKeys.satelliteUser(filters),
      queryFn: async ({ signal }): Promise<SatelliteUserMergedResponse> => {
        const [infoResult, tleResult] = await Promise.allSettled([
          satelliteApi.getSatelliteUser({ ...filters, signal }),
          satelliteApi.getTleUser({ ...filters, signal }),
        ])

        if (infoResult.status === "rejected") {
          throw infoResult.reason
        }

        const info = infoResult.value
        const tleData =
          tleResult.status === "fulfilled" ? tleResult.value.data : []

        return {
          data: mergeSatelliteDemoWithTle(info.data, tleData),
        }
      },
      staleTime: 5 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),

  satelliteDemoById: (id: string) =>
    queryOptions({
      queryKey: satelliteKeys.satelliteDemoById(id),
      queryFn: async ({ signal }): Promise<SatelliteDemoByIdMergedResponse> => {
        const [infoResult, tleResult] = await Promise.allSettled([
          satelliteApi.getSatelliteDemoById({ id, signal }),
          satelliteApi.getTleDemo({ signal }),
        ])

        if (infoResult.status === "rejected") {
          throw infoResult.reason
        }

        const info = infoResult.value
        const tleData =
          tleResult.status === "fulfilled" ? tleResult.value.data : []

        const [merged] = mergeSatelliteDemoWithTle([info.data], tleData)
        return { data: merged }
      },
      staleTime: 5 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),

  satelliteUserById: (id: string) =>
    queryOptions({
      queryKey: satelliteKeys.satelliteUserById(id),
      queryFn: async ({ signal }): Promise<SatelliteUserByIdMergedResponse> => {
        const [infoResult, tleResult] = await Promise.allSettled([
          satelliteApi.getSatelliteUserById({ id, signal }),
          satelliteApi.getTleUser({ signal }),
        ])

        if (infoResult.status === "rejected") {
          throw infoResult.reason
        }

        const info = infoResult.value
        const tleData =
          tleResult.status === "fulfilled" ? tleResult.value.data : []

        const [merged] = mergeSatelliteDemoWithTle([info.data], tleData)
        return { data: merged }
      },
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
