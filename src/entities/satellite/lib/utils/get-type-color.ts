export function getTypeColor(type: string): string {
  switch (type) {
    case "LEO":
      return "bg-blue-500/10 text-blue-500"
    case "MEO":
      return "bg-purple-500/10 text-purple-500"
    case "GEO":
      return "bg-green-500/10 text-green-500"
    case "Polar":
      return "bg-orange-500/10 text-orange-500"
    default:
      return "bg-muted text-muted-foreground"
  }
}
