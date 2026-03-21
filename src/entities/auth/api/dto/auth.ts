import type { Account } from "../../../account/model"

export type AuthParams = {
  username: string
  password: string
  signal?: AbortSignal
}

export type AuthResponse = Account
