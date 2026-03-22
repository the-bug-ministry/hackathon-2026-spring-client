import type { SatelliteDemoQueryParams } from "../dto/satellite-demo"
import type { SatelliteUserQueryParams } from "../dto/satellite-user"

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

  satelliteUser: (filters: SatelliteUserQueryParams) =>
    [
      ...satelliteKeys.root,
      "user",
      filters.country ?? "",
      filters.type ?? "",
      filters.mission ?? "",
    ] as const,

  satelliteUserById: (id: string) =>
    [...satelliteKeys.root, "user", "byId", id] as const,
}
