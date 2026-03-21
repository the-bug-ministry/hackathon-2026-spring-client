export const authKeys = {
  root: ["auth"] as const,
  login: () => [...authKeys.root, "login"] as const,
  me: () => [...authKeys.root, "me"] as const,
  logout: () => [...authKeys.root, "logout"] as const,
}
