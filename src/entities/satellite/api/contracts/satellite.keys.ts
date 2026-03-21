import type { TleDemoQueryParams } from "../dto/tle-demo"

export const satelliteKeys = {
  root: ["satellite"] as const,
  tleUpload: () => [...satelliteKeys.root, "tle", "upload"] as const,
  tleDemo: (filters: TleDemoQueryParams) =>
    [
      ...satelliteKeys.root,
      "tle",
      "demo",
      filters.country ?? "",
      filters.type ?? "",
      filters.mission ?? "",
    ] as const,
}
