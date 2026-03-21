declare module "world-atlas/*.json" {
  const value: {
    type: string
    objects: Record<string, unknown>
    arcs: unknown[]
    bbox?: number[]
    transform?: {
      scale: [number, number]
      translate: [number, number]
    }
  }

  export default value
}
