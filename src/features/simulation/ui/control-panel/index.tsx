import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react"

type SimulationControlPanelProps = {
  currentTime: string
  isPlaying: boolean
  speedLabel?: string
  onTogglePlay: () => void
  onStepBack?: () => void
  onStepForward?: () => void
  onReset?: () => void
}

export function SimulationControlPanel({
  currentTime,
  isPlaying,
  speedLabel = "1x",
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
}: SimulationControlPanelProps) {
  return (
    <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-background/80 px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        {/* TIME */}
        <div className="rounded-full bg-muted/60 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-foreground">
          {currentTime}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* CONTROLS */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onStepBack}
            className="size-8 rounded-full text-muted-foreground hover:bg-muted"
          >
            <SkipBackIcon className="size-4" />
          </Button>

          <Button
            size="icon"
            onClick={onTogglePlay}
            className="size-10 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {isPlaying ? (
              <PauseIcon className="size-4" />
            ) : (
              <PlayIcon className="size-4 fill-current" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onStepForward}
            className="size-8 rounded-full text-muted-foreground hover:bg-muted"
          >
            <SkipForwardIcon className="size-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* SPEED */}
        <button className="px-2 text-sm font-semibold text-primary transition hover:opacity-80">
          {speedLabel}
        </button>

        {/* RESET */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onReset}
          className="size-8 rounded-full text-muted-foreground hover:bg-muted"
        >
          <RotateCcwIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
