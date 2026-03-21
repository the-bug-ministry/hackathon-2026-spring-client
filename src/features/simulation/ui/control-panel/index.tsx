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
  onSpeedChange?: () => void
}

export function SimulationControlPanel({
  currentTime,
  isPlaying,
  speedLabel = "1x",
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  onSpeedChange,
}: SimulationControlPanelProps) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 w-full max-w-fit -translate-x-1/2 px-3 sm:bottom-5 sm:px-0">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-background/85 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-4 sm:py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* TIME */}
          <div className="rounded-full bg-muted/60 px-3 py-1 text-xs font-semibold whitespace-nowrap text-foreground sm:px-4 sm:py-1.5 sm:text-sm">
            {currentTime}
          </div>

          {/* SPEED (compact) */}
          <button
            type="button"
            onClick={onSpeedChange}
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/15 sm:hidden"
            title="Сменить скорость симуляции"
          >
            {speedLabel}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* CONTROLS */}
          <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onStepBack}
              className="size-9 rounded-full text-muted-foreground hover:bg-muted"
            >
              <SkipBackIcon className="size-4" />
            </Button>

            <Button
              size="icon"
              onClick={onTogglePlay}
              className="size-12 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              {isPlaying ? (
                <PauseIcon className="size-5" />
              ) : (
                <PlayIcon className="size-5 fill-current" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onStepForward}
              className="size-9 rounded-full text-muted-foreground hover:bg-muted"
            >
              <SkipForwardIcon className="size-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          {/* SPEED + RESET desktop */}
          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={onSpeedChange}
              className="px-3 text-sm font-semibold text-primary transition hover:opacity-80"
              title="Сменить скорость симуляции"
            >
              {speedLabel}
            </button>

            <Separator orientation="vertical" className="h-8" />

            <Button
              size="icon"
              variant="ghost"
              onClick={onReset}
              className="size-9 rounded-full text-muted-foreground hover:bg-muted"
            >
              <RotateCcwIcon className="size-4" />
            </Button>
          </div>

          {/* RESET compact */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onReset}
            className="size-9 rounded-full text-muted-foreground hover:bg-muted sm:hidden"
          >
            <RotateCcwIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
