"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import clsx from "clsx"
import { MapPin } from "lucide-react"
import { OrbitPreloader } from "@/shared/components/ui/orbit-preloader"
import { Button } from "@/shared/components/ui/button"
import { PassBucketsGrid } from "@/shared/components/pass-buckets-grid"
import {
  classifyPointPasses,
  PASS_NEAR_POINT_KM,
} from "@/entities/satellite/lib/satellite-point-passes"
import type { SatelliteMap } from "@/entities/satellite/model"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { Topology, GeometryCollection } from "topojson-specification"
import { propagateSatellitePosition } from "@/entities/satellite/lib/propagation"
import type { OrbitalPosition } from "@/entities/satellite/lib/propagation"
import { horizonFootprintAngularRadiusRad } from "@/entities/satellite/lib/coverage-footprint"

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
  satelliteId: string
  lat: number
  lng: number
  name: string
  altitudeKm: number
  showLabel?: boolean
  labelOpacity?: number
  /** Узкий вьюпорт — меньше маркер (touch) */
  compact?: boolean
  /** Режим выбора точки на глобусе — не перехватывать лучи */
  suppressRaycast?: boolean
  /** Подсветка: спутник в зоне выбранной точки (категория «Сейчас») */
  overSelectedPoint?: boolean
  /** Регистрация группы сфер для raycast-hover (без траектории/HTML) */
  registerInteractiveTarget?: (id: string) => (node: THREE.Group | null) => void
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

function normalizeLngDeg(lng: number) {
  let x = lng
  while (x > 180) x -= 360
  while (x < -180) x += 360
  return x
}

/** Обратное преобразование к `latLngToVector3` для единичного радиус-вектора (локальные оси сферы Земли). */
function vector3ToLatLngFromUnit(n: THREE.Vector3): { lat: number; lng: number } {
  const lat = Math.asin(Math.min(1, Math.max(-1, n.y))) * RAD_TO_DEG
  const theta = Math.atan2(n.z, -n.x)
  const lng = normalizeLngDeg(theta * RAD_TO_DEG - 180)
  return { lat, lng }
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

/** Кольцо [lng,lat] с непрерывной долготой (без скачка 360°), чтобы сегменты шли по поверхности. */
function buildCoverageRingLatLng(
  lat: number,
  lng: number,
  altitudeKm: number,
  resolution: number
): [number, number][] {
  const coverageAngle = horizonFootprintAngularRadiusRad(altitudeKm)
  const latRad = lat * DEG_TO_RAD
  const lngRad = lng * DEG_TO_RAD
  const ring: [number, number][] = []
  let prevLngDeg: number | null = null

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

    let lon2 = lngRad + Math.atan2(numerator, denominator)
    lon2 = ((lon2 + Math.PI) % (2 * Math.PI)) - Math.PI

    let degLng = lon2 * RAD_TO_DEG
    const degLat = lat2 * RAD_TO_DEG

    if (prevLngDeg !== null) {
      while (degLng - prevLngDeg > 180) degLng -= 360
      while (degLng - prevLngDeg < -180) degLng += 360
    }
    prevLngDeg = degLng

    ring.push([normalizeLngDeg(degLng), degLat])
  }

  return ring
}

function coverageFootprintResolution(altitudeKm: number) {
  const coverageAngle = horizonFootprintAngularRadiusRad(altitudeKm)
  return Math.max(
    72,
    Math.min(256, Math.ceil(72 + (coverageAngle / (Math.PI / 2)) * 96))
  )
}

/** Сегменты линии по поверхности (разрез по линии перемены дат, как у трека). */
function buildCoverageRingSegmentPositions(
  lat: number,
  lng: number,
  altitudeKm: number,
  surfaceRadius = 2.008
): Float32Array[] {
  const resolution = coverageFootprintResolution(altitudeKm)
  const ring = buildCoverageRingLatLng(lat, lng, altitudeKm, resolution)
  const segments = splitTrackOnDateline(ring)
  return segments.map((segment) => {
    const positions = new Float32Array(segment.length * 3)
    segment.forEach(([lngP, latP], index) => {
      const point = latLngToVector3(latP, lngP, surfaceRadius)
      const o = index * 3
      positions[o] = point.x
      positions[o + 1] = point.y
      positions[o + 2] = point.z
    })
    return positions
  })
}

/** Одно замкнутое кольцо в 3D для заливки (те же углы, что и у линии). */
function buildCoverageCirclePositionsClosed(
  lat: number,
  lng: number,
  altitudeKm: number,
  surfaceRadius = 2.008
) {
  const resolution = coverageFootprintResolution(altitudeKm)
  const ring = buildCoverageRingLatLng(lat, lng, altitudeKm, resolution)
  const positions = new Float32Array((resolution + 1) * 3)

  for (let i = 0; i <= resolution; i++) {
    const [lngP, latP] = ring[i]!
    const point = latLngToVector3(latP, lngP, surfaceRadius)
    const o = i * 3
    positions[o] = point.x
    positions[o + 1] = point.y
    positions[o + 2] = point.z
  }

  return positions
}

/** Треугольный веер от надира к кольцу горизонта — площадь «видимой» поверхности (по высоте из TLE). */
function buildCoverageCapBufferGeometry(
  lat: number,
  lng: number,
  altitudeKm: number,
  surfaceRadius = 2.008
): THREE.BufferGeometry {
  const ringFlat = buildCoverageCirclePositionsClosed(
    lat,
    lng,
    altitudeKm,
    surfaceRadius
  )
  const resolution = coverageFootprintResolution(altitudeKm)
  const ringVerts = resolution
  const nadir = latLngToVector3(lat, lng, surfaceRadius)
  const inflate = 1.004
  const nadirOut = nadir.clone().multiplyScalar(inflate)
  const posArr = new Float32Array((1 + ringVerts) * 3)
  posArr[0] = nadirOut.x
  posArr[1] = nadirOut.y
  posArr[2] = nadirOut.z
  for (let i = 0; i < ringVerts; i++) {
    const o = i * 3
    const dst = 3 + o
    const x = ringFlat[o]!
    const y = ringFlat[o + 1]!
    const z = ringFlat[o + 2]!
    const inflated = new THREE.Vector3(x, y, z).multiplyScalar(inflate)
    posArr[dst] = inflated.x
    posArr[dst + 1] = inflated.y
    posArr[dst + 2] = inflated.z
  }
  const indices: number[] = []
  for (let i = 0; i < ringVerts; i++) {
    const next = (i + 1) % ringVerts
    indices.push(0, 1 + i, 1 + next)
  }
  const geom = new THREE.BufferGeometry()
  geom.setAttribute("position", new THREE.BufferAttribute(posArr, 3))
  geom.setIndex(indices)
  geom.computeVertexNormals()
  return geom
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

const meshUserData = (satelliteId: string) => ({ satelliteId })

function SatellitePoint({
  satelliteId,
  lat,
  lng,
  name,
  altitudeKm: _altitudeKm,
  showLabel = false,
  labelOpacity = 1,
  compact = false,
  suppressRaycast = false,
  overSelectedPoint = false,
  registerInteractiveTarget,
}: SatellitePointProps) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.025), [lat, lng])
  const ud = useMemo(() => meshUserData(satelliteId), [satelliteId])
  const setInteractiveGroup = registerInteractiveTarget?.(satelliteId)
  const baseR = compact ? 0.022 : 0.034
  const coreR = overSelectedPoint ? baseR * 1.45 : baseR
  const coreColor = overSelectedPoint ? "#fbbf24" : "#22c55e"

  return (
    <group position={position}>
      <group ref={setInteractiveGroup}>
        <mesh
          userData={ud}
          raycast={suppressRaycast ? () => null : undefined}
        >
          <sphereGeometry args={[coreR, 16, 16]} />
          <meshBasicMaterial color={coreColor} />
        </mesh>
      </group>

      {showLabel && (
        <Html
          center
          distanceFactor={compact ? 3 : 4}
          style={{ width: "max-content", pointerEvents: "none" }}
          className="w-max!"
        >
          <div
            className="pointer-events-none max-w-[min(9rem,32vw)] rounded border border-white/10 bg-slate-950/85 px-1 py-px text-[6px] leading-snug font-medium break-all text-white/90 shadow-sm backdrop-blur-sm"
            style={{ opacity: labelOpacity }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

function DashedTrackSegment({ positions }: { positions: Float32Array }) {
  const lineObject = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.LineDashedMaterial({
      color: "#38bdf8",
      dashSize: 0.035,
      gapSize: 0.024,
      transparent: true,
      opacity: 0.85,
    })
    const line = new THREE.Line(geom, mat)
    line.computeLineDistances()
    line.raycast = () => null
    return line
  }, [positions])

  return <primitive object={lineObject} />
}

function SatelliteTrack({ path }: { path: Array<[number, number]> }) {
  const segments = useMemo(() => buildTrackSegmentPositions(path), [path])
  if (!segments.length) return null

  return (
    <>
      {segments.map((positions, index) => (
        <DashedTrackSegment key={`track-${index}`} positions={positions} />
      ))}
    </>
  )
}

function CoverageRingSegment({ positions }: { positions: Float32Array }) {
  const lineObject = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.LineBasicMaterial({
      color: "#34d399",
      transparent: true,
      opacity: 0.5,
      depthTest: false,
      depthWrite: false,
    })
    const line = new THREE.Line(geom, mat)
    line.raycast = () => null
    return line
  }, [positions])

  return <primitive object={lineObject} />
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
  const segments = useMemo(
    () => buildCoverageRingSegmentPositions(lat, lng, altitudeKm),
    [lat, lng, altitudeKm]
  )
  if (!segments.length) return null

  return (
    <>
      {segments.map((positions, index) => (
        <CoverageRingSegment key={`cov-ring-${index}`} positions={positions} />
      ))}
    </>
  )
}

function SatelliteCoverageCap({
  lat,
  lng,
  altitudeKm,
}: {
  lat: number
  lng: number
  altitudeKm: number
}) {
  const geometry = useMemo(
    () => buildCoverageCapBufferGeometry(lat, lng, altitudeKm),
    [lat, lng, altitudeKm]
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return (
    <mesh geometry={geometry} raycast={() => null} renderOrder={2}>
      <meshBasicMaterial
        color="#34d399"
        transparent
        opacity={0.16}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

function RenderedSatelliteMarker({
  satellite,
  isTracked,
  isHovered,
  registerInteractiveTarget,
  onSelect,
  labelOpacity,
  compactMarkers,
  suppressSatellitePointer = false,
  overSelectedPoint = false,
}: {
  satellite: RenderedSatellite3D
  isTracked: boolean
  isHovered: boolean
  registerInteractiveTarget: (id: string) => (node: THREE.Group | null) => void
  onSelect?: (id: string) => void
  labelOpacity?: number
  compactMarkers?: boolean
  suppressSatellitePointer?: boolean
  overSelectedPoint?: boolean
}) {
  if (!satellite.current) return null

  const { current } = satellite
  const showTrajectory = isTracked || isHovered || Boolean(overSelectedPoint)

  return (
    <group
      onPointerDown={(event) => {
        if (suppressSatellitePointer) return
        event.stopPropagation()
        onSelect?.(satellite.id)
      }}
    >
      {isTracked && (
        <>
          <SatelliteCoverageCap
            lat={current.lat}
            lng={current.lng}
            altitudeKm={current.altitudeKm}
          />
          <SatelliteCoverageRing
            lat={current.lat}
            lng={current.lng}
            altitudeKm={current.altitudeKm}
          />
        </>
      )}
      {showTrajectory && <SatelliteTrack path={satellite.path} />}
      <SatellitePoint
        satelliteId={satellite.id}
        lat={current.lat}
        lng={current.lng}
        name={satellite.name}
        altitudeKm={current.altitudeKm}
        showLabel={showTrajectory}
        labelOpacity={labelOpacity}
        compact={compactMarkers}
        suppressRaycast={suppressSatellitePointer}
        overSelectedPoint={overSelectedPoint}
        registerInteractiveTarget={registerInteractiveTarget}
      />
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
  compactMarkers = false,
  suppressSatellitePointer = false,
  overPointSatelliteIds,
}: {
  satellites?: SatelliteMap[]
  trackedSatelliteIds?: string[]
  hoveredSatelliteId: string | null
  onSatelliteHover: (id: string | null) => void
  simulationTime?: Date
  onSatelliteClick?: (id: string) => void
  labelOpacity?: number
  compactMarkers?: boolean
  /** Режим клика по поверхности Земли — отключаем hit по спутникам */
  suppressSatellitePointer?: boolean
  /** id спутников над выбранной точкой (зона «Сейчас») — подсветка на глобусе */
  overPointSatelliteIds?: Set<string>
}) {
  const { camera, gl } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const hitTargetsRef = useRef<Map<string, THREE.Object3D>>(new Map())

  const registerInteractiveTarget = useCallback(
    (id: string) => (node: THREE.Group | null) => {
      if (node) hitTargetsRef.current.set(id, node)
      else hitTargetsRef.current.delete(id)
    },
    []
  )

  useEffect(() => {
    const el = gl.domElement
    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const targets = Array.from(hitTargetsRef.current.values())
      if (!targets.length) {
        onSatelliteHover(null)
        return
      }
      const hits = raycaster.intersectObjects(targets, true)
      const first = hits.find(
        (h) => typeof h.object.userData.satelliteId === "string"
      )
      onSatelliteHover(first?.object.userData.satelliteId ?? null)
    }
    const onPointerLeave = () => onSatelliteHover(null)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerleave", onPointerLeave)
    return () => {
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [camera, gl, onSatelliteHover, pointer, raycaster])

  const rendered = useRenderedSatellites(
    satellites,
    simulationTime ?? new Date()
  )
  const trackedSet = useMemo(
    () => new Set(trackedSatelliteIds ?? []),
    [trackedSatelliteIds]
  )

  if (!satellites.length) {
    return null
  }

  return (
    <>
      {rendered.map((satellite) => (
        <RenderedSatelliteMarker
          key={satellite.id}
          satellite={satellite}
          isTracked={trackedSet.has(satellite.id)}
          isHovered={hoveredSatelliteId === satellite.id}
          registerInteractiveTarget={registerInteractiveTarget}
          onSelect={onSatelliteClick}
          labelOpacity={labelOpacity}
          compactMarkers={compactMarkers}
          suppressSatellitePointer={suppressSatellitePointer}
          overSelectedPoint={overPointSatelliteIds?.has(satellite.id) ?? false}
        />
      ))}
    </>
  )
}

function GlobeSelectedPointMarker({ lat, lng }: { lat: number; lng: number }) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.014), [lat, lng])
  return (
    <group position={position}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.06, 18, 18]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
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
  const [compactMarkers, setCompactMarkers] = useState(false)
  const earthGroupRef = useRef<THREE.Group>(null)
  const [mapPickMode, setMapPickMode] = useState(false)
  const [selectedGlobePoint, setSelectedGlobePoint] = useState<{
    lng: number
    lat: number
  } | null>(null)

  const selectedPointPasses = useMemo(() => {
    if (!selectedGlobePoint) return null
    return classifyPointPasses(
      selectedGlobePoint.lng,
      selectedGlobePoint.lat,
      satellites,
      simulationTime ?? new Date()
    )
  }, [selectedGlobePoint, satellites, simulationTime])

  const globeOverPointSatelliteIds = useMemo(() => {
    if (!selectedPointPasses) return undefined
    return new Set(selectedPointPasses.current.map((p) => p.id))
  }, [selectedPointPasses])

  useEffect(() => {
    if (mapPickMode) setHoveredSatelliteId(null)
  }, [mapPickMode])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(max-width: 640px)")
    const update = () => setCompactMarkers(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

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
          "relative h-full w-full transition-opacity duration-700",
          isSceneReady ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900/90 to-slate-950/60" />
        <Canvas
          className={clsx(
            "relative h-full w-full",
            mapPickMode && "cursor-crosshair"
          )}
          style={{ height: "100%" }}
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={() => setIsSceneReady(true)}
        >
          <color attach="background" args={[isDark ? "#020617" : "#eef2ff"]} />
          <fog attach="fog" args={[isDark ? "#020617" : "#eef2ff", 6, 28]} />

          <ambientLight
            intensity={0.8}
            color={isDark ? "#8fb5ff" : "#f8fafc"}
          />
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

          <group ref={earthGroupRef} rotation={[0, Math.PI, 0]}>
            <mesh
              onPointerDown={(e) => {
                if (!mapPickMode) return
                e.stopPropagation()
                const mesh = e.object as THREE.Mesh
                const local = mesh.worldToLocal(e.point.clone())
                const n = local.clone().normalize()
                const { lat, lng } = vector3ToLatLngFromUnit(n)
                setSelectedGlobePoint({ lat, lng })
                setMapPickMode(false)
              }}
            >
              <sphereGeometry args={[2, 128, 128]} />
              <primitive object={earthMaterial} attach="material" />
            </mesh>

            <mesh raycast={() => null}>
              <sphereGeometry args={[2.03, 128, 128]} />
              <meshStandardMaterial
                color={glowColor}
                transparent
                opacity={0.2}
                depthWrite={false}
              />
            </mesh>

            {selectedGlobePoint && !mapPickMode && (
              <GlobeSelectedPointMarker
                lat={selectedGlobePoint.lat}
                lng={selectedGlobePoint.lng}
              />
            )}
          </group>

          <lineSegments raycast={() => null}>
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
            compactMarkers={compactMarkers}
            suppressSatellitePointer={mapPickMode}
            overPointSatelliteIds={globeOverPointSatelliteIds}
          />
          <GlobeLabelOpacityController setOpacity={setGlobeLabelOpacity} />

          <OrbitControls
            enablePan={false}
            enableRotate={!mapPickMode}
            enableZoom={!mapPickMode}
            minDistance={3}
            maxDistance={12}
            autoRotate={!mapPickMode}
            autoRotateSpeed={0.4}
            rotateSpeed={0.4}
            dampingFactor={0.1}
          />
        </Canvas>

        {selectedGlobePoint && selectedPointPasses && (
          <div className="pointer-events-none absolute right-4 bottom-4 z-20 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-xs text-white shadow-2xl shadow-black/60 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="size-4 shrink-0 text-sky-400" aria-hidden />
              Точка на глобусе
            </div>
            <div className="mt-1 text-[11px] text-white/70">
              {selectedGlobePoint.lat.toFixed(2)}°,{" "}
              {selectedGlobePoint.lng.toFixed(2)}° · зона пролёта ±{PASS_NEAR_POINT_KM}{" "}
              км
            </div>
            <div className="mt-1 text-[10px] text-white/50">
              Учтено спутников:{" "}
              {selectedPointPasses.current.length +
                selectedPointPasses.recent.length +
                selectedPointPasses.upcoming.length}
            </div>
            <PassBucketsGrid passes={selectedPointPasses} />
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-4 z-20">
          <div className="pointer-events-auto flex max-w-[min(14rem,42vw)] flex-col gap-2">
            <Button
              type="button"
              size="sm"
              variant={mapPickMode ? "default" : "secondary"}
              className="gap-2 shadow-lg"
              onClick={() => setMapPickMode((v) => !v)}
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {mapPickMode ? "Отмена" : "Точка на глобусе"}
            </Button>
            {mapPickMode && (
              <p className="rounded-lg border border-white/15 bg-slate-950/80 px-2 py-1.5 text-[10px] leading-snug text-white/80 backdrop-blur">
                Кликните по поверхности Земли, чтобы выбрать точку.
              </p>
            )}
            {selectedGlobePoint && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2 border-white/30 bg-slate-950/70 text-white shadow-lg backdrop-blur"
                onClick={() => setSelectedGlobePoint(null)}
              >
                <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
                Сбросить точку
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
