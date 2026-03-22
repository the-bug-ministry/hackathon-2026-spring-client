import { apiClient } from "@/shared/api/http/instance-client"
import type {
  ActivateFileResponse,
  DeleteFileResponse,
  FileByIdParams,
  FileListRequestParams,
  FileListResponse,
  UpdateFileNameParams,
  UpdateFileNameResponse,
} from "../dto/file"

export const fileApi = {
  /** Список всех загруженных файлов пользователя */
  getFiles: ({ signal }: FileListRequestParams = {}) => {
    return apiClient.request<FileListResponse>({
      path: "file",
      method: "GET",
      signal,
    })
  },

  /** Сделать файл активным — данные из него идут в спутники/координаты пользователя */
  activateFile: ({ id, signal }: FileByIdParams) => {
    return apiClient.request<ActivateFileResponse>({
      path: `file/update/activate/${encodeURIComponent(id)}`,
      method: "PATCH",
      body: { isActive: true },
      signal,
    })
  },

  /** Переименовать файл */
  updateFileName: ({ id, name, signal }: UpdateFileNameParams) => {
    return apiClient.request<UpdateFileNameResponse>({
      path: `file/update/name/${encodeURIComponent(id)}`,
      method: "PATCH",
      body: { name },
      signal,
    })
  },

  /** Удалить файл */
  deleteFile: ({ id, signal }: FileByIdParams) => {
    return apiClient.request<DeleteFileResponse>({
      path: `file/${encodeURIComponent(id)}`,
      method: "DELETE",
      signal,
    })
  },
}
