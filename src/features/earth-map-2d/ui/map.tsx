import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import { select } from "d3-selection"
import { zoom, zoomIdentity, ZoomTransform } from "d3-zoom"
import { geoPath, geoGraticule10, geoEqualEarth, geoCentroid } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import type { SatelliteMap } from "@/entities/satellite/model"
import type { Topology, GeometryCollection } from "topojson-specification"
import { cn } from "@/shared/lib/utils"
import { propagateSatellitePosition } from "@/entities/satellite/lib/propagation"
import type { OrbitalPosition } from "@/entities/satellite/lib/propagation"

/** Порог «базового» масштаба для ограничения панорамы. */
const BASE_ZOOM_EPS = 1e-4

type EarthMap2DProps = {
  satellites: SatelliteMap[]
  simulationTime?: Date
  trackedSatelliteIds?: string[]
  className?: string
  onSatelliteClick?: (id: string) => void
}

type SatPosition = OrbitalPosition

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

type HoveredCountry = {
  feature: GeoJSON.Feature
  name: string
  iso: string | null
  region: string | null
  center: [number, number] | null
}

const MIN_LABEL_OPACITY = 0.35
const MAX_LABEL_OPACITY = 1

function getLabelOpacity(scale: number) {
  const normalized = Math.min(1, Math.max(0, (scale - 1) / 3))
  return (
    MIN_LABEL_OPACITY + normalized * (MAX_LABEL_OPACITY - MIN_LABEL_OPACITY)
  )
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

function resolveCountryName(feature: GeoJSON.Feature) {
  const props = (feature.properties ?? {}) as Record<string, unknown>
  return (
    (props.ADMIN as string) ??
    (props.NAME as string) ??
    (props.name as string) ??
    (props.NAME_LONG as string) ??
    (props.formal_en as string) ??
    "Страна"
  )
}

function resolveCountryIso(feature: GeoJSON.Feature) {
  const props = (feature.properties ?? {}) as Record<string, unknown>
  return (
    (props.ISO_A3 as string) ??
    (props.iso_a3 as string) ??
    (props.ISO3 as string) ??
    (props.iso3 as string) ??
    (props.iso as string) ??
    null
  )
}

function resolveCountryRegion(feature: GeoJSON.Feature) {
  const props = (feature.properties ?? {}) as Record<string, unknown>
  return (
    (props.CONTINENT as string) ??
    (props.REGION_UN as string) ??
    (props.region as string) ??
    null
  )
}

function useRenderedSatellites(
  satellites: SatelliteMap[],
  referenceTime: Date
) {
  return useMemo<RenderedSatellite[]>(() => {
    return satellites.map((sat) => ({
      id: sat.id,
      name: sat.name,
      type: sat.type,
      current: propagateSatellitePosition(sat, referenceTime),
      path: buildTrack(sat, referenceTime),
    }))
  }, [satellites, referenceTime])
}

export function EarthMap2D({
  satellites,
  simulationTime,
  trackedSatelliteIds,
  className,
  onSatelliteClick,
}: EarthMap2DProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mapTransformRef = useRef<ZoomTransform>(zoomIdentity)

  const [size, setSize] = useState({ width: 1200, height: 700 })
  const [mapTheme, setMapTheme] = useState<MapTheme>("dark")
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(
    null
  )
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [labelOpacity, setLabelOpacity] = useState(() => getLabelOpacity(1))
  const [hoveredSatelliteId, setHoveredSatelliteId] = useState<string | null>(
    null
  )
  const now = simulationTime ?? new Date()
  const renderedSatellites = useRenderedSatellites(satellites, now)
  const trackedIds = useMemo(
    () => new Set(trackedSatelliteIds ?? []),
    [trackedSatelliteIds]
  )

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

  const alignTooltip = (event: MouseEvent<SVGPathElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect()
    if (!svgRect) {
      setTooltipPosition(null)
      return
    }

    setTooltipPosition({
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top,
    })
  }

  const handleCountryHover = (
    feature: GeoJSON.Feature,
    event: MouseEvent<SVGPathElement>
  ) => {
    alignTooltip(event)
    setHoveredCountry({
      feature,
      name: resolveCountryName(feature),
      iso: resolveCountryIso(feature),
      region: resolveCountryRegion(feature),
      center: geoCentroid(feature),
    })
  }

  const handleCountryMove = (event: MouseEvent<SVGPathElement>) => {
    if (!hoveredCountry) return
    alignTooltip(event)
  }

  const handleCountryLeave = () => {
    setHoveredCountry(null)
    setTooltipPosition(null)
  }

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
    mapTheme === "dark" ? "bg-slate-950" : "bg-slate-50",
    "relative"
  )
  const highlightFill =
    mapTheme === "dark" ? "rgba(59,130,246,0.25)" : "rgba(14,116,144,0.25)"
  const highlightStroke =
    mapTheme === "dark" ? "rgba(59,130,246,0.85)" : "rgba(14,116,144,0.85)"
  const tooltipWidth = 220
  const tooltipStyle =
    tooltipPosition && hoveredCountry
      ? {
          left: `${Math.max(
            8,
            Math.min(
              tooltipPosition.x + 12,
              Math.max(size.width - tooltipWidth - 12, 16)
            )
          )}px`,
          top: `${Math.max(
            8,
            Math.min(tooltipPosition.y + 12, Math.max(size.height - 100, 40))
          )}px`,
        }
      : undefined

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
        setLabelOpacity(getLabelOpacity(event.transform.k))
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

          {WORLD_FEATURES.features.map((country, index) => {
            const isHovered = hoveredCountry?.feature === country

            return (
              <path
                key={index}
                d={path(country) ?? ""}
                fill={isHovered ? highlightFill : palette.countryFill}
                stroke={isHovered ? highlightStroke : palette.countryStroke}
                strokeWidth={isHovered ? 1.1 : 0.6}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={(event) => handleCountryHover(country, event)}
                onMouseMove={handleCountryMove}
                onMouseLeave={handleCountryLeave}
              />
            )
          })}

          {renderedSatellites.map((sat) => {
            const isTracked = trackedIds.has(sat.id)
            const isHovered = hoveredSatelliteId === sat.id
            const showTrajectory = isTracked || isHovered
            const segments = showTrajectory
              ? splitTrackOnDateline(sat.path)
              : []

            return (
              <g key={sat.id}>
                {showTrajectory &&
                  segments.map((segment, index) => {
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
                        pointerEvents="none"
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
                        onMouseEnter={() => setHoveredSatelliteId(sat.id)}
                        onMouseLeave={() =>
                          setHoveredSatelliteId((prev) =>
                            prev === sat.id ? null : prev
                          )
                        }
                        onClick={() => onSatelliteClick?.(sat.id)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isTracked || isHovered ? 16 : 8}
                          fill={palette.satelliteHalo}
                          opacity={isTracked || isHovered ? 1 : 0.35}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={isTracked || isHovered ? 7 : 3.5}
                          fill={palette.satelliteCore}
                          stroke={palette.satelliteStroke}
                          strokeWidth={isTracked || isHovered ? 2 : 1}
                        />
                        {showTrajectory && (
                          <text
                            x={x + 12}
                            y={y - 12}
                            fill={palette.satelliteLabel}
                            fontSize="11"
                            fontWeight="600"
                            style={{ opacity: labelOpacity }}
                            pointerEvents="none"
                          >
                            {sat.name}
                          </text>
                        )}
                      </g>
                    )
                  })()}
              </g>
            )
          })}
        </g>
      </svg>

      {hoveredCountry && tooltipStyle && (
        <div
          style={tooltipStyle}
          className="pointer-events-none absolute z-50 w-[220px] rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-xs text-white shadow-2xl shadow-black/60 backdrop-blur"
        >
          <div className="text-sm font-semibold text-white">
            {hoveredCountry.name}
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/70">
            <span>ISO: {hoveredCountry.iso ?? "—"}</span>
            <span>Регион: {hoveredCountry.region ?? "—"}</span>
          </div>
          {hoveredCountry.center && (
            <div className="mt-1 text-[11px] text-white/70">
              Центр: {hoveredCountry.center[1].toFixed(2)}° N,{" "}
              {hoveredCountry.center[0].toFixed(2)}° E
            </div>
          )}
        </div>
      )}
    </div>
  )
}
