"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { JoinClassForm } from "@/components/features/student/join-class-form"
import { useFirstRun } from "@/components/hooks/use-first-run"

interface StudentWelcomeScreenProps {
  student: {
    name: string
  }
}

export function StudentWelcomeScreen({ student }: StudentWelcomeScreenProps) {
  const { isFirstRun, isLoading } = useFirstRun()

  if (isLoading) {
    return null
  }

  if (!isFirstRun) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="text-5xl">🔬</div>
          <h1 className="text-3xl font-bold tracking-tight edu-title">
            Welcome, {student.name}!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Ready to begin your scientific adventure? Join a class to start
            exploring hands-on science lessons aligned to the Thai curriculum.
          </p>
        </div>

        <Card className="edu-card shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <JoinClassForm />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask your teacher for the class code — it&apos;s usually 6 letters
                like &ldquo;ABC123&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}