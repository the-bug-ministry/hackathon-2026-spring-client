import { getRouteApi } from "@tanstack/react-router"
import { TrackedSatellites } from "../../features/tracked-satellites"
import { EarthMap2D } from "@/features/earth-map-2d"
import { EarthGlobe3D } from "@/features/earth-globe-3d"
import { useSatelliteCatalog } from "@/pages/dashboard/model/satellite-catalog-context"
import { MapViewSwitcher } from "./ui/map-view-switcher"
import { useMapViewStore } from "./model"
import { SimulationControlPanel } from "@/features/simulation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"
import { Button } from "@/shared/components/ui/button"
import { SatelliteIcon } from "lucide-react"

const formatSimulationTime = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const SPEED_LEVELS = [1, 2, 4, 8, 16, 32]

export function DashboardPage() {
  const { catalog: satellitesCatalog } = useSatelliteCatalog()
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
    const isSameAsOnly =
      selectedIds.length === 1 && selectedIds[0] === satelliteId
    setSatelliteSearch(isSameAsOnly ? [] : [satelliteId])
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

  const [simulationTimeMs, setSimulationTimeMs] = useState(() => Date.now())
  const [isPlaying, setIsPlaying] = useState(true)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(
    SPEED_LEVELS[0]
  )
  const [isTrackedSheetOpen, setTrackedSheetOpen] = useState(false)
  const animationFrameRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    lastFrameTimeRef.current = performance.now()

    const tick = (now: number) => {
      const delta = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now
      setSimulationTimeMs((previous) => previous + delta * speedMultiplier)
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, speedMultiplier])

  const handleTogglePlay = () => setIsPlaying((prev) => !prev)
  const handleStepBack = () =>
    setSimulationTimeMs((previous) => previous - 15000)
  const handleStepForward = () =>
    setSimulationTimeMs((previous) => previous + 15000)
  const handleResetSimulation = () => setSimulationTimeMs(Date.now())

  const handleCycleSpeed = () => {
    setSpeedMultiplier((previous) => {
      const currentIndex = SPEED_LEVELS.indexOf(previous)
      const nextIndex = (currentIndex + 1) % SPEED_LEVELS.length
      return SPEED_LEVELS[nextIndex]
    })
  }

  const simulationTime = useMemo(
    () => new Date(simulationTimeMs),
    [simulationTimeMs]
  )
  const currentTimeLabel = useMemo(
    () => formatSimulationTime(simulationTime),
    [simulationTime]
  )

  return (
    <div className="relative inset-0">
      <div className="relative inset-0 m-2 h-[90vh] overflow-hidden rounded-2xl">
        {mapView === "2d" ? (
          <EarthMap2D
            satellites={satellitesCatalog}
            simulationTime={simulationTime}
            trackedSatelliteIds={selectedIds}
            onSatelliteClick={handleSelectSatellite}
          />
        ) : (
          <EarthGlobe3D
            satellites={satellitesCatalog}
            simulationTime={simulationTime}
            trackedSatelliteIds={selectedIds}
            onSatelliteClick={handleSelectSatellite}
          />
        )}
      </div>

      <MapViewSwitcher value={mapView} onValueChange={setMapView} />

      <div className="pointer-events-none absolute inset-0 bottom-0 z-20">
        <SimulationControlPanel
          currentTime={currentTimeLabel}
          isPlaying={isPlaying}
          speedLabel={`${speedMultiplier}x`}
          onTogglePlay={handleTogglePlay}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onReset={handleResetSimulation}
          onSpeedChange={handleCycleSpeed}
        />
      </div>

      <div className="hidden md:block">
        <TrackedSatellites
          selectedSatellitesStr={selectedSatellitesStr}
          handleClose={handleCloseSatellite}
          handleResetAll={handleResetTracked}
          simulationTime={simulationTime}
          variant="desktop"
        />
      </div>

      <div className="md:hidden max-h-screen">
        <Sheet open={isTrackedSheetOpen} onOpenChange={setTrackedSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-32 right-4 z-30 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/40 hover:bg-primary/90"
              size="sm"
            >
              <SatelliteIcon className="size-4 mr-2" />
              Отслеживаемые
              {selectedIds.length > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-2 text-xs font-semibold">
                  {selectedIds.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[88vh] max-h-[88vh] rounded-t-3xl p-0 flex flex-col overflow-hidden"
            showCloseButton
          >
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="px-4 py-2 text-base">Отслеживаемые спутники</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto p-3 pt-2 pb-6">
              <TrackedSatellites
                selectedSatellitesStr={selectedSatellitesStr}
                handleClose={handleCloseSatellite}
                handleResetAll={handleResetTracked}
                simulationTime={simulationTime}
                variant="mobile"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
