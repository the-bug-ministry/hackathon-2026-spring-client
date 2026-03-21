import { type ChangeEvent, useCallback, useRef, useState } from "react"
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
import { Trash2Icon, UploadCloudIcon } from "lucide-react"

import { useTleDumps } from "@/entities/satellite/lib/use-tle-dumps"
import type { TleDump } from "@/entities/satellite/lib/use-tle-dumps"

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

const buildPreview = (content: string) => {
  const cleanLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!cleanLines.length) {
    return "Пустой файл"
  }

  return cleanLines.slice(0, 3).join(" · ")
}

export function ProfileTleManager({ className }: { className?: string }) {
  const { dumps, activeDump, addDumps, setActive, removeDump } = useTleDumps()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const handleFilesChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files
      if (!files?.length) return

      setIsUploading(true)
      try {
        await addDumps(files)
      } finally {
        setIsUploading(false)
        event.currentTarget.value = ""
      }
    },
    [addDumps]
  )

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
              <p className="text-sm font-semibold text-foreground">{dump.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(dump.createdAt)} · {dump.entries} TLE · {formatBytes(dump.size)}
              </p>
            </div>
            {isActive && (
              <Badge variant="secondary" className="text-[11px]">
                Активный
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{buildPreview(dump.content)}</p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            removeDump(dump.id)
          }}
          className="absolute right-3 top-3 rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground transition hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <span>Храни актуальные дампы и выбирай нужный для симуляции спутников.</span>
          <span className="text-muted-foreground">
            {activeDump ? `Активный: ${activeDump.name}` : "Активный TLE не выбран"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleUploadClick} disabled={isUploading}>
            <UploadCloudIcon className="size-4" />
            {isUploading ? "Загрузка" : "Добавить дамп"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Поддерживаются .tle, .txt и .dat файлы. Можно загружать несколько файлов сразу.
          </p>
        </div>

        <Separator />

        {dumps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет загруженных дампов. Загрузи первый файл, чтобы начать.
          </p>
        ) : (
          <div className="space-y-3">
            {dumps.map((dump) => renderItem(dump))}
          </div>
        )}
      </CardContent>

      <input
        ref={inputRef}
        type="file"
        accept=".tle,.txt,.dat"
        multiple
        className="hidden"
        onChange={handleFilesChange}
      />
    </Card>
  )
}
