import { useMutation } from "@tanstack/react-query"
import { tleKeys } from "../contracts/tle.keys"
import type { TleUploadParams } from "../dto/tle-upload"
import { tleApi } from "../contracts/tle"

export function useTleUpload() {
  return useMutation({
    mutationKey: tleKeys.upload(),
    mutationFn: (params: TleUploadParams) => tleApi.upload(params),
  })
}
