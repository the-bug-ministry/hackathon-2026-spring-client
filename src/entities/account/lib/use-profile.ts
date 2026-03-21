import { useQuery } from "@tanstack/react-query"
import { profileOptions } from "../api/contracts/profile.options"

export const useProfileQuery = () => {
  return useQuery(profileOptions.me())
}
