import { useRef } from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { useTleUpload } from "@/entities/satellite/lib"

function isTxtFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".txt")
}

export function TleFileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutate, isPending } = useTleUpload()

  const handleFile = (file: File | undefined) => {
    if (!file) return

    if (!isTxtFile(file)) {
      toast.error("Можно загрузить только файл в формате .txt")
      return
    }

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
            Загрузите файл для отслеживания спутников (.txt)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept=".txt,text/plain"
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
