import { useRef } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"
import { isTxtFile } from "@/shared/lib/is-txt-file"
import { Trash2Icon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { useTleDumps } from "@/entities/satellite/lib/use-tle-dumps"
import type { TleDump } from "@/entities/satellite/lib/use-tle-dumps"
import { useTleUpload } from "@/entities/satellite/lib"

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "н/д"
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} Б`
  }

  const kilobytes = bytes / 1024
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} КБ`
  }

  return `${(kilobytes / 1024).toFixed(2)} МБ`
}

export function ProfileTleManager({ className }: { className?: string }) {
  const { dumps, activeDump, setActive, removeDump } = useTleDumps()
  const { mutate: uploadToServer, isPending: isServerUploading } =
    useTleUpload()
  const serverInputRef = useRef<HTMLInputElement | null>(null)

  const handleServerFile = (file: File | undefined) => {
    if (!file) return
    if (!isTxtFile(file)) {
      toast.error("Можно загрузить только файл в формате .txt")
      return
    }
    uploadToServer(
      { file },
      {
        onSuccess: () => {
          toast.success("Файл TLE успешно загружен")
        },
        onError: () => {
          toast.error("Не удалось загрузить файл")
        },
      }
    )
  }

  const renderItem = (dump: TleDump) => {
    const isActive = dump.isActive

    return (
      <div
        key={dump.id}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-background/70 transition",
          isActive
            ? "border-emerald-400/75 bg-emerald-500/5 shadow-lg shadow-emerald-500/20"
            : "border-border/70 hover:border-primary/60"
        )}
      >
        <div
          role="button"
          tabIndex={0}
          className="space-y-2 p-4 pr-10"
          onClick={() => setActive(dump.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setActive(dump.id)
            }
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {dump.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(dump.createdAt)} · {formatBytes(dump.size)}
              </p>
            </div>
            {isActive && (
              <Badge variant="secondary" className="text-[11px]">
                Активный
              </Badge>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            removeDump(dump.id)
          }}
          className="absolute top-3 right-3 rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground transition hover:border-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Удалить дамп"
        >
          <Trash2Icon className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader>
        <CardTitle>Список TLE дампов</CardTitle>
        <CardDescription className="space-y-1 text-xs">
          <span>
            Храни актуальные дампы и выбирай нужный для симуляции спутников.
          </span>
          <span className="text-muted-foreground">
            {activeDump
              ? `Активный: ${activeDump.name}`
              : "Активный TLE не выбран"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Загрузка на сервер
            </p>
            <p className="text-xs text-muted-foreground">
              Отправка TLE для отслеживания спутников в системе. Только .txt.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={serverInputRef}
              type="file"
              className="hidden"
              accept=".txt,text/plain"
              disabled={isServerUploading}
              onChange={(e) => {
                handleServerFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isServerUploading}
              onClick={() => serverInputRef.current?.click()}
            >
              <UploadIcon className="size-4" />
              {isServerUploading ? "Загрузка…" : "Выбрать файл (.txt)"}
            </Button>
          </div>
        </div>

        <Separator />

        {dumps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет загруженных дампов. Загрузи первый файл, чтобы начать.
            (!!!вывести с бэка)
          </p>
        ) : (
          <div className="space-y-3">
            {dumps.map((dump) => renderItem(dump))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
