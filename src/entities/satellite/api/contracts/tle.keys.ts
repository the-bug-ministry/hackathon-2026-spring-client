export const tleKeys = {
  root: ["tle"] as const,
  upload: () => [...tleKeys.root, "upload"] as const,
}
