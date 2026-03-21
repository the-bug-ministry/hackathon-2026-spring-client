import clsx from "clsx"

type EarthGlobe3DProps = {
  className?: string
}

export function EarthGlobe3D({ className }: EarthGlobe3DProps) {
  return (
    <div
      className={clsx("min-h-full w-full rounded-2xl bg-slate-950", className)}
    >
      3D Глобус
    </div>
  )
}
