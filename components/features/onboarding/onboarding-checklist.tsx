"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { IconCheck, IconBook, IconClipboardCheck, IconUsers } from "@tabler/icons-react"

type Role = "STUDENT" | "TEACHER"

interface ChecklistItem {
  id: string
  label: string
  icon: React.ReactNode
  checkFn: () => Promise<boolean>
}

interface OnboardingChecklistProps {
  role: Role
  classId?: string
}

const DISMISSED_KEY = "onboarding_checklist_dismissed"
const STUDENT_ITEMS = (classId?: string): ChecklistItem[] => [
  {
    id: "join-class",
    label: "Join a class",
    icon: <IconUsers size={16} />,
    checkFn: async () => classId != null,
  },
  {
    id: "complete-lesson",
    label: "Complete your first lesson",
    icon: <IconBook size={16} />,
    checkFn: async () => {
      if (!classId) return false
      try {
        const res = await fetch(`/api/student/classes/${classId}/progress`)
        if (!res.ok) return false
        const data = await res.json()
        return (data.completedLessons ?? 0) > 0
      } catch {
        return false
      }
    },
  },
  {
    id: "take-quiz",
    label: "Take your first quiz",
    icon: <IconClipboardCheck size={16} />,
    checkFn: async () => {
      if (!classId) return false
      try {
        const res = await fetch(`/api/student/classes/${classId}/progress`)
        if (!res.ok) return false
        const data = await res.json()
        return (data.quizzesTaken ?? 0) > 0
      } catch {
        return false
      }
    },
  },
]

const TEACHER_ITEMS = (classId?: string): ChecklistItem[] => [
  {
    id: "create-class",
    label: "Create a class",
    icon: <IconUsers size={16} />,
    checkFn: async () => classId != null,
  },
  {
    id: "share-code",
    label: "Share join code with students",
    icon: <IconCheck size={16} />,
    checkFn: async () => false,
  },
  {
    id: "preview-lesson",
    label: "Preview a lesson",
    icon: <IconBook size={16} />,
    checkFn: async () => false,
  },
]

function getDismissed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true"
  } catch {
    return false
  }
}

function setDismissed(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(DISMISSED_KEY, "true")
  } catch {}
}

export function OnboardingChecklist({ role, classId }: OnboardingChecklistProps) {
  const [completed, setCompleted] = React.useState<Record<string, boolean>>({})
  const [dismissed, setDismissedState] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    setDismissedState(getDismissed())
  }, [])

  React.useEffect(() => {
    if (dismissed) return

    const items = role === "STUDENT" ? STUDENT_ITEMS(classId) : TEACHER_ITEMS(classId)

    async function checkItems() {
      const results: Record<string, boolean> = {}
      for (const item of items) {
        results[item.id] = await item.checkFn()
      }
      setCompleted(results)

      const allDone = Object.values(results).every(Boolean)
      if (allDone) {
        setDismissed()
        setDismissedState(true)
      } else {
        setVisible(true)
      }
    }

    void checkItems()
  }, [role, classId, dismissed])

  if (dismissed || !visible) {
    return null
  }

  const items = role === "STUDENT" ? STUDENT_ITEMS(classId) : TEACHER_ITEMS(classId)

  return (
    <Card className="edu-card border-2 border-dashed border-rose-200 dark:border-rose-800">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">
            Your First Steps
          </h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <span className={completed[item.id] ? "text-rose-500" : "text-muted-foreground"}>
                  {item.icon}
                </span>
                <span className={completed[item.id] ? "line-through text-muted-foreground" : ""}>
                  {item.label}
                </span>
                {completed[item.id] && (
                  <IconCheck size={14} className="text-rose-500" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}