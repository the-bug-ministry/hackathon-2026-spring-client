export { getIconByType } from "./utils/get-icon-by-type"
export { getTypeColor } from "./utils/get-type-color"
export { useTleUpload } from "./use-tle-upload"
export { useTleDumps } from "./use-tle-dumps"
export { useSatelliteDemoQuery } from "./use-satellite-demo-query"
export { useSatelliteDemoByIdQuery } from "./use-satellite-demo-by-id-query"
export { useSatelliteUserQuery } from "./use-satellite-user-query"
export { useSatelliteUserByIdQuery } from "./use-satellite-user-by-id-query"
export {
  satelliteDemoToSatelliteMap,
  satelliteDemoListToSatelliteMap,
} from "./satellite-demo-to-map"

export type {
  SatelliteDemoByIdMergedResponse,
  SatelliteDemoByIdResponse,
  SatelliteDemoItem,
  SatelliteDemoMergedResponse,
  SatelliteDemoQueryParams,
  SatelliteDemoResponse,
} from "../api/dto/satellite-demo"

export type { TleDemoLineItem, TleDemoResponse } from "../api/dto/tle-demo"

export type {
  SatelliteUserByIdMergedResponse,
  SatelliteUserByIdResponse,
  SatelliteUserItem,
  SatelliteUserMergedResponse,
  SatelliteUserQueryParams,
  SatelliteUserResponse,
} from "../api/dto/satellite-user"

export type { TleUserLineItem, TleUserResponse } from "../api/dto/tle-user"
