export const satelliteKeys = {
  root: ["satellite"] as const,
  tleUpload: () => [...satelliteKeys.root, "tle", "upload"] as const,
}
