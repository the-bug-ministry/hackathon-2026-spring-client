"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html, Stars } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import clsx from "clsx"
import type { SatelliteMap } from "@/entities/satellite/model"
import { geoNaturalEarth1, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { Topology, GeometryCollection } from "topojson-specification"

const atlas = worldAtlas as unknown as Topology<{ countries: GeometryCollection }>
const COUNTRY_FEATURES = feature(atlas, atlas.objects.countries) as GeoJSON.FeatureCollection
const BORDER_MESH = mesh(
  atlas,
  atlas.objects.countries,
  (a, b) => a !== b
 ) as unknown as GeoJSON.Feature<GeoJSON.MultiLineString>

type EarthGlobe3DProps = {
  className?: string
  satellites?: SatelliteMap[]
}

type SatellitePointProps = {
  lat: number
  lng: number
  name: string
}

type GlobeTheme = "dark" | "light"

function latLngToVector3(lat: number, lng: number, radius = 2.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
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
  const borderColor = theme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.5)"

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
  context.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.5)"
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

function SatellitePoint({ lat, lng, name }: SatellitePointProps) {
  const position = useMemo(() => latLngToVector3(lat, lng), [lat, lng])

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

      <Html distanceFactor={10} center>
        <div className="pointer-events-none rounded-md bg-slate-950/80 px-3 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur">
          {name}
        </div>
      </Html>
    </group>
  )
}

function MockSatelliteLayer({ satellites = [] }: { satellites?: SatelliteMap[] }) {
  const fallback = [
    { id: "1", name: "ISS", lat: 20, lng: 30 },
    { id: "2", name: "HST", lat: -10, lng: 120 },
    { id: "3", name: "NOAA 20", lat: 48, lng: -75 },
  ]

  const points = satellites.length
    ? satellites.map((sat, index) => ({
        id: sat.id,
        name: sat.name,
        lat: ((index * 37) % 140) - 70,
        lng: ((index * 67) % 360) - 180,
      }))
    : fallback

  return (
    <>
      {points.map((point) => (
        <SatellitePoint key={point.id} lat={point.lat} lng={point.lng} name={point.name} />
      ))}
    </>
  )
}

export function EarthGlobe3D({
  className,
  satellites = [],
}: EarthGlobe3DProps) {
  const [theme, setTheme] = useState<GlobeTheme>("dark")

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

  const mapTexture = useMemo(() => createMapTexture(theme), [theme])
  const borderPositions = useMemo(
    () => buildBorderPositions(BORDER_MESH),
    []
  )

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
  const borderColor = isDark ? "rgba(148, 163, 184, 0.65)" : "rgba(15, 23, 42, 0.9)"

  return (
    <div
      className={clsx(
        "relative min-h-full h-full w-full overflow-hidden rounded-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950/60" />
      <Canvas
        className="relative h-full w-full"
        style={{ height: "100%" }}
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={[isDark ? "#020617" : "#eef2ff"]} />
        <fog attach="fog" args={[isDark ? "#020617" : "#eef2ff", 6, 28]} />

        <ambientLight intensity={0.8} color={isDark ? "#8fb5ff" : "#f8fafc"} />
        <directionalLight intensity={1.2} position={[5, 3, 5]} color={"#ffffff"} />
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
          <lineBasicMaterial color={borderColor} linewidth={1.5} transparent opacity={0.6} />
        </lineSegments>

        <MockSatelliteLayer satellites={satellites} />

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
  )
}
