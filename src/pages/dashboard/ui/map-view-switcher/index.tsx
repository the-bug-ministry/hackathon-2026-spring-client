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
    <div className="absolute top-5 left-6 z-30">
      <Tabs
        value={value}
        onValueChange={(next) => onValueChange(next as MapViewMode)}
        className="w-[240px]"
      >
        <TabsList>
          <TabsTrigger
            value="2d"
            className="group h-12 w-full justify-start gap-3 rounded-xl border border-transparent px-3 text-left text-base font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors duration-200 group-hover:bg-muted/80 group-data-[state=active]:bg-background">
              <MapIcon className="size-4" />
            </div>

            <span className="truncate">2D Карта</span>
          </TabsTrigger>

          <TabsTrigger
            value="3d"
            className="group h-12 w-full justify-start gap-3 rounded-xl border border-transparent px-3 text-left text-base font-semibold text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary/20 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
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
