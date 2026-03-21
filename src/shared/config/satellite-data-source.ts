/** `mock` — только моки из репозитория; любое другое значение — демо API `GET /satellite/demo` */
export function isSatelliteMockMode(): boolean {
  return import.meta.env.VITE_PUBLIC_SATELLITE_DATA_SOURCE === "mock"
}
