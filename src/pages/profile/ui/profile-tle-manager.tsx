import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"
import { isTxtFile } from "@/shared/lib/is-txt-file"
import {
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/entities/auth/lib/use-auth"
import {
  fileKeys,
  useActivateFileMutation,
  useDeleteFileMutation,
  useFilesQuery,
  useUpdateFileNameMutation,
  type FileItem,
} from "@/entities/file/lib"
import { satelliteKeys } from "@/entities/satellite/api/contracts/satellite.keys"
import { useTleUpload } from "@/entities/satellite/lib"

export function ProfileTleManager({ className }: { className?: string }) {
  const queryClient = useQueryClient()
  const { status: authStatus } = useAuth()
  const isAuthed = authStatus === "AUTHENTICATED"

  const serverInputRef = useRef<HTMLInputElement | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")

  const {
    data: filesPayload,
    isPending: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
    refetch,
  } = useFilesQuery({ enabled: isAuthed })

  const { mutate: uploadToServer, isPending: isServerUploading } =
    useTleUpload()
  const { mutate: activateFile, isPending: isActivating } =
    useActivateFileMutation()
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFileMutation()
  const { mutate: renameFile, isPending: isRenaming } = useUpdateFileNameMutation()

  const files = filesPayload?.files ?? []
  const activeFile = files.find((f) => f.isActive) ?? null
  const busyGlobal = isActivating || isDeleting || isRenaming

  const invalidateFileList = () => {
    void queryClient.invalidateQueries({ queryKey: fileKeys.list() })
    void queryClient.invalidateQueries({ queryKey: satelliteKeys.root })
  }

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
          invalidateFileList()
        },
        onError: () => {
          toast.error("Не удалось загрузить файл")
        },
      },
    )
  }

  const handleActivate = (id: string) => {
    activateFile(
      { id },
      {
        onSuccess: () => {
          toast.success("Активный файл обновлён")
          invalidateFileList()
        },
        onError: () => {
          toast.error("Не удалось активировать файл")
        },
      },
    )
  }

  const handleDeleteRequest = (file: FileItem) => {
    const ok = window.confirm(
      `Удалить файл «${file.name}»? Действие нельзя отменить.`,
    )
    if (!ok) return

    deleteFile(
      { id: file.id },
      {
        onSuccess: () => {
          toast.success("Файл удалён")
          invalidateFileList()
        },
        onError: () => {
          toast.error("Не удалось удалить файл")
        },
      },
    )
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameDraft("")
  }

  const saveRename = (id: string) => {
    const trimmed = renameDraft.trim()
    if (!trimmed) {
      toast.error("Введите имя файла")
      return
    }
    renameFile(
      { id, name: trimmed },
      {
        onSuccess: () => {
          toast.success("Название обновлено")
          cancelRename()
          invalidateFileList()
        },
        onError: () => {
          toast.error("Не удалось переименовать файл")
        },
      },
    )
  }

  const renderItem = (file: FileItem) => {
    const isActive = file.isActive
    const isEditing = renamingId === file.id

    return (
      <div
        key={file.id}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border bg-background/70 p-4 transition sm:flex-row sm:items-center sm:justify-between",
          isActive
            ? "border-emerald-400/75 bg-emerald-500/5 shadow-md shadow-emerald-500/15"
            : "border-border/70",
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  className="h-9 max-w-md text-sm"
                  disabled={isRenaming}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename(file.id)
                    if (e.key === "Escape") cancelRename()
                  }}
                />
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isRenaming}
                    onClick={() => saveRename(file.id)}
                  >
                    Сохранить
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isRenaming}
                    onClick={cancelRename}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-foreground">
                  {file.name}
                </p>
                {isActive && (
                  <Badge variant="secondary" className="text-[11px]">
                    Активный
                  </Badge>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  disabled={busyGlobal}
                  onClick={() => {
                    setRenamingId(file.id)
                    setRenameDraft(file.name)
                  }}
                  aria-label={`Переименовать ${file.name}`}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </>
            )}
          </div>
          <p className="break-all font-mono text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
            {file.id}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {!isActive && !isEditing && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busyGlobal}
              onClick={() => handleActivate(file.id)}
            >
              Сделать активным
            </Button>
          )}
          {!isEditing && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="text-muted-foreground hover:border-destructive hover:text-destructive"
              disabled={busyGlobal}
              onClick={() => handleDeleteRequest(file)}
              aria-label={`Удалить ${file.name}`}
            >
              <Trash2Icon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader>
        <CardTitle>Список загруженных файлов TLE</CardTitle>
        <CardDescription className="space-y-1 text-xs">
          <span>
            Управляй дампами TLE на сервере: один файл может быть активным —
            по нему строятся пользовательские спутники и координаты.
          </span>
          <span className="block text-muted-foreground">
            {activeFile ? (
              <>Сейчас активен: {activeFile.name}</>
            ) : (
              <>
                Активный файл не выбран — нажми кнопку «Сделать активным».
              </>
            )}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Загрузить новый файл
            </p>
            <p className="text-xs text-muted-foreground">
              Только .txt. После загрузки файл появится в списке ниже.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={serverInputRef}
              type="file"
              className="hidden"
              accept=".txt,text/plain"
              disabled={isServerUploading || !isAuthed}
              onChange={(e) => {
                handleServerFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isServerUploading || !isAuthed}
              onClick={() => serverInputRef.current?.click()}
            >
              <UploadIcon className="size-4" />
              {isServerUploading ? "Загрузка…" : "Выбрать файл (.txt)"}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            Файлы на сервере
            {!isListLoading && isAuthed && (
              <span className="ml-2 font-normal text-muted-foreground">
                ({files.length})
              </span>
            )}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={!isAuthed || isListLoading || isListFetching}
            onClick={() => void refetch()}
          >
            {isListFetching ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Обновить
          </Button>
        </div>

        {!isAuthed ? (
          <p className="text-sm text-muted-foreground">
            Войди в аккаунт, чтобы видеть список файлов.
          </p>
        ) : isListLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Загрузка списка…
          </div>
        ) : isListError ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Не удалось загрузить список файлов.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
            >
              Повторить
            </Button>
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет файлов. Загрузи первый .txt выше — он появится здесь.
          </p>
        ) : (
          <div className="space-y-3">{files.map((file) => renderItem(file))}</div>
        )}
      </CardContent>
    </Card>
  )
}
