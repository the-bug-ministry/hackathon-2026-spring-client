import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
// import { router } from '@/app/router/router';
import Cookies from "js-cookie"
import { ACCESS_TOKEN } from "../constants"
import type { Account } from "@/entities/account/model"
import { authOptions } from "../api/contracts/auth.options"
import { authKeys } from "../api/contracts/auth.keys"

type AuthState =
  | { account: null; status: "PENDING" }
  | { account: null; status: "UNAUTHENTICATED" }
  | { account: Account; status: "AUTHENTICATED" }

type AuthUtils = {
  // signIn: () => void;
  signOut: () => void
  ensureData: () => Promise<Account | null | undefined>
}

type AuthData = AuthState &
  AuthUtils & {
    /** Ошибка запроса auth/me (не показывать как сбой при ожидаемой 401 вне профиля) */
    meError: Error | null
  }

function useAuth(): AuthData {
  //Query client
  const queryClient = useQueryClient()

  //Me-query
  const authQuery = useQuery(authOptions.me())

  //Logout-mutation
  const logout = useMutation({
    ...authOptions.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null)
      Cookies.remove(ACCESS_TOKEN)
    },
  })

  // //Invalidate on change me data
  // useEffect(() => {
  //   router.invalidate();
  // }, [authQuery.data]);

  //Set me data to null, if error in me response
  useEffect(() => {
    if (authQuery.error === null) return
    queryClient.setQueryData(authKeys.me(), null)
  }, [authQuery.error, queryClient])

  const meError = authQuery.error ?? null

  const utils: AuthUtils = {
    //just redirect to /login
    // signIn: () => {
    //   router.navigate({ to: '/login' });
    // },
    //mutation to logout
    signOut: () => {
      logout.mutate()
    },
    //check /me data in cache or fetch data
    ensureData: () => {
      return queryClient.ensureQueryData(authOptions.me())
    },
  }

  //return value all states
  switch (true) {
    case authQuery.isPending:
      return { ...utils, account: null, status: "PENDING", meError }

    case !authQuery.data:
      return { ...utils, account: null, status: "UNAUTHENTICATED", meError }

    default:
      return { ...utils, account: authQuery.data, status: "AUTHENTICATED", meError: null }
  }
}

export { useAuth }
export type { AuthData }
