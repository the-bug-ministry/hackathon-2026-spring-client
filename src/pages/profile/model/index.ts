import type { Account } from "@/entities/account/model"

export interface ProfileFields {
  firstName: string
  lastName: string
  username: string
  email: string
  gender: string
  image: string
}

export const mapAccountToProfileFields = (
  account?: Account
): ProfileFields => ({
  firstName: account?.firstName ?? "",
  lastName: account?.lastName ?? "",
  username: account?.username ?? "",
  email: account?.email ?? "",
  gender: account?.gender ?? "",
  image: account?.image ?? "",
})

export const buildDisplayName = (fields: ProfileFields) => {
  if (fields.firstName || fields.lastName) {
    return `${fields.firstName} ${fields.lastName}`.trim()
  }
  return fields.username || "Пользователь"
}

export const buildInitials = (fields: ProfileFields) => {
  if (!fields.firstName && !fields.lastName) {
    return fields.username.slice(0, 2).toUpperCase() || "--"
  }
  return (
    `${fields.firstName.charAt(0) || ""}${fields.lastName.charAt(0) || ""}`.toUpperCase() ||
    "--"
  )
}
