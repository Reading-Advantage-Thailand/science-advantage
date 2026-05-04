"use client"

import * as React from "react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { IconQuestionMark } from "@tabler/icons-react"

interface ContextualHelpProps {
  surfaceId: string
  content: React.ReactNode
  children?: React.ReactNode
}

const DISMISSED_KEY = "contextual_help_dismissed"

interface DismissedState {
  [key: string]: boolean
}

function getDismissed(): DismissedState {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(DISMISSED_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function setDismissed(surfaceId: string): void {
  if (typeof window === "undefined") return
  try {
    const dismissed = getDismissed()
    dismissed[surfaceId] = true
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed))
  } catch {}
}

export function ContextualHelp({ surfaceId, content, children }: ContextualHelpProps) {
  const [dismissed, setDismissedState] = React.useState<boolean>(false)

  React.useEffect(() => {
    const dismissedState = getDismissed()
    setDismissedState(dismissedState[surfaceId] ?? false)
  }, [surfaceId])

  if (dismissed) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => {
              setDismissed(surfaceId)
              setDismissedState(true)
            }}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Dismiss help tooltip"
          >
            {children ?? <IconQuestionMark size={12} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" data-noscript-hide="true">
          <noscript>
            <span>{content}</span>
          </noscript>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ContextualHelpPlainText({ surfaceId, content }: { surfaceId: string; content: string }) {
  const [dismissed, setDismissedState] = React.useState(false)

  React.useEffect(() => {
    const dismissedState = getDismissed()
    setDismissedState(dismissedState[surfaceId] ?? false)
  }, [surfaceId])

  if (dismissed) {
    return null
  }

  return (
    <span className="text-sm text-muted-foreground inline-flex items-center gap-1" data-noscript-hide="true">
      <noscript>
        <span className="text-sm text-muted-foreground">{content}</span>
      </noscript>
      <button
        type="button"
        onClick={() => {
          setDismissed(surfaceId)
          setDismissedState(true)
        }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-xs transition-colors"
        aria-label="Dismiss help"
      >
        ×
      </button>
    </span>
  )
}