export type TleUploadParams = {
  file: File
  signal?: AbortSignal
}

export type TleUploadResponse = {
  success: boolean
}
