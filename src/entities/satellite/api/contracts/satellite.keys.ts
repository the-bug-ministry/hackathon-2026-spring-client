import type { SatelliteDemoQueryParams } from "../dto/satellite-demo"

export const satelliteKeys = {
  root: ["satellite"] as const,
  tleUpload: () => [...satelliteKeys.root, "tle", "upload"] as const,
  satelliteDemo: (filters: SatelliteDemoQueryParams) =>
    [
      ...satelliteKeys.root,
      "demo",
      filters.country ?? "",
      filters.type ?? "",
      filters.mission ?? "",
    ] as const,

  satelliteDemoById: (id: string) =>
    [...satelliteKeys.root, "demo", "byId", id] as const,
}
