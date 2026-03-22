import { ACCESS_TOKEN } from "@/entities/auth/constants"
import axios, { type AxiosRequestConfig, type Method } from "axios"
import Cookies from "js-cookie"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL

type RequestParams = {
  method?: Method
  path: string
  body?: object | FormData
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
  headers?: Record<string, string>
  responseType?: AxiosRequestConfig["responseType"]
}

export type ApiResponse<T> = {
  data: T
  status: number
}

class ApiClient {
  private static instance: ApiClient

  private readonly baseUrl: string = API_BASE_URL

  static getClient(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private buildConfig({
    method = "GET",
    path,
    body,
    params,
    signal,
    headers,
    responseType,
  }: RequestParams): AxiosRequestConfig {
    const query =
      params &&
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      )

    return {
      method,
      url: `${this.baseUrl}/${path}`,
      data: body,
      params: query && Object.keys(query).length > 0 ? query : undefined,
      signal,
      responseType,
      headers: {
        Authorization: `Bearer ${Cookies.get(ACCESS_TOKEN) || ""}`,
        credentials: "include",
        ...headers,
      },
    }
  }

  private handleRequestError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      if (error.code === "ERR_CANCELED") {
        throw error
      }

      const status = error.response?.status
      if (status === 401) {
        throw new Error()
      }
      if (status === 403) {
        throw new Error()
      }
      if (status === 404) {
        throw new Error()
      }

      const fallbackMessage =
        error.message || "Произошла ошибка при запросе к серверу"
      toast.error(fallbackMessage)
      throw new Error(fallbackMessage)
    }

    const unknownErrorMessage =
      "Неизвестная ошибка: " +
      (error instanceof Error ? error.message : String(error))
    toast.error(unknownErrorMessage)
    throw new Error(unknownErrorMessage)
  }

  async requestWithMeta<T>(params: RequestParams): Promise<ApiResponse<T>> {
    const config = this.buildConfig(params)

    try {
      const response = await axios(config)

      return {
        data: response.data as T,
        status: response.status,
      }
    } catch (error) {
      this.handleRequestError(error)
    }
  }

  async request<T>(params: RequestParams): Promise<T> {
    const response = await this.requestWithMeta<T>(params)
    return response.data
  }
}

export const apiClient = ApiClient.getClient()
