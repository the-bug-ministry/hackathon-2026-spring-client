import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { fileKeys } from "./file.keys"
import { fileApi } from "./file"
import { TIME } from "@/shared/config/time"

export const fileOptions = {
  filesList: () =>
    queryOptions({
      queryKey: fileKeys.list(),
      queryFn: ({ signal }) => fileApi.getFiles({ signal }),
      staleTime: 1 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),

  activateFile: () =>
    mutationOptions({
      mutationKey: fileKeys.activate(),
      mutationFn: ({ id }: { id: string }) => fileApi.activateFile({ id }),
    }),

  deleteFile: () =>
    mutationOptions({
      mutationKey: fileKeys.delete(),
      mutationFn: ({ id }: { id: string }) => fileApi.deleteFile({ id }),
    }),

  updateFileName: () =>
    mutationOptions({
      mutationKey: fileKeys.updateName(),
      mutationFn: ({ id, name }: { id: string; name: string }) =>
        fileApi.updateFileName({ id, name }),
    }),
}
