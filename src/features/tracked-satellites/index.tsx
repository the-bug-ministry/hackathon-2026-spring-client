import { SatelliteMetaCard } from "@/entities/satellite/ui"
import { useSatelliteCatalog } from "@/pages/dashboard/model/satellite-catalog-context"
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
}: {
  selectedSatellitesStr: string | undefined
  handleClose: (id: string) => void
  handleResetAll: () => void
  simulationTime: Date
}) => {
  const { catalog } = useSatelliteCatalog()

  const selectedIds = useMemo(() => {
    return selectedSatellitesStr
      ? selectedSatellitesStr.split(",").filter(Boolean)
      : []
  }, [selectedSatellitesStr])

  const selectedSatellites = useMemo(() => {
    return catalog.filter((sat) => selectedIds.includes(sat.id))
  }, [catalog, selectedIds])

  const selectedPositions = useMemo(() => {
    const map = new Map<string, OrbitalPosition>()
    selectedSatellites.forEach((satellite) => {
      const position = propagateSatellitePosition(satellite, simulationTime)
      if (position) {
        map.set(satellite.id, position)
      }
    })
    return map
  }, [selectedSatellites, simulationTime])

  return (
    <div className="absolute right-4 bottom-4 flex max-h-[calc(100vh-112px)] w-[360px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur">
      <div className="shrink-0 border-b border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>Выбрано спутников: {selectedSatellites.length}</span>
          {selectedSatellites.length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-full border border-border/80 px-3 py-0.5 text-[11px] font-semibold text-emerald-400 transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Сбросить все
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {selectedSatellites.length > 0 ? (
          <div className="space-y-3 p-4">
            {selectedSatellites.map((satellite) => {
              const position = selectedPositions.get(satellite.id)
              const altitude = position?.altitudeKm ?? satellite.altitudeKm
              const speed = position?.speedKms ?? satellite.speedKms
              const periodMin = calculateOrbitalPeriodMin(altitude)

              return (
                <div key={satellite.id} className="shrink-0">
                  <SatelliteMetaCard
                    name={satellite.name}
                    type={satellite.type}
                    country={satellite.country}
                    operator={satellite.operator}
                    mission={satellite.mission}
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
                Спутники не выбраны
              </div>
              <div className="text-xs text-muted-foreground/70">
                Выберите спутники на карте
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
