import { MapIcon, BoxIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import type { MapViewMode } from "../../model/store"

type MapViewSwitcherProps = {
  value: MapViewMode
  onValueChange: (value: MapViewMode) => void
}

export function MapViewSwitcher({
  value,
  onValueChange,
}: MapViewSwitcherProps) {
  return (
    <div className="absolute top-3 left-1/2 z-30 w-full -translate-x-1/2 px-3 sm:top-5 sm:left-6 sm:w-auto sm:max-w-none sm:translate-x-0 sm:px-0">
      <Tabs
        value={value}
        onValueChange={(next) => onValueChange(next as MapViewMode)}
        className="w-full sm:w-auto"
      >
        <TabsList className="w-full rounded-2xl px-1 py-1 sm:inline-flex sm:w-auto sm:px-0 sm:py-0">
          <TabsTrigger
            value="2d"
            className="group h-11 w-full justify-start gap-3 rounded-xl border border-transparent px-3 text-left text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-foreground sm:h-12 sm:w-auto sm:text-base"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors duration-200 group-hover:bg-muted/80 group-data-[state=active]:bg-background">
              <MapIcon className="size-4" />
            </div>

            <span className="truncate">2D Карта</span>
          </TabsTrigger>

          <TabsTrigger
            value="3d"
            className="group h-11 w-full justify-start gap-3 rounded-xl border border-transparent px-3 text-left text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary/20 data-[state=active]:bg-primary/15 data-[state=active]:text-primary sm:h-12 sm:w-auto sm:text-base"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors duration-200 group-hover:bg-primary/10 group-data-[state=active]:bg-primary/20">
              <BoxIcon className="size-4" />
            </div>

            <span className="truncate">3D Глобус</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
