"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import clsx from "clsx"
import { OrbitPreloader } from "@/shared/components/ui/orbit-preloader"
import type { SatelliteMap } from "@/entities/satellite/model"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { Topology, GeometryCollection } from "topojson-specification"
import { propagateSatellitePosition } from "@/entities/satellite/lib/propagation"
import type { OrbitalPosition } from "@/entities/satellite/lib/propagation"

const atlas = worldAtlas as unknown as Topology<{
  countries: GeometryCollection
}>
const COUNTRY_FEATURES = feature(
  atlas,
  atlas.objects.countries
) as GeoJSON.FeatureCollection
const BORDER_MESH = mesh(
  atlas,
  atlas.objects.countries,
  (a, b) => a !== b
) as unknown as GeoJSON.Feature<GeoJSON.MultiLineString>

type EarthGlobe3DProps = {
  className?: string
  satellites?: SatelliteMap[]
  trackedSatelliteIds?: string[]
  onSatelliteClick?: (id: string) => void
  simulationTime?: Date
}

type SatellitePointProps = {
  lat: number
  lng: number
  name: string
  altitudeKm: number
  showLabel?: boolean
  labelOpacity?: number
}

type SatPosition = OrbitalPosition

type RenderedSatellite3D = {
  id: string
  name: string
  type: string
  current: SatPosition | null
  path: Array<[number, number]>
}

type GlobeTheme = "dark" | "light"

const EARTH_RADIUS_KM = 6371
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

const MIN_GLOBE_LABEL_OPACITY = 0.35
const MAX_GLOBE_LABEL_OPACITY = 1

function getGlobeLabelOpacity(distance: number) {
  const normalized = Math.min(1, Math.max(0, (distance - 3) / 6))
  return (
    MIN_GLOBE_LABEL_OPACITY +
    (1 - normalized) * (MAX_GLOBE_LABEL_OPACITY - MIN_GLOBE_LABEL_OPACITY)
  )
}

function GlobeLabelOpacityController({
  setOpacity,
}: {
  setOpacity: (value: number) => void
}) {
  const lastUpdateRef = useRef(0)

  useFrame(({ camera }) => {
    const now = performance.now()
    if (now - lastUpdateRef.current < 120) return
    lastUpdateRef.current = now
    setOpacity(getGlobeLabelOpacity(camera.position.length()))
  })

  return null
}
function latLngToVector3(lat: number, lng: number, radius = 2.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

function buildTrack(
  satellite: SatelliteMap,
  now: Date,
  minutesBack = 30,
  minutesForward = 90,
  stepSec = 60
) {
  const points: Array<[number, number]> = []

  if (!satellite.tle1 || !satellite.tle2) return points

  for (
    let offset = -minutesBack * 60;
    offset <= minutesForward * 60;
    offset += stepSec
  ) {
    const date = new Date(now.getTime() + offset * 1000)
    const pos = propagateSatellitePosition(satellite, date)
    if (pos) points.push([pos.lng, pos.lat])
  }

  return points
}

function splitTrackOnDateline(points: Array<[number, number]>) {
  if (!points.length) return []

  const segments: Array<Array<[number, number]>> = []
  let current: Array<[number, number]> = [points[0]]

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const next = points[i]
    const lngDiff = Math.abs(next[0] - prev[0])

    if (lngDiff > 180) {
      segments.push(current)
      current = []
    }

    current.push(next)
  }

  if (current.length) segments.push(current)

  return segments
}

function buildTrackSegmentPositions(
  path: Array<[number, number]>,
  radius = 2.02
) {
  if (!path.length) return []

  const segments = splitTrackOnDateline(path)
  return segments.map((segment) => {
    const positions = new Float32Array(segment.length * 3)

    segment.forEach(([lng, lat], index) => {
      const point = latLngToVector3(lat, lng, radius)
      const offset = index * 3
      positions[offset] = point.x
      positions[offset + 1] = point.y
      positions[offset + 2] = point.z
    })

    return positions
  })
}

function buildCoverageCirclePositions(
  lat: number,
  lng: number,
  altitudeKm: number,
  resolution = 64,
  radius = 2.008
) {
  const positions = new Float32Array((resolution + 1) * 3)
  const sanitizedAltitude = Math.max(0, altitudeKm)
  const ratio = EARTH_RADIUS_KM / (EARTH_RADIUS_KM + sanitizedAltitude)
  const coverageAngle = Math.acos(Math.min(1, Math.max(-1, ratio)))
  const latRad = lat * DEG_TO_RAD
  const lngRad = lng * DEG_TO_RAD

  for (let i = 0; i <= resolution; i++) {
    const bearing = (i / resolution) * 2 * Math.PI
    const sinLat2 =
      Math.sin(latRad) * Math.cos(coverageAngle) +
      Math.cos(latRad) * Math.sin(coverageAngle) * Math.cos(bearing)
    const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)))

    const numerator =
      Math.sin(bearing) * Math.sin(coverageAngle) * Math.cos(latRad)
    const denominator =
      Math.cos(coverageAngle) - Math.sin(latRad) * Math.sin(lat2)
    const lon2 = lngRad + Math.atan2(numerator, denominator)

    const degLat = lat2 * RAD_TO_DEG
    const degLng = lon2 * RAD_TO_DEG
    const point = latLngToVector3(degLat, degLng, radius)
    const offset = i * 3

    positions[offset] = point.x
    positions[offset + 1] = point.y
    positions[offset + 2] = point.z
  }

  return positions
}

function useRenderedSatellites(
  satellites: SatelliteMap[],
  referenceTime: Date
) {
  return useMemo<RenderedSatellite3D[]>(() => {
    return satellites.map((sat) => ({
      id: sat.id,
      name: sat.name,
      type: sat.type,
      current: propagateSatellitePosition(sat, referenceTime),
      path: buildTrack(sat, referenceTime),
    }))
  }, [satellites, referenceTime])
}

function buildBorderPositions(
  featureLine: GeoJSON.Feature<GeoJSON.MultiLineString>
) {
  const coords = featureLine.geometry?.coordinates ?? []
  const positions: number[] = []

  coords.forEach((line) => {
    for (let i = 0; i < line.length; i++) {
      const [lng, lat] = line[i]
      const point = latLngToVector3(lat, lng, 2.012)
      positions.push(point.x, point.y, point.z)
    }
  })

  return new Float32Array(positions)
}

function createMapTexture(theme: GlobeTheme) {
  if (typeof document === "undefined") return null

  const width = 2048
  const height = 1024
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) return null

  const oceanColor = theme === "dark" ? "#020617" : "#dfe8f7"
  const landColor = theme === "dark" ? "#09132b" : "#b8c7f3"
  const borderColor =
    theme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.5)"

  context.fillStyle = oceanColor
  context.fillRect(0, 0, width, height)

  const projection = geoNaturalEarth1()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
  const path = geoPath(projection, context as CanvasRenderingContext2D)

  context.strokeStyle = borderColor
  context.lineWidth = 1.6

  COUNTRY_FEATURES.features.forEach((featureItem) => {
    context.beginPath()
    path(featureItem)
    context.fillStyle = landColor
    context.fill()
    context.stroke()
  })

  context.beginPath()
  path({ type: "Sphere" } as unknown as GeoJSON.Feature)
  context.strokeStyle =
    theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.5)"
  context.lineWidth = 2
  context.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipMapLinearFilter
  texture.anisotropy = 4
  texture.needsUpdate = true

  return texture
}

function SatellitePoint({
  lat,
  lng,
  name,
  showLabel = false,
  labelOpacity = 1,
}: SatellitePointProps) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.025), [lat, lng])

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
      </mesh>

      {showLabel && (
        <Html distanceFactor={12} center>
          <div
            className="pointer-events-none rounded-full bg-slate-950/70 px-2 py-0.5 text-[8px] font-semibold text-white/90 shadow-lg backdrop-blur"
            style={{ opacity: labelOpacity }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function MockSatelliteLayer({
  satellites = [],
}: {
  satellites?: SatelliteMap[]
}) {
  const fallback = [
    { id: "1", name: "ISS", lat: 20, lng: 30, altitudeKm: 420 },
    { id: "2", name: "HST", lat: -10, lng: 120, altitudeKm: 550 },
    { id: "3", name: "NOAA 20", lat: 48, lng: -75, altitudeKm: 850 },
  ]

  const points = satellites.length
    ? satellites.map((sat, index) => ({
        id: sat.id,
        name: sat.name,
        lat: ((index * 37) % 140) - 70,
        lng: ((index * 67) % 360) - 180,
        altitudeKm: sat.altitudeKm ?? 500,
      }))
    : fallback

  return (
    <>
      {points.map((point) => (
        <SatellitePoint
          key={point.id}
          lat={point.lat}
          lng={point.lng}
          name={point.name}
          altitudeKm={point.altitudeKm}
        />
      ))}
    </>
  )
}

function SatelliteTrack({ path }: { path: Array<[number, number]> }) {
  const segments = useMemo(() => buildTrackSegmentPositions(path), [path])
  if (!segments.length) return null

  return (
    <>
      {segments.map((positions, index) => (
        <line key={`track-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#38bdf8"
            linewidth={1.5}
            transparent
            opacity={0.85}
          />
        </line>
      ))}
    </>
  )
}

function SatelliteCoverageRing({
  lat,
  lng,
  altitudeKm,
}: {
  lat: number
  lng: number
  altitudeKm: number
}) {
  const positions = useMemo(
    () => buildCoverageCirclePositions(lat, lng, altitudeKm),
    [lat, lng, altitudeKm]
  )
  if (!positions.length) return null

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#34d399"
        transparent
        opacity={0.35}
        linewidth={1.2}
      />
    </line>
  )
}

function RenderedSatelliteMarker({
  satellite,
  isTracked,
  isHovered,
  onHoverChange,
  onSelect,
  labelOpacity,
}: {
  satellite: RenderedSatellite3D
  isTracked: boolean
  isHovered: boolean
  onHoverChange: (id: string | null) => void
  onSelect?: (id: string) => void
  labelOpacity?: number
}) {
  if (!satellite.current) return null

  const { current } = satellite
  const showTrajectory = isTracked || isHovered

  return (
    <group
      onPointerDown={(event) => {
        event.stopPropagation()
        onSelect?.(satellite.id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHoverChange(satellite.id)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        onHoverChange(null)
      }}
    >
      <SatellitePoint
        lat={current.lat}
        lng={current.lng}
        name={satellite.name}
        altitudeKm={current.altitudeKm}
        showLabel={showTrajectory}
        labelOpacity={labelOpacity}
      />
      {showTrajectory && (
        <>
          <SatelliteTrack path={satellite.path} />
          {isTracked && (
            <SatelliteCoverageRing
              lat={current.lat}
              lng={current.lng}
              altitudeKm={current.altitudeKm}
            />
          )}
        </>
      )}
    </group>
  )
}

function SatelliteVisualizationLayer({
  satellites = [],
  trackedSatelliteIds = [],
  hoveredSatelliteId,
  onSatelliteHover,
  simulationTime,
  onSatelliteClick,
  labelOpacity = 1,
}: {
  satellites?: SatelliteMap[]
  trackedSatelliteIds?: string[]
  hoveredSatelliteId: string | null
  onSatelliteHover: (id: string | null) => void
  simulationTime?: Date
  onSatelliteClick?: (id: string) => void
  labelOpacity?: number
}) {
  const rendered = useRenderedSatellites(
    satellites,
    simulationTime ?? new Date()
  )
  const trackedSet = useMemo(
    () => new Set(trackedSatelliteIds ?? []),
    [trackedSatelliteIds]
  )

  if (!rendered.length) {
    return <MockSatelliteLayer satellites={satellites} />
  }

  return (
    <>
      {rendered.map((satellite) => (
        <RenderedSatelliteMarker
          key={satellite.id}
          satellite={satellite}
          isTracked={trackedSet.has(satellite.id)}
          isHovered={hoveredSatelliteId === satellite.id}
          onHoverChange={onSatelliteHover}
          onSelect={onSatelliteClick}
          labelOpacity={labelOpacity}
        />
      ))}
    </>
  )
}

export function EarthGlobe3D({
  className,
  satellites = [],
  trackedSatelliteIds = [],
  onSatelliteClick,
  simulationTime,
}: EarthGlobe3DProps) {
  const [theme, setTheme] = useState<GlobeTheme>("dark")
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [globeLabelOpacity, setGlobeLabelOpacity] = useState(1)
  const [hoveredSatelliteId, setHoveredSatelliteId] = useState<string | null>(
    null
  )

  useEffect(() => {
    const resolveTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light"

    const updateTheme = () => setTheme(resolveTheme())
    updateTheme()

    const observer = new MutationObserver(() => updateTheme())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fallback = window.setTimeout(() => setIsSceneReady(true), 1500)
    return () => window.clearTimeout(fallback)
  }, [])

  const mapTexture = useMemo(() => createMapTexture(theme), [theme])
  const borderPositions = useMemo(() => buildBorderPositions(BORDER_MESH), [])

  const earthMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: mapTexture ?? undefined,
      color: mapTexture ? "#f8fafc" : "#16325c",
      roughness: 0.6,
      metalness: 0.08,
      emissive: mapTexture ? "#050b15" : "#030711",
      emissiveIntensity: 0.3,
    })

    if (mapTexture) {
      mapTexture.needsUpdate = true
    }

    return mat
  }, [mapTexture])

  const isDark = theme === "dark"
  const glowColor = isDark ? "#60a5fa" : "#22c55e"
  const borderColor = isDark
    ? "rgba(148, 163, 184, 0.65)"
    : "rgba(15, 23, 42, 0.9)"

  return (
    <div
      className={clsx(
        "relative h-full min-h-full w-full overflow-hidden rounded-2xl",
        className
      )}
    >
      {!isSceneReady && (
        <OrbitPreloader
          label="Загружаем 3D‑глобус"
          hint="Прогреваем текстуры и орбиты"
        />
      )}

      <div
        className={clsx(
          "h-full w-full transition-opacity duration-700",
          isSceneReady ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950/60" />
        <Canvas
          className="relative h-full w-full"
          style={{ height: "100%" }}
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={() => setIsSceneReady(true)}
        >
          <color attach="background" args={[isDark ? "#020617" : "#eef2ff"]} />
          <fog attach="fog" args={[isDark ? "#020617" : "#eef2ff", 6, 28]} />

          <ambientLight intensity={0.8} color={isDark ? "#8fb5ff" : "#f8fafc"} />
          <directionalLight
            intensity={1.2}
            position={[5, 3, 5]}
            color={"#ffffff"}
          />
          <pointLight intensity={0.6} position={[-4, -2, -4]} color="#60a5fa" />

          <Stars
            radius={120}
            depth={60}
            count={4000}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
          />

          <group rotation={[0, Math.PI, 0]}>
            <mesh>
              <sphereGeometry args={[2, 128, 128]} />
              <primitive object={earthMaterial} attach="material" />
            </mesh>

            <mesh>
              <sphereGeometry args={[2.03, 128, 128]} />
              <meshStandardMaterial
                color={glowColor}
                transparent
                opacity={0.2}
                depthWrite={false}
              />
            </mesh>
          </group>

          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[borderPositions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={borderColor}
              linewidth={1.5}
              transparent
              opacity={0.6}
            />
          </lineSegments>

          <SatelliteVisualizationLayer
            satellites={satellites}
            trackedSatelliteIds={trackedSatelliteIds}
            hoveredSatelliteId={hoveredSatelliteId}
            onSatelliteHover={setHoveredSatelliteId}
            simulationTime={simulationTime}
            onSatelliteClick={onSatelliteClick}
            labelOpacity={globeLabelOpacity}
          />
          <GlobeLabelOpacityController setOpacity={setGlobeLabelOpacity} />

          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={12}
            autoRotate
            autoRotateSpeed={0.4}
            rotateSpeed={0.4}
            dampingFactor={0.1}
          />
        </Canvas>
      </div>
    </div>
  )
}
