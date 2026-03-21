import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as satellite from "satellite.js"
import { select } from "d3-selection"
import { zoom, zoomIdentity, ZoomTransform } from "d3-zoom"
import { geoPath, geoGraticule10, geoEqualEarth } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { SatelliteMap } from "@/entities/satellite/model"
import type { Topology, GeometryCollection } from "topojson-specification"
import { cn } from "@/shared/lib/utils"

/** Порог «базового» масштаба для ограничения панорамы. */
const BASE_ZOOM_EPS = 1e-4

type EarthMap2DProps = {
  satellites: SatelliteMap[]
  className?: string
  onSatelliteClick?: (id: string) => void
}

type SatPosition = {
  lat: number
  lng: number
  altitudeKm: number
  speedKms: number
}

type RenderedSatellite = {
  id: string
  name: string
  type: string
  current: SatPosition | null
  path: Array<[number, number]>
}

function toFeatureCollection(
  value: GeoJSON.Feature | GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  return value.type === "FeatureCollection"
    ? value
    : {
        type: "FeatureCollection",
        features: [value],
      }
}

const atlas = worldAtlas as unknown as Topology<{
  countries: GeometryCollection
}>

const WORLD_FEATURES = toFeatureCollection(
  feature(atlas, atlas.objects.countries) as
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
)

type MapTheme = "dark" | "light"

type MapPalette = {
  oceanGlowStart: string
  oceanGlowEnd: string
  sphereFill: string
  sphereStroke: string
  graticule: string
  countryFill: string
  countryStroke: string
  track: string
  satelliteHalo: string
  satelliteCore: string
  satelliteStroke: string
  satelliteLabel: string
}

const MAP_PALETTES: Record<MapTheme, MapPalette> = {
  dark: {
    oceanGlowStart: "#0f274f",
    oceanGlowEnd: "#020817",
    sphereFill: "#081226",
    sphereStroke: "rgba(148,163,184,0.18)",
    graticule: "rgba(148,163,184,0.12)",
    countryFill: "#12213d",
    countryStroke: "rgba(148,163,184,0.18)",
    track: "rgba(96,165,250,0.85)",
    satelliteHalo: "rgba(34,197,94,0.14)",
    satelliteCore: "#10b981",
    satelliteStroke: "#ffffff",
    satelliteLabel: "#ffffff",
  },
  light: {
    oceanGlowStart: "#e0f2fe",
    oceanGlowEnd: "#fef3c7",
    sphereFill: "#f8fafc",
    sphereStroke: "rgba(15,23,42,0.2)",
    graticule: "rgba(15,23,42,0.25)",
    countryFill: "#e2e8f0",
    countryStroke: "rgba(15,23,42,0.2)",
    track: "rgba(14,116,144,0.85)",
    satelliteHalo: "rgba(14,116,144,0.18)",
    satelliteCore: "#0f172a",
    satelliteStroke: "#0f172a",
    satelliteLabel: "#0f172a",
  },
}

function normalizeLng(lng: number) {
  let value = lng
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}

function propagateSatellite(
  tle1: string,
  tle2: string,
  at: Date
): SatPosition | null {
  if (!tle1 || !tle2) return null

  const satrec = satellite.twoline2satrec(tle1, tle2)
  const pv = satellite.propagate(satrec, at)

  const position = pv?.position
  const velocity = pv?.velocity

  if (!position || !velocity) return null

  const gmst = satellite.gstime(at)
  const geodetic = satellite.eciToGeodetic(position, gmst)

  const lat = satellite.degreesLat(geodetic.latitude)
  const lng = normalizeLng(satellite.degreesLong(geodetic.longitude))
  const altitudeKm = geodetic.height

  const { x, y, z } = velocity
  const speedKms = Math.sqrt(x * x + y * y + z * z)

  return {
    lat,
    lng,
    altitudeKm,
    speedKms,
  }
}

function buildTrack(
  tle1: string,
  tle2: string,
  now: Date,
  minutesBack = 30,
  minutesForward = 90,
  stepSec = 60
) {
  const points: Array<[number, number]> = []

  if (!tle1 || !tle2) return points

  for (
    let offset = -minutesBack * 60;
    offset <= minutesForward * 60;
    offset += stepSec
  ) {
    const date = new Date(now.getTime() + offset * 1000)
    const pos = propagateSatellite(tle1, tle2, date)
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

function useRenderedSatellites(satellites: SatelliteMap[]) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return useMemo<RenderedSatellite[]>(() => {
    return satellites.map((sat) => ({
      id: sat.id,
      name: sat.name,
      type: sat.type,
      current: propagateSatellite(sat.tle1, sat.tle2, now),
      path: buildTrack(sat.tle1, sat.tle2, now),
    }))
  }, [satellites, now])
}

export function EarthMap2D({
  satellites,
  className,
  onSatelliteClick,
}: EarthMap2DProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mapTransformRef = useRef<ZoomTransform>(zoomIdentity)

  const [size, setSize] = useState({ width: 1200, height: 700 })
  const [mapTheme, setMapTheme] = useState<MapTheme>("dark")
  const renderedSatellites = useRenderedSatellites(satellites)

  useEffect(() => {
    if (!wrapperRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const { width, height } = entry.contentRect
      setSize({
        width: Math.max(320, width),
        height: Math.max(320, height),
      })
    })

    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (typeof MutationObserver === "undefined") return

    const resolveTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light"

    const updateTheme = () => setMapTheme(resolveTheme())
    updateTheme()

    const observer = new MutationObserver(() => updateTheme())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const projection = useMemo(() => {
    return geoEqualEarth().fitExtent(
      [
        [24, 24],
        [size.width - 24, size.height - 24],
      ],
      { type: "Sphere" }
    )
  }, [size])

  const path = useMemo(() => geoPath(projection), [projection])
  const graticule = useMemo(() => geoGraticule10(), [])
  const palette = MAP_PALETTES[mapTheme]
  const wrapperClassName = cn(
    className ?? "h-full w-full rounded-2xl",
    mapTheme === "dark" ? "bg-slate-950" : "bg-slate-50"
  )

  /** При k≈1 панораму ограничиваем ±половина bbox сферы (в пикселях). */
  const baseZoomPanLimit = useMemo(() => {
    const b = path.bounds({ type: "Sphere" })
    const w = b[1][0] - b[0][0]
    const h = b[1][1] - b[0][1]
    return {
      maxTx: Math.max(0, w / 2),
      maxTy: Math.max(0, h / 2),
    }
  }, [path])

  useLayoutEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl || size.width < 1 || size.height < 1) return

    const svg = select(svgEl)
    const zoomLayer = svg.select<SVGGElement>(".zoom-layer")

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .extent([
        [0, 0],
        [size.width, size.height],
      ])
      .translateExtent([
        [-Infinity, -Infinity],
        [Infinity, Infinity],
      ])
      .constrain((transform) => {
        if (transform.k > 1 + BASE_ZOOM_EPS) {
          return transform
        }
        const x = Math.max(
          -baseZoomPanLimit.maxTx,
          Math.min(baseZoomPanLimit.maxTx, transform.x)
        )
        const y = Math.max(
          -baseZoomPanLimit.maxTy,
          Math.min(baseZoomPanLimit.maxTy, transform.y)
        )
        return new ZoomTransform(transform.k, x, y)
      })
      .on("zoom", (event) => {
        mapTransformRef.current = event.transform
        zoomLayer.attr("transform", event.transform.toString())
      })
      .on("start", (event) => {
        const src = event.sourceEvent
        if (!src) return
        if (src.type === "wheel") {
          svgEl.style.cursor = "ns-resize"
        } else if (src.type === "mousedown" || src.type === "touchstart") {
          svgEl.style.cursor = "move"
        }
      })
      .on("end", () => {
        svgEl.style.cursor = ""
      })

    svg.call(zoomBehavior).call(zoomBehavior.transform, mapTransformRef.current)

    return () => {
      svg.on(".zoom", null)
    }
  }, [size.width, size.height, baseZoomPanLimit.maxTx, baseZoomPanLimit.maxTy])

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="block max-h-full max-w-full cursor-move touch-none select-none"
      >
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={palette.oceanGlowStart} />
            <stop offset="100%" stopColor={palette.oceanGlowEnd} />
          </radialGradient>
        </defs>

        <g className="zoom-layer">
          <rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fill="url(#oceanGlow)"
            rx={24}
          />
          <path
            d={path({ type: "Sphere" }) ?? ""}
            fill={palette.sphereFill}
            stroke={palette.sphereStroke}
            strokeWidth={1}
          />

          <path
            d={path(graticule) ?? ""}
            fill="none"
            stroke={palette.graticule}
            strokeWidth={0.7}
          />

          {WORLD_FEATURES.features.map((country, index) => (
            <path
              key={index}
              d={path(country) ?? ""}
              fill={palette.countryFill}
              stroke={palette.countryStroke}
              strokeWidth={0.6}
            />
          ))}

          {renderedSatellites.map((sat) => {
            const segments = splitTrackOnDateline(sat.path)

            return (
              <g key={sat.id}>
                {segments.map((segment, index) => {
                  const lineD = path({
                    type: "LineString",
                    coordinates: segment,
                  } as GeoJSON.LineString)

                  return (
                      <path
                        key={`${sat.id}-seg-${index}`}
                        d={lineD ?? ""}
                        fill="none"
                        stroke={palette.track}
                        strokeWidth={2}
                        strokeDasharray="6 6"
                      />
                  )
                })}

                {sat.current &&
                  (() => {
                    const point = projection([sat.current.lng, sat.current.lat])

                    if (!point) return null

                    const [x, y] = point

                    return (
                      <g
                        className="cursor-pointer"
                        onClick={() => onSatelliteClick?.(sat.id)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={16}
                          fill={palette.satelliteHalo}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={7}
                          fill={palette.satelliteCore}
                          stroke={palette.satelliteStroke}
                          strokeWidth={2}
                        />
                        <text
                          x={x + 12}
                          y={y - 12}
                          fill={palette.satelliteLabel}
                          fontSize="12"
                          fontWeight="600"
                        >
                          {sat.name}
                        </text>
                      </g>
                    )
                  })()}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
