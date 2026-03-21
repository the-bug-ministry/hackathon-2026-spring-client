import { apiClient } from "@/shared/api/http/instance-client"
import type { TleUploadParams, TleUploadResponse } from "../dto/tle-upload"

class TleApi {
  private static instance: TleApi | null = null

  // Приватный конструктор → запрет создания через new вне класса
  private constructor() {}

  /**
   * Получить единственный экземпляр TleApi
   */
  public static getInstance(): TleApi {
    if (!TleApi.instance) {
      TleApi.instance = new TleApi()
    }
    return TleApi.instance
  }

  /**
   * Загрузка TLE-файла
   */
  public async upload({
    file,
    signal,
  }: TleUploadParams): Promise<TleUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    return apiClient.request<TleUploadResponse>({
      method: "POST",
      path: "tle/upload",
      body: formData,
      signal,
    })
  }
}

export const tleApi = TleApi.getInstance()
