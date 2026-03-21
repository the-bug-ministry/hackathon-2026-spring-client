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

  const selectedSatellites = satellitesMapMock.filter((sat) =>
    selectedIds.includes(sat.id)
  )

  const handleCloseSatellite = (satelliteId: string) => {
    navigate({
      search: (prev) => {
        const current = prev.satellites
          ? prev.satellites.split(",").filter(Boolean)
          : []

        const next = current.filter((id) => id !== satelliteId)

        return {
          ...prev,
          satellites: next.join(","),
        }
      },
    })
  }

  return (
    <div className="relative inset-0">
      <div className="relative inset-0 m-2 h-[90vh] overflow-hidden rounded-2xl">
        {mapView === "2d" ? (
          <EarthMap2D satellites={selectedSatellites} />
        ) : (
          <EarthGlobe3D />
        )}
      </div>

      <MapViewSwitcher value={mapView} onValueChange={setMapView} />

      <div className="pointer-events-none absolute inset-0 bottom-2 z-20">
        <SimulationControlPanel
          currentTime="2026-03-21 11:40:22"
          isPlaying={true}
          speedLabel="1x"
          // onTogglePlay={() => setIsPlaying((prev) => !prev)}
          onTogglePlay={() => {}}
          onStepBack={() => console.log("step back")}
          onStepForward={() => console.log("step forward")}
          onReset={() => console.log("reset")}
        />
      </div>

      <TrackedSatellites
        selectedSatellitesStr={selectedSatellitesStr}
        handleClose={handleCloseSatellite}
      />
    </div>
  )
}
