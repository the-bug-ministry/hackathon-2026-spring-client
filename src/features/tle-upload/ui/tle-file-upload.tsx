import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { useTleUpload } from "@/entities/satellite/lib"

export function TleFileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const { mutate, isPending } = useTleUpload()

  const handleFile = (file: File | undefined) => {
    if (!file) return

    setFileName(file.name)

    mutate(
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

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Загрузка TLE
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Файл отправляется на сервер (multipart, поле{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
              file
            </code>
            ).
          </p>
          {fileName && (
            <p className="text-xs text-muted-foreground">
              Последний файл: <span className="font-medium">{fileName}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept="*/*"
            disabled={isPending}
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon className="size-4" />
            {isPending ? "Загрузка…" : "Выбрать файл"}
          </Button>
        </div>
      </div>
    </div>
  )
}
