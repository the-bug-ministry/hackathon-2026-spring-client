import { useEffect, useMemo, useRef, useState } from "react"
import * as satellite from "satellite.js"
import { select } from "d3-selection"
import { zoom, zoomIdentity } from "d3-zoom"
import { geoPath, geoGraticule10, geoEqualEarth } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { SatelliteMap } from "@/entities/satellite/model"
import type { Topology, GeometryCollection } from "topojson-specification"

type EarthMapProps = {
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

type WorldAtlasTopology = {
  type: string
  objects: {
    countries: object
  }
  arcs: unknown[]
  bbox?: number[]
  transform?: {
    scale: [number, number]
    translate: [number, number]
  }
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

export function EarthMap({
  satellites,
  className,
  onSatelliteClick,
}: EarthMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [size, setSize] = useState({ width: 1200, height: 700 })
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
    if (!svgRef.current) return

    const svg = select(svgRef.current)
    const zoomLayer = svg.select<SVGGElement>(".zoom-layer")

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        zoomLayer.attr("transform", event.transform.toString())
      })

    svg.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity)

    return () => {
      svg.on(".zoom", null)
    }
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

  return (
    <div
      ref={wrapperRef}
      className={className ?? "h-full w-full rounded-2xl bg-slate-950"}
    >
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="h-full w-full touch-none select-none"
      >
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#0f274f" />
            <stop offset="100%" stopColor="#020817" />
          </radialGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          fill="url(#oceanGlow)"
          rx={24}
        />

        <g className="zoom-layer">
          <path
            d={path({ type: "Sphere" }) ?? ""}
            fill="#081226"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={1}
          />

          <path
            d={path(graticule) ?? ""}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth={0.7}
          />

          {WORLD_FEATURES.features.map((country, index) => (
            <path
              key={index}
              d={path(country) ?? ""}
              fill="#12213d"
              stroke="rgba(148,163,184,0.18)"
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
                      stroke="rgba(96,165,250,0.85)"
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
                          fill="rgba(34,197,94,0.14)"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={7}
                          fill="#10b981"
                          stroke="white"
                          strokeWidth={2}
                        />
                        <text
                          x={x + 12}
                          y={y - 12}
                          fill="white"
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
