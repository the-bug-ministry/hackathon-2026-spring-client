import { useMutation } from "@tanstack/react-query"
import { satelliteOptions } from "../api/contracts/satellite.options"

export function useTleUpload() {
  return useMutation(satelliteOptions.uploadTle())
}
