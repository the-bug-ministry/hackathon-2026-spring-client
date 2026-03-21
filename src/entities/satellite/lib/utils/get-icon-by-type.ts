import { Satellite, Orbit, Globe, Radar, Activity } from "lucide-react"

export function getIconByType(type: string) {
  switch (type) {
    case "LEO":
      return Satellite
    case "MEO":
      return Orbit
    case "GEO":
      return Globe
    case "Polar":
      return Radar
    default:
      return Activity
  }
}
