import { useQuery } from "@tanstack/react-query"
import { fileOptions } from "../api/contracts/file.options"

export function useFilesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...fileOptions.filesList(),
    enabled: options?.enabled ?? true,
  })
}
