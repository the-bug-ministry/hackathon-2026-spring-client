/** Строка TLE из GET /tle/demo (сопоставление с спутником по noradId) */
export type TleDemoLineItem = {
  noradId: number
  tle1: string
  tle2: string
}

export type TleDemoResponse = {
  data: TleDemoLineItem[]
}
