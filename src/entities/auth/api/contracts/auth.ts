import { apiClient } from "@/shared/api/http/instance-client"
import type { AuthParams, AuthResponse } from "../dto/auth"
import type { MeParams, MeResponse } from "../dto/me"

export const authApi = {
  login: ({ password, username, signal }: AuthParams) => {
    return apiClient.request<AuthResponse>({
      path: "auth/login",
      body: {
        password,
        username,
      },
      method: "POST",
      signal,
    })
  },

  me: ({ signal }: MeParams) => {
    return apiClient.request<MeResponse>({
      path: "auth/me",
      signal,
    })
  },

  logout: () => {
    return apiClient.request({
      path: "auth/logout",
    })
  },
}
