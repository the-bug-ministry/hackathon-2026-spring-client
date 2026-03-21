import { apiClient } from "@/shared/api/http/instance-client"
import type {
  SatelliteDemoByIdRequestParams,
  SatelliteDemoByIdResponse,
  SatelliteDemoRequestParams,
  SatelliteDemoResponse,
} from "../dto/satellite-demo"
import type { TleDemoResponse } from "../dto/tle-demo"
import type { TleUploadParams, TleUploadResponse } from "../dto/tle-upload"

const demoQuery = (p: SatelliteDemoRequestParams) => ({
  country: p.country,
  type: p.type,
  mission: p.mission,
})

export const satelliteApi = {
  /** Метаданные спутников для демо */
  getSatelliteDemo: (params: SatelliteDemoRequestParams) => {
    return apiClient.request<SatelliteDemoResponse>({
      path: "satellite/demo",
      method: "GET",
      signal: params.signal,
      params: demoQuery(params),
    })
  },

  /** Одна запись демо по id (path-сегмент кодируется для не-ASCII и спецсимволов) */
  getSatelliteDemoById: ({ id, signal }: SatelliteDemoByIdRequestParams) => {
    return apiClient.request<SatelliteDemoByIdResponse>({
      path: `satellite/demo/${encodeURIComponent(id)}`,
      method: "GET",
      signal,
    })
  },

  /** Строки TLE по тем же фильтрам; сшивается с getSatelliteDemo по noradId */
  getTleDemo: (params: SatelliteDemoRequestParams) => {
    return apiClient.request<TleDemoResponse>({
      path: "tle/demo",
      method: "GET",
      signal: params.signal,
      params: demoQuery(params),
    })
  },

  uploadTle: ({ file, signal }: TleUploadParams) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiClient.request<TleUploadResponse>({
      method: "POST",
      path: "tle/upload",
      body: formData,
      signal,
    })
  },
}
