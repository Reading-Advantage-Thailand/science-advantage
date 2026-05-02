"use client"

import * as React from "react"
import {
  studentEnrolledClassesResponseSchema,
  type StudentEnrolledClass,
} from "@/lib/validations/student-classes"

interface UseFirstRunResult {
  isFirstRun: boolean
  isLoading: boolean
  error: string | null
}

const FIRST_RUN_CACHE_KEY = "student_first_run_cached"
const FIRST_RUN_CACHE_TTL = 5 * 60 * 1000

interface FirstRunCache {
  isFirstRun: boolean
  timestamp: number
}

export function useFirstRun(): UseFirstRunResult {
  const [isFirstRun, setIsFirstRun] = React.useState<boolean>(true)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    async function checkFirstRun() {
      try {
        const cached = getCachedFirstRun()
        if (cached !== null) {
          if (isActive) {
            setIsFirstRun(cached)
            setIsLoading(false)
          }
          return
        }

        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/student/classes", {
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
              : "Unable to check enrollment status"
          )
        }

        const parsed = studentEnrolledClassesResponseSchema.parse(payload)
        const enrolledClasses: StudentEnrolledClass[] = parsed.classes
        const firstRun = enrolledClasses.length === 0

        setCachedFirstRun(firstRun)

        if (isActive) {
          setIsFirstRun(firstRun)
          setIsLoading(false)
        }
      } catch (err) {
        if (!isActive) {
          return
        }

        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }

        console.error("Failed to check first-run status", err)

        if (err instanceof Error) {
          setError(err.message || "Unable to check first-run status")
        } else {
          setError("Unable to check first-run status")
        }

        setIsLoading(false)
      }
    }

    void checkFirstRun()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  return { isFirstRun, isLoading, error }
}

export function invalidateFirstRunCache(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(FIRST_RUN_CACHE_KEY)
  } catch {
  }
}

function getCachedFirstRun(): boolean | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const cached = localStorage.getItem(FIRST_RUN_CACHE_KEY)
    if (!cached) {
      return null
    }

    const data: FirstRunCache = JSON.parse(cached)
    const now = Date.now()

    if (now - data.timestamp > FIRST_RUN_CACHE_TTL) {
      localStorage.removeItem(FIRST_RUN_CACHE_KEY)
      return null
    }

    return data.isFirstRun
  } catch {
    return null
  }
}

function setCachedFirstRun(isFirstRun: boolean): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    const data: FirstRunCache = {
      isFirstRun,
      timestamp: Date.now(),
    }
    localStorage.setItem(FIRST_RUN_CACHE_KEY, JSON.stringify(data))
  } catch {
  }
}