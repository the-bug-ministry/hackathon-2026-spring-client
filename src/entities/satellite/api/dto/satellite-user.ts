import type {
  SatelliteDemoByIdMergedResponse,
  SatelliteDemoByIdRequestParams,
  SatelliteDemoByIdResponse,
  SatelliteDemoItem,
  SatelliteDemoMergedResponse,
  SatelliteDemoQueryParams,
  SatelliteDemoRequestParams,
  SatelliteDemoResponse,
} from "./satellite-demo"

/**
 * Пользовательский каталог — те же поля и контракты, что у демо,
 * но GET …/satellite/user, …/satellite/user/:id
 */
export type SatelliteUserResponse = SatelliteDemoResponse

export type SatelliteUserQueryParams = SatelliteDemoQueryParams

export type SatelliteUserRequestParams = SatelliteDemoRequestParams

export type SatelliteUserItem = SatelliteDemoItem

export type SatelliteUserMergedResponse = SatelliteDemoMergedResponse

export type SatelliteUserByIdResponse = SatelliteDemoByIdResponse

export type SatelliteUserByIdRequestParams = SatelliteDemoByIdRequestParams

export type SatelliteUserByIdMergedResponse = SatelliteDemoByIdMergedResponse
