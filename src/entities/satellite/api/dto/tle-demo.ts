/** Элемент списка демо TLE с бэка */
export type TleDemoItem = {
  noradId: number
  tle1: string
  tle2: string
}

/** Тело ответа GET /tle/demo */
export type TleDemoResponse = {
  data: TleDemoItem[]
}

/** Параметры запроса (query) без signal */
export type TleDemoQueryParams = {
  country?: string
  type?: string
  mission?: string
}

export type TleDemoRequestParams = TleDemoQueryParams & {
  signal?: AbortSignal
}
