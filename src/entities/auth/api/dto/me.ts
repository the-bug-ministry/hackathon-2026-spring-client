import type { Account } from "@/entities/account/model"

export type MeParams = {
  signal?: AbortSignal
}

export type MeResponse = Account
