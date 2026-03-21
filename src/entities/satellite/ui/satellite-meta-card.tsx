import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import {
  BriefcaseBusinessIcon,
  CircleDotIcon,
  Clock3Icon,
  EyeIcon,
  EyeOffIcon,
  FlagIcon,
  GaugeIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react"
import { getTypeColor } from "@/entities/satellite/lib"

export type Flyby = {
  time: string
  visible: boolean
}

export type SatelliteMetaCardProps = {
  name: string
  type: string
  country: string
  operator: string
  mission: string
  latitude: number
  longitude: number
  altitudeKm: number
  speedKms: number
  periodMin: number
  flybys: Flyby[]
  onClose?: () => void
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <div className="text-base font-semibold tracking-tight text-foreground">
        {value}
      </div>
    </div>
  )
}

export function SatelliteMetaCard({
  name,
  type,
  country,
  operator,
  mission,
  latitude,
  longitude,
  altitudeKm,
  speedKms,
  periodMin,
  flybys,
  onClose,
}: SatelliteMetaCardProps) {
  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-border/70 bg-card/95 shadow-lg backdrop-blur-xl">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.45)]" />
              <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                {name}
              </h2>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-none ${getTypeColor(
                  type
                )}`}
              >
                {type}
              </Badge>

              <div className="flex items-center gap-2 text-muted-foreground">
                <FlagIcon className="size-5" />
                <span className="text-xl">{country}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="size-7 shrink-0 rounded-full text-muted-foreground hover:bg-muted"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-0" />

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoItem
            icon={BriefcaseBusinessIcon}
            label="Оператор"
            value={operator}
          />
          <InfoItem icon={CircleDotIcon} label="Назначение" value={mission} />
        </div>

        <Separator className="my-1" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoItem
            icon={MapPinIcon}
            label="Широта"
            value={`${latitude.toFixed(4)}°`}
          />
          <InfoItem
            icon={MapPinIcon}
            label="Долгота"
            value={`${longitude.toFixed(4)}°`}
          />
          <InfoItem
            icon={GaugeIcon}
            label="Высота"
            value={`${altitudeKm} км`}
          />
          <InfoItem
            icon={GaugeIcon}
            label="Скорость"
            value={`${speedKms.toFixed(2)} км/с`}
          />
          <InfoItem
            icon={Clock3Icon}
            label="Период обращения"
            value={`${periodMin.toFixed(1)} мин.`}
          />
        </div>

        <Separator className="my-1" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock3Icon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-bold tracking-tight">
              Следующие пролёты
            </h3>
          </div>

          <div className="space-y-1.5">
            {flybys.map((flyby: Flyby) => (
              <div
                key={`${flyby.time}-${flyby.visible}`}
                className="flex items-center justify-between rounded-lg bg-muted/45 px-3 py-2 text-xs"
              >
                <div className="font-medium tracking-tight">{flyby.time}</div>

                <div
                  className={
                    flyby.visible
                      ? "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
                      : "flex items-center gap-1.5 text-muted-foreground"
                  }
                >
                  {flyby.visible ? (
                    <>
                      <EyeIcon className="size-3" />
                      <span className="font-medium">Видимый</span>
                    </>
                  ) : (
                    <>
                      <EyeOffIcon className="size-3" />
                      <span className="font-medium">В тени</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
