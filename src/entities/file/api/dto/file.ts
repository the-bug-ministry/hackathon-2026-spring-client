/** Элемент списка загруженных файлов (GET /file) */
export type FileItem = {
  id: string
  name: string
  isActive: boolean
}

export type FileListResponse = {
  files: FileItem[]
}

/** Тело PATCH /file/update/activate/:id */
export type ActivateFileBody = {
  isActive: boolean
}

/** Ответ при активации файла */
export type ActivateFileResponse = {
  isActive: boolean
}

/** Ответ при удалении (DELETE /file/:id) */
export type DeleteFileResponse = {
  success: boolean
}

/** Тело PATCH /file/update/name/:id */
export type UpdateFileNameBody = {
  name: string
}

/** Ответ при переименовании */
export type UpdateFileNameResponse = {
  file: FileItem
}

export type UpdateFileNameParams = {
  id: string
  name: string
  signal?: AbortSignal
}

export type FileListRequestParams = {
  signal?: AbortSignal
}

export type FileByIdParams = {
  id: string
  signal?: AbortSignal
}
