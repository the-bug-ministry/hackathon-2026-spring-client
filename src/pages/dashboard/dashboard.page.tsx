import { getRouteApi } from "@tanstack/react-router"
import { TrackedSatellites } from "../../features/tracked-satellites"
import { EarthMap2D } from "@/features/earth-map-2d"
import { satellitesMapMock } from "@/entities/satellite/lib/marge"
import { EarthGlobe3D } from "@/features/earth-globe-3d"
import { MapViewSwitcher } from "./ui/map-view-switcher"
import { useMapViewStore } from "./model"
import { SimulationControlPanel } from "@/features/simulation"

export function DashboardPage() {
    const route = getRouteApi("/_home/dashboard")
    const { satellites: selectedSatellitesStr } = route.useSearch()
    const navigate = route.useNavigate()

    const mapView = useMapViewStore((state) => state.mapView)
    const setMapView = useMapViewStore((state) => state.setMapView)

    const selectedIds = selectedSatellitesStr
        ? selectedSatellitesStr.split(",").filter(Boolean)
        : []

    const setSatelliteSearch = (ids: string[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                satellites: ids.length ? ids.join(",") : undefined,
            }),
        })
    }

    const handleSelectSatellite = (satelliteId: string) => {
        if (selectedIds.includes(satelliteId)) {
            return
        }

        setSatelliteSearch([...selectedIds, satelliteId])
    }

    const handleCloseSatellite = (satelliteId: string) => {
        const next = selectedIds.filter((id) => id !== satelliteId)
        setSatelliteSearch(next)
    }

    const handleResetTracked = () => {
        navigate({
            search: (prev) => {
                const next = { ...prev }
                delete next.satellites
                return next
            },
        })
    }

    return (
        <div className="relative inset-0">
            <div className="relative inset-0 m-2 h-[90vh] overflow-hidden rounded-2xl">
                {mapView === "2d" ? (
                    <EarthMap2D
                        satellites={satellitesMapMock}
                        trackedSatelliteIds={selectedIds}
                        onSatelliteClick={handleSelectSatellite}
                    />
                ) : (
                    <EarthGlobe3D
                        satellites={satellitesMapMock}
                        trackedSatelliteIds={selectedIds}
                        onSatelliteClick={handleSelectSatellite}
                    />
                )}
            </div>

            <MapViewSwitcher value={mapView} onValueChange={setMapView} />

            <div className="pointer-events-none absolute inset-0 bottom-2 z-20">
                <SimulationControlPanel
                    currentTime="2026-03-21 11:40:22"
                    isPlaying={true}
                    speedLabel="1x"
                    // onTogglePlay={() => setIsPlaying((prev) => !prev)}
                    onTogglePlay={() => { }}
                    onStepBack={() => console.log("step back")}
                    onStepForward={() => console.log("step forward")}
                    onReset={() => console.log("reset")}
                />
            </div>

            <TrackedSatellites
                selectedSatellitesStr={selectedSatellitesStr}
                handleClose={handleCloseSatellite}
                handleResetAll={handleResetTracked}
            />
        </div>
    )
}
