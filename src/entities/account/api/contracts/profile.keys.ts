export const profileKeys = {
  root: ["profile"] as const,
  me: () => [...profileKeys.root, "me"] as const,
}
