import { satellitesMock, type SatelliteMap } from "../model"
import { satellitesTleMock } from "../model/mock/satellites-tle-mock"

const tleByNoradId = new Map(
  satellitesTleMock.map((item) => [item.noradId, item])
)

export const satellitesMapMock: SatelliteMap[] = satellitesMock.map(
  (satellite) => {
    const tle = tleByNoradId.get(satellite.noradId)

    return {
      ...satellite,
      tle1: tle?.tle1 ?? "",
      tle2: tle?.tle2 ?? "",
    }
  }
)
