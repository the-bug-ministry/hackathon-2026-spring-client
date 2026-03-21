import { useCallback, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "orbitex:tle-dumps"

type StoredDump = {
  id: string
  name: string
  content: string
  createdAt: string
  entries: number
  size: number
  isActive: boolean
}

export interface TleDump extends StoredDump {}

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }

  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "")
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error("Не удалось прочитать файл"))
    }
    reader.readAsText(file)
  })

const estimateTleEntries = (content: string) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return 0

  const line1Lines = lines.filter((line) => line.startsWith("1 ")).length
  const line2Lines = lines.filter((line) => line.startsWith("2 ")).length
  const pairs = Math.min(line1Lines, line2Lines)

  if (pairs > 0) {
    return pairs
  }

  return Math.max(0, Math.floor(lines.length / 3))
}

const normalizeStored = (dumps: unknown): TleDump[] => {
  if (!Array.isArray(dumps)) {
    return []
  }

  const normalized = dumps
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null
      const candidate = entry as Partial<StoredDump>

      if (
        typeof candidate.id !== "string" ||
        typeof candidate.name !== "string" ||
        typeof candidate.content !== "string"
      ) {
        return null
      }

      return {
        id: candidate.id,
        name: candidate.name,
        content: candidate.content,
        createdAt:
          typeof candidate.createdAt === "string"
            ? candidate.createdAt
            : new Date().toISOString(),
        entries: typeof candidate.entries === "number" ? candidate.entries : 0,
        size:
          typeof candidate.size === "number"
            ? candidate.size
            : candidate.content.length,
        isActive: Boolean(candidate.isActive),
      }
    })
    .filter((dump): dump is TleDump => dump !== null)

  if (!normalized.length) {
    return []
  }

  const activeIndex = normalized.findIndex((dump) => dump.isActive)
  if (activeIndex === -1) {
    return normalized.map((dump, index) => ({
      ...dump,
      isActive: index === 0,
    }))
  }

  return normalized.map((dump, index) => ({
    ...dump,
    isActive: index === activeIndex,
  }))
}

const loadStoredDumps = () => {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return normalizeStored(JSON.parse(raw))
  } catch (error) {
    console.error("Не удалось загрузить TLE дампы", error)
    return []
  }
}

const persistDumps = (dumps: TleDump[]) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dumps))
  } catch (error) {
    console.error("Не удалось сохранить TLE дампы", error)
  }
}

export const useTleDumps = () => {
  const [dumps, setDumps] = useState<TleDump[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDumps(loadStoredDumps())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    persistDumps(dumps)
  }, [dumps, hydrated])

  const activeDump = useMemo(
    () => dumps.find((dump) => dump.isActive) ?? null,
    [dumps]
  )

  const addDumps = useCallback(async (files: File[]) => {
    const items = await Promise.all(
      files.map(async (file) => {
        const content = await readFileAsText(file)
        return {
          id: createId(),
          name: file.name,
          content,
          createdAt: new Date().toISOString(),
          entries: estimateTleEntries(content),
          size: file.size,
          isActive: false,
        }
      })
    )

    setDumps((previous) => {
      const hasActive = previous.some((dump) => dump.isActive)
      const normalized = items.map((item, index) => ({
        ...item,
        isActive: !hasActive && index === 0,
      }))

      return [...previous, ...normalized]
    })
  }, [])

  const setActive = useCallback((id: string) => {
    setDumps((previous) =>
      previous.map((dump) => ({
        ...dump,
        isActive: dump.id === id,
      }))
    )
  }, [])

  const removeDump = useCallback((id: string) => {
    setDumps((previous) => {
      const next = previous.filter((dump) => dump.id !== id)
      if (!next.length) return []
      if (next.some((dump) => dump.isActive)) {
        return next
      }
      return next.map((dump, index) => ({
        ...dump,
        isActive: index === 0,
      }))
    })
  }, [])

  return {
    dumps,
    activeDump,
    addDumps,
    setActive,
    removeDump,
  }
}
