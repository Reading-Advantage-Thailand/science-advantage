"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Copy, Check, ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type WizardStep = 1 | 2 | 3

export function TeacherSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(1)
  const [createdClass, setCreatedClass] = React.useState<{
    name: string
    joinCode: string
  } | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleCopyJoinCode = React.useCallback(async () => {
    if (!createdClass) return

    try {
      await navigator.clipboard.writeText(createdClass.joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy join code")
    }
  }, [createdClass])

  const handleComplete = React.useCallback(() => {
    try {
      localStorage.removeItem("teacher_has_classes_cached")
    } catch {
    }
    router.refresh()
  }, [router])

  const handleClassCreated = React.useCallback((classData: { name: string; joinCode: string }) => {
    setCreatedClass(classData)
    setCurrentStep(2)
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="text-5xl">🍎</div>
        <h1 className="text-3xl font-bold tracking-tight edu-title">
          Welcome to Science Advantage!
        </h1>
        <p className="text-lg text-muted-foreground">
          Let&apos;s get you set up with your first class in just a few steps.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep === step
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step ? "✓" : step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  currentStep > step ? "bg-primary/40" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="edu-card shadow-lg">
        {currentStep === 1 && (
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Create your first class</h2>
                <p className="text-muted-foreground">
                  Give your class a name, choose a grade level, and set your standards.
                </p>
              </div>
              <WizardClassForm onSuccess={handleClassCreated} />
            </div>
          </CardContent>
        )}

        {currentStep === 2 && createdClass && (
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <h2 className="text-xl font-semibold">Share the join code</h2>
                <p className="text-muted-foreground">
                  Students can use this code to join <strong>{createdClass.name}</strong>.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="px-6 py-4 bg-muted rounded-lg font-mono text-2xl tracking-wider font-bold">
                  {createdClass.joinCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyJoinCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Write this code on the board or share it with students digitally.
                They&apos;ll need to enter it when signing up.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {currentStep === 3 && (
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">🚀</div>
                <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
                <p className="text-muted-foreground">
                  Here&apos;s what you can do next to get started.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4 p-4 rounded-lg border bg-card">
                  <div className="text-2xl">📚</div>
                  <div>
                    <h3 className="font-medium">Preview lessons</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse the curriculum and see what your students will learn.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg border bg-card">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-medium">Track progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor student completion and mastery as they work through lessons.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg border bg-card">
                  <div className="text-2xl">🔔</div>
                  <div>
                    <h3 className="font-medium">Intervention alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when students need extra help or attention.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

interface WizardClassFormProps {
  onSuccess: (data: { name: string; joinCode: string }) => void
}

function WizardClassForm({ onSuccess }: WizardClassFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState("")
  const [gradeLevel, setGradeLevel] = React.useState<number | null>(null)
  const [standardsAlignment, setStandardsAlignment] = React.useState<string>("THAI")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !gradeLevel) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          gradeLevel,
          standardsAlignment,
        }),
      })

      const body = await response.json()

      if (!response.ok || !body.success) {
        toast.error(body.error ?? "Failed to create class")
        return
      }

      toast.success("Class created", {
        description: `Join code: ${body.data.joinCode}`,
      })

      onSuccess({
        name: body.data.name,
        joinCode: body.data.joinCode,
      })
    } catch {
      toast.error("Unable to create class", {
        description: "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="className" className="text-sm font-medium">
          Class Name
        </label>
        <input
          id="className"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter class name"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="gradeLevel" className="text-sm font-medium">
          Grade Level
        </label>
        <select
          id="gradeLevel"
          value={gradeLevel ?? ""}
          onChange={(e) => setGradeLevel(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        >
          <option value="">Select grade level</option>
          <option value={3}>Grade 3</option>
          <option value={4}>Grade 4</option>
          <option value={5}>Grade 5</option>
          <option value={6}>Grade 6</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="standards" className="text-sm font-medium">
          Standards Alignment
        </label>
        <select
          id="standards"
          value={standardsAlignment}
          onChange={(e) => setStandardsAlignment(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        >
          <option value="THAI">Thai National Standards</option>
          <option value="NGSS">NGSS</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Class"}
      </Button>
    </form>
  )
}