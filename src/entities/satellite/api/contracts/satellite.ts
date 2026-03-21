import { apiClient } from "@/shared/api/http/instance-client"
import type {
  TleDemoRequestParams,
  TleDemoResponse,
} from "../dto/tle-demo"
import type { TleUploadParams, TleUploadResponse } from "../dto/tle-upload"

export const satelliteApi = {
  getDemoTle: ({
    country,
    type,
    mission,
    signal,
  }: TleDemoRequestParams) => {
    return apiClient.request<TleDemoResponse>({
      path: "tle/demo",
      method: "GET",
      signal,
      params: { country, type, mission },
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
