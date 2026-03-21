import { getRouteApi } from "@tanstack/react-router"
import { TrackedSatellites } from "../../features/tracked-satellites"
import { EarthMap2D } from "@/features/earth-map-2d"
import { satellitesMapMock } from "@/entities/satellite/lib/marge"
import { EarthGlobe3D } from "@/features/earth-globe-3d"
import { MapViewSwitcher } from "./ui/map-view-switcher"
import { useMapViewStore } from "./model"
import { SimulationControlPanel } from "@/features/simulation"
import { useEffect, useMemo, useRef, useState } from "react"

const formatSimulationTime = (date: Date) => {
    const pad = (value: number) => value.toString().padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const SPEED_LEVELS = [1, 2, 4, 8]

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

    const [simulationTimeMs, setSimulationTimeMs] = useState(() => Date.now())
    const [isPlaying, setIsPlaying] = useState(true)
    const [speedMultiplier, setSpeedMultiplier] = useState<number>(SPEED_LEVELS[0])
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
    const handleStepBack = () => setSimulationTimeMs((previous) => previous - 15000)
    const handleStepForward = () => setSimulationTimeMs((previous) => previous + 15000)
    const handleResetSimulation = () => setSimulationTimeMs(Date.now())

    const handleCycleSpeed = () => {
        setSpeedMultiplier((previous) => {
            const currentIndex = SPEED_LEVELS.indexOf(previous)
            const nextIndex = (currentIndex + 1) % SPEED_LEVELS.length
            return SPEED_LEVELS[nextIndex]
        })
    }

    const simulationTime = useMemo(() => new Date(simulationTimeMs), [simulationTimeMs])
    const currentTimeLabel = useMemo(
        () => formatSimulationTime(simulationTime),
        [simulationTime]
    )

    return (
        <div className="relative inset-0">
            <div className="relative inset-0 m-2 h-[90vh] overflow-hidden rounded-2xl">
                {mapView === "2d" ? (
                    <EarthMap2D
                        satellites={satellitesMapMock}
                        simulationTime={simulationTime}
                        trackedSatelliteIds={selectedIds}
                        onSatelliteClick={handleSelectSatellite}
                    />
                ) : (
                    <EarthGlobe3D
                        satellites={satellitesMapMock}
                        simulationTime={simulationTime}
                        trackedSatelliteIds={selectedIds}
                        onSatelliteClick={handleSelectSatellite}
                    />
                )}
            </div>

            <MapViewSwitcher value={mapView} onValueChange={setMapView} />

            <div className="pointer-events-none absolute inset-0 bottom-2 z-20">
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

            <TrackedSatellites
                selectedSatellitesStr={selectedSatellitesStr}
                handleClose={handleCloseSatellite}
                handleResetAll={handleResetTracked}
            />
        </div>
    )
}
