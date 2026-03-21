import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useQuery } from "@tanstack/react-query"
import type { SatelliteMap } from "@/entities/satellite/model"
import { satellitesMapMock } from "@/entities/satellite/lib/marge"
import { satelliteDemoListToSatelliteMap } from "@/entities/satellite/lib/satellite-demo-to-map"
import { satelliteOptions } from "@/entities/satellite/api/contracts/satellite.options"
import { isSatelliteMockMode } from "@/shared/config/satellite-data-source"

/** Включить вкладку «Мои данные» и загрузку TLE пользователя (пока false) */
export const ENABLE_USER_SATELLITE_LAYER = false

export type SatelliteDataLayer = "demo" | "user"

function filterMockCatalog(
  list: SatelliteMap[],
  search: string,
  orbit: string,
  country: string,
  mission: string,
): SatelliteMap[] {
  return list.filter((satellite) => {
    const matchesSearch =
      satellite.name.toLowerCase().includes(search.toLowerCase()) ||
      satellite.desc.toLowerCase().includes(search.toLowerCase())

    const matchesOrbit =
      orbit === "all" ||
      satellite.type.toLowerCase() === orbit.toLowerCase()

    const matchesCountry =
      country === "all" ||
      (satellite.country &&
        satellite.country.toLowerCase() === country.toLowerCase())

    const matchesMission =
      mission === "all" ||
      (satellite.mission &&
        satellite.mission.toLowerCase() === mission.toLowerCase())

    return matchesSearch && matchesOrbit && matchesCountry && matchesMission
  })
}

type SatelliteCatalogContextValue = {
  catalog: SatelliteMap[]
  isLoading: boolean
  isError: boolean
  isMockSource: boolean
  satelliteDataLayer: SatelliteDataLayer
  setSatelliteDataLayer: (layer: SatelliteDataLayer) => void
  userLayerEnabled: boolean
  search: string
  setSearch: (v: string) => void
  orbit: string
  setOrbit: (v: string) => void
  country: string
  setCountry: (v: string) => void
  mission: string
  setMission: (v: string) => void
}

const SatelliteCatalogContext =
  createContext<SatelliteCatalogContextValue | null>(null)

export function SatelliteCatalogProvider({ children }: { children: ReactNode }) {
  const [satelliteDataLayer, setSatelliteDataLayerState] =
    useState<SatelliteDataLayer>("demo")
  const [search, setSearch] = useState("")
  const [orbit, setOrbit] = useState("all")
  const [country, setCountry] = useState("all")
  const [mission, setMission] = useState("all")

  const setSatelliteDataLayer = useCallback((layer: SatelliteDataLayer) => {
    if (layer === "user" && !ENABLE_USER_SATELLITE_LAYER) {
      return
    }
    setSatelliteDataLayerState(layer)
  }, [])

  const isMockSource = isSatelliteMockMode()

  const demoParams = useMemo(
    () => ({
      country: country === "all" ? undefined : country,
      type: orbit === "all" ? undefined : orbit,
      mission: mission === "all" ? undefined : mission,
    }),
    [country, orbit, mission],
  )

  const demoQuery = useQuery({
    ...satelliteOptions.satelliteDemo(demoParams),
    enabled: !isMockSource && satelliteDataLayer === "demo",
    placeholderData: (previousData) => previousData,
  })

  const catalog = useMemo(() => {
    if (isMockSource) {
      return filterMockCatalog(
        satellitesMapMock,
        search,
        orbit,
        country,
        mission,
      )
    }

    if (satelliteDataLayer === "user") {
      return []
    }

    const items = demoQuery.data?.data ?? []
    let mapped = satelliteDemoListToSatelliteMap(items)
    if (search.trim()) {
      const q = search.toLowerCase()
      mapped = mapped.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || String(s.noradId).includes(q),
      )
    }
    return mapped
  }, [
    satelliteDataLayer,
    isMockSource,
    demoQuery.data,
    search,
    orbit,
    country,
    mission,
  ])

  const isLoading =
    satelliteDataLayer === "demo" &&
    !isMockSource &&
    demoQuery.isPending &&
    !demoQuery.data
  const isError =
    satelliteDataLayer === "demo" && !isMockSource && demoQuery.isError

  const value: SatelliteCatalogContextValue = {
    catalog,
    isLoading,
    isError,
    isMockSource,
    satelliteDataLayer,
    setSatelliteDataLayer,
    userLayerEnabled: ENABLE_USER_SATELLITE_LAYER,
    search,
    setSearch,
    orbit,
    setOrbit,
    country,
    setCountry,
    mission,
    setMission,
  }

  return (
    <SatelliteCatalogContext.Provider value={value}>
      {children}
    </SatelliteCatalogContext.Provider>
  )
}

export function useSatelliteCatalog(): SatelliteCatalogContextValue {
  const ctx = useContext(SatelliteCatalogContext)
  if (!ctx) {
    throw new Error(
      "useSatelliteCatalog must be used within SatelliteCatalogProvider",
    )
  }
  return ctx
}
