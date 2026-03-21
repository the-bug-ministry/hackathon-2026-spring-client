import type { Satellite } from "@/entities/satellite/model"

/** Сырой ответ GET /satellite/demo (метаданные; TLE могут быть в теле или подмешиваются из /tle/demo) */
export type SatelliteDemoResponse = {
  data: Satellite[]
}

/** Запись после слияния метаданных и TLE — готова для SatelliteMap */
export type SatelliteDemoItem = Satellite & {
  tle1: string
  tle2: string
}

/** Результат React Query: демо-каталог с TLE для карты */
export type SatelliteDemoMergedResponse = {
  data: SatelliteDemoItem[]
}

export type SatelliteDemoQueryParams = {
  country?: string
  type?: string
  mission?: string
}

export type SatelliteDemoRequestParams = SatelliteDemoQueryParams & {
  signal?: AbortSignal
}

/** Ответ GET /satellite/demo/:id — одна карточка спутника */
export type SatelliteDemoByIdResponse = {
  data: Satellite
}

export type SatelliteDemoByIdRequestParams = {
  id: string
  signal?: AbortSignal
}

/** После слияния с TLE из GET /tle/demo */
export type SatelliteDemoByIdMergedResponse = {
  data: SatelliteDemoItem
}
