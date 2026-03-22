import { cn } from "@/shared/lib/utils"

type OrbitPreloaderProps = {
  label?: string
  hint?: string
  className?: string
}

export function OrbitPreloader({
  label = "Загружаем данные",
  hint,
  className,
}: OrbitPreloaderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-sidebar-foreground">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-sidebar-border/70" />
          <div className="absolute inset-1 rounded-full border border-sidebar-accent/60 animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-sidebar-primary/40 animate-[spin_6s_linear_infinite_reverse]" />

          <div className="absolute inset-0 animate-[spin_2.2s_linear_infinite]">
            <div className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full bg-sidebar-primary shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
          </div>
          <div className="absolute inset-0 animate-[spin_3.4s_linear_infinite_reverse]">
            <div className="absolute left-[12%] top-[12%] h-2 w-2 rounded-full bg-sidebar-accent shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          </div>
        </div>

        <div className="text-sm font-semibold">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  )
}
