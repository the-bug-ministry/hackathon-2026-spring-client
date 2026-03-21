import { queryOptions } from "@tanstack/react-query"
import { profileApi } from "./profile.api"
import { profileKeys } from "./profile.keys"
import { TIME } from "@/shared/config/time"

export const profileOptions = {
  me: () =>
    queryOptions({
      queryKey: profileKeys.me(),
      queryFn: ({ signal }) => profileApi.getProfile({ signal }),
      staleTime: 5 * TIME.MINUTE,
      retry: 1,
      refetchOnWindowFocus: true,
    }),
}
