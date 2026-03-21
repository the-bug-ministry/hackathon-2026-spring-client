import { mutationOptions } from "@tanstack/react-query"
import { satelliteKeys } from "./satellite.keys"
import { satelliteApi } from "./satellite"

export const satelliteOptions = {
  uploadTle: () =>
    mutationOptions({
      mutationKey: satelliteKeys.tleUpload(),
      mutationFn: satelliteApi.uploadTle,
    }),
}
