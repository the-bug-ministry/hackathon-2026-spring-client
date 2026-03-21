import { satellitesMock } from "@/entities/satellite/model"
import { SatelliteMetaCard } from "@/entities/satellite/ui"
import { useMemo } from "react"

export const TrackedSatellites = ({
  selectedSatellitesStr,
  handleClose,
}: {
  selectedSatellitesStr: string | undefined
  handleClose: (id: string) => void
}) => {
  const selectedIds = useMemo(() => {
    return selectedSatellitesStr
      ? selectedSatellitesStr.split(",").filter(Boolean)
      : []
  }, [selectedSatellitesStr])

  const selectedSatellites = useMemo(() => {
    return satellitesMock.filter((sat) => selectedIds.includes(sat.id))
  }, [selectedIds])

    return (
        <div className="absolute bottom-4 right-4 w-[380px] max-h-[calc(100vh-82px)] flex flex-col border border-border/70 rounded-2xl bg-background/95 backdrop-blur overflow-hidden shadow-2xl">
                <div className="border-b border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground shrink-0">
                    Выбрано спутников: {selectedSatellites.length}
                </div>
                <div className="flex-1 overflow-auto">
                    {selectedSatellites.length > 0 ? (
                        <div className="space-y-3 p-4">
                            {selectedSatellites.map((satellite) => (
                                <div key={satellite.id} className="shrink-0">
                                    <SatelliteMetaCard
                                        name={satellite.name}
                                        type={satellite.type}
                                        country={satellite.country}
                                        operator={satellite.operator}
                                        mission={satellite.mission}
                                        latitude={0}
                                        longitude={0}
                                        altitudeKm={satellite.altitudeKm}
                                        speedKms={satellite.speedKms}
                                        periodMin={92.9}
                                        flybys={[
                                            { time: '02:54', visible: false },
                                            { time: '04:27', visible: false },
                                            { time: '06:00', visible: true },
                                        ]}
                                        onClose={() => handleClose(satellite.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center">
                            <div className="space-y-2 p-6">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Спутники не выбраны
                                </div>
                                <div className="text-xs text-muted-foreground/70">
                                    Выберите спутники в списке слева
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    )
}
