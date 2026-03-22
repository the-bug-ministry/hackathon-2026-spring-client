import { useMutation } from "@tanstack/react-query"
import { fileOptions } from "../api/contracts/file.options"

export function useActivateFileMutation() {
  return useMutation(fileOptions.activateFile())
}
