import type { Satellite } from "@/entities/satellite/model"
import type { SatelliteDemoItem } from "../api/dto/satellite-demo"
import type { TleDemoLineItem } from "../api/dto/tle-demo"

/**
 * Склеивает список спутников с массивом TLE по noradId.
 * Поля tle1/tle2 из самого объекта Satellite (если бэк отдал их в /satellite/demo) имеют приоритет.
 */
export function mergeSatelliteDemoWithTle(
  satellites: Satellite[],
  tleLines: TleDemoLineItem[]
): SatelliteDemoItem[] {
  const byNorad = new Map(tleLines.map((t) => [t.noradId, t]))

  return satellites.map((s) => {
    const fromApi = byNorad.get(s.noradId)
    const embedded = s as Satellite & { tle1?: string; tle2?: string }
    return {
      ...s,
      tle1: embedded.tle1 ?? fromApi?.tle1 ?? "",
      tle2: embedded.tle2 ?? fromApi?.tle2 ?? "",
    }
  })
}
