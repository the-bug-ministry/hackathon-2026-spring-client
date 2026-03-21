import { getRouteApi } from "@tanstack/react-router"
import { TrackedSatellites } from "../../features/tracked-satellites"
import { EarthMap } from "@/features/earth-map"
import { satellitesMapMock } from "@/entities/satellite/lib/marge"

export function DashboardPage() {
  const route = getRouteApi("/_home/dashboard")
  const { satellites: selectedSatellitesStr } = route.useSearch()
  const navigate = route.useNavigate()

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
    <div className="absolute inset-0">
      <div className="absolute inset-0 m-2 overflow-hidden rounded-2xl">
        <EarthMap satellites={selectedSatellites} />
      </div>

      <TrackedSatellites
        selectedSatellitesStr={selectedSatellitesStr}
        handleClose={handleCloseSatellite}
      />
    </div>
  )
}
