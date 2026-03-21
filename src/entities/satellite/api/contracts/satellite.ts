import { apiClient } from "@/shared/api/http/instance-client"
import type { TleUploadParams, TleUploadResponse } from "../dto/tle-upload"

export const satelliteApi = {
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
