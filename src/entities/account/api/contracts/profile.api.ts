import { apiClient } from "@/shared/api/http/instance-client"
import type { Account } from "@/entities/account/model"

export type ProfileApiParams = {
  signal?: AbortSignal
}

export const profileApi = {
  getProfile: ({ signal }: ProfileApiParams = {}) => {
    return apiClient.request<Account>({
      path: "me",
      signal,
    })
  },
}
