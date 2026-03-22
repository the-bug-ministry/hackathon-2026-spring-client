import { SatelliteMetaCard } from "@/entities/satellite/ui"
import { useSatelliteDemoByIdQuery } from "@/entities/satellite/lib"
import type { SatelliteMap } from "@/entities/satellite/model"
import { useSatelliteCatalog } from "@/pages/dashboard/model/satellite-catalog-context"
import { isSatelliteMockMode } from "@/shared/config/satellite-data-source"
import { useMemo } from "react"
import {
  propagateSatellitePosition,
  calculateOrbitalPeriodMin,
} from "@/entities/satellite/lib/propagation"
import type { OrbitalPosition } from "@/entities/satellite/lib/propagation"

export const TrackedSatellites = ({
  selectedSatellitesStr,
  handleClose,
  handleResetAll,
  simulationTime,
  variant = "desktop",
}: {
  selectedSatellitesStr: string | undefined
  handleClose: (id: string) => void
  handleResetAll: () => void
  simulationTime: Date
  variant?: "desktop" | "mobile"
}) => {
  const { catalog } = useSatelliteCatalog()

  const selectedIds = useMemo(() => {
    return selectedSatellitesStr
      ? selectedSatellitesStr.split(",").filter(Boolean)
      : []
  }, [selectedSatellitesStr])

  const isMock = isSatelliteMockMode()
  const detailId =
    !isMock && selectedIds.length === 1 ? selectedIds[0] : undefined
  const detailQuery = useSatelliteDemoByIdQuery(detailId)

  const selectedSatellites = useMemo(() => {
    return catalog.filter((sat) => selectedIds.includes(sat.id))
  }, [catalog, selectedIds])

  /** Каталог + при одном выборе — ответ GET /satellite/demo/:id (после клика) */
  const resolvedSatellites = useMemo(() => {
    const map = new Map<string, SatelliteMap>()
    const detail = detailQuery.data?.data
    for (const sat of selectedSatellites) {
      const resolved =
        selectedIds.length === 1 && detail?.id === sat.id ? detail : sat
      map.set(sat.id, resolved)
    }
    return map
  }, [selectedSatellites, selectedIds.length, detailQuery.data])

  const selectedPositions = useMemo(() => {
    const map = new Map<string, OrbitalPosition>()
    selectedSatellites.forEach((satellite) => {
      const resolved = resolvedSatellites.get(satellite.id) ?? satellite
      const position = propagateSatellitePosition(resolved, simulationTime)
      if (position) {
        map.set(satellite.id, position)
      }
    })
    return map
  }, [selectedSatellites, resolvedSatellites, simulationTime])

  const wrapperClass =
    variant === "desktop"
      ? "absolute right-4 bottom-4 flex max-h-[calc(100vh-112px)] w-[346px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur"
      : "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-xl"

  const listPadding = variant === "desktop" ? "space-y-3 p-4" : "space-y-3 p-3"

  return (
    <div className={wrapperClass}>
      <div className="shrink-0 border-b border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>
            {selectedSatellites.length === 0
              ? "Спутник не выбран"
              : "Выбранный спутник"}
          </span>
          {selectedSatellites.length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-full border border-border/80 px-3 py-0.5 text-[11px] font-semibold text-emerald-400 transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {selectedSatellites.length > 0 ? (
          <div className={listPadding}>
            {selectedSatellites.map((satellite) => {
              const resolved = resolvedSatellites.get(satellite.id) ?? satellite
              const position = selectedPositions.get(satellite.id)
              const altitude = position?.altitudeKm ?? resolved.altitudeKm
              const speed = position?.speedKms ?? resolved.speedKms
              const periodMin = calculateOrbitalPeriodMin(altitude)

              return (
                <div key={satellite.id} className="shrink-0">
                  <SatelliteMetaCard
                    name={resolved.name}
                    type={resolved.type}
                    country={resolved.country}
                    operator={resolved.operator}
                    mission={resolved.mission}
                    latitude={position?.lat ?? 0}
                    longitude={position?.lng ?? 0}
                    altitudeKm={Math.round(altitude)}
                    speedKms={speed}
                    periodMin={periodMin}
                    flybys={[
                      { time: "02:54", visible: false },
                      { time: "04:27", visible: false },
                      { time: "06:00", visible: true },
                    ]}
                    onClose={() => handleClose(satellite.id)}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2 p-6">
              <div className="text-sm font-medium text-muted-foreground">
                Спутник не выбраны
              </div>
              <div className="text-xs text-muted-foreground/70">
                Наведите на точку — траектория; клик — карточка здесь
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
