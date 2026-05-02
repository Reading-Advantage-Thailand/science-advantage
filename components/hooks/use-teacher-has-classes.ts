"use client"

import * as React from "react"

interface UseTeacherHasClassesResult {
  hasClasses: boolean | null
  isLoading: boolean
  error: string | null
}

const TEACHER_CLASSES_CACHE_KEY = "teacher_has_classes_cached"
const TEACHER_CLASSES_CACHE_TTL = 5 * 60 * 1000

interface TeacherClassesCache {
  hasClasses: boolean
  timestamp: number
}

export function useTeacherHasClasses(): UseTeacherHasClassesResult {
  const [hasClasses, setHasClasses] = React.useState<boolean | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    async function checkTeacherClasses() {
      try {
        const cached = getCachedTeacherClasses()
        if (cached !== null) {
          if (isActive) {
            setHasClasses(cached)
            setIsLoading(false)
          }
          return
        }

        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/classes?limit=1", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        })

        let payload: unknown = null
        try {
          payload = await response.json()
        } catch {
          if (response.ok) {
            throw new Error("Unable to parse classes response")
          }
        }

        if (!response.ok) {
          throw new Error(
            typeof (payload as { error?: string } | null)?.error === "string"
              ? (payload as { error: string }).error
              : "Unable to check class status"
          )
        }

        const data = payload as {
          success: boolean
          data?: unknown[]
          pagination?: { total: number }
        }

        const teacherHasClasses = (data.data?.length ?? 0) > 0 ||
          (data.pagination?.total ?? 0) > 0

        setCachedTeacherClasses(teacherHasClasses)

        if (isActive) {
          setHasClasses(teacherHasClasses)
          setIsLoading(false)
        }
      } catch (err) {
        if (!isActive) {
          return
        }

        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }

        console.error("Failed to check teacher classes", err)

        if (err instanceof Error) {
          setError(err.message || "Unable to check class status")
        } else {
          setError("Unable to check class status")
        }

        setIsLoading(false)
      }
    }

    void checkTeacherClasses()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  return { hasClasses, isLoading, error }
}

function getCachedTeacherClasses(): boolean | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const cached = localStorage.getItem(TEACHER_CLASSES_CACHE_KEY)
    if (!cached) {
      return null
    }

    const data: TeacherClassesCache = JSON.parse(cached)
    const now = Date.now()

    if (now - data.timestamp > TEACHER_CLASSES_CACHE_TTL) {
      localStorage.removeItem(TEACHER_CLASSES_CACHE_KEY)
      return null
    }

    return data.hasClasses
  } catch {
    return null
  }
}

function setCachedTeacherClasses(hasClasses: boolean): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const data: TeacherClassesCache = {
      hasClasses,
      timestamp: Date.now(),
    }
    localStorage.setItem(TEACHER_CLASSES_CACHE_KEY, JSON.stringify(data))
  } catch {
  }
}

export function invalidateTeacherClassesCache(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(TEACHER_CLASSES_CACHE_KEY)
  } catch {
  }
}