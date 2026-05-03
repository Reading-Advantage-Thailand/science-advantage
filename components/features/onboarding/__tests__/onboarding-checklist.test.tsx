import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { OnboardingChecklist } from "../onboarding-checklist"

vi.mock("@/lib/prisma", () => ({ default: { class: { findMany: vi.fn() } } }))

describe("OnboardingChecklist", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("renders nothing when dismissed", async () => {
    localStorage.setItem("onboarding_checklist_dismissed", "true")

    render(<OnboardingChecklist role="STUDENT" />)

    await waitFor(() => {
      expect(screen.queryByText("Your First Steps")).toBeNull()
    })
  })

  it("renders checklist for student role", async () => {
    render(<OnboardingChecklist role="STUDENT" />)

    await waitFor(() => {
      expect(screen.getByText("Your First Steps")).toBeInTheDocument()
      expect(screen.getByText("Join a class")).toBeInTheDocument()
      expect(screen.getByText("Complete your first lesson")).toBeInTheDocument()
      expect(screen.getByText("Take your first quiz")).toBeInTheDocument()
    })
  })

  it("renders checklist for teacher role", async () => {
    render(<OnboardingChecklist role="TEACHER" />)

    await waitFor(() => {
      expect(screen.getByText("Your First Steps")).toBeInTheDocument()
      expect(screen.getByText("Create a class")).toBeInTheDocument()
      expect(screen.getByText("Share join code with students")).toBeInTheDocument()
      expect(screen.getByText("Preview a lesson")).toBeInTheDocument()
    })
  })

  it("shows completed items as crossed out", async () => {
    render(<OnboardingChecklist role="TEACHER" classId="test-class-id" />)

    await waitFor(() => {
      const createClassItem = screen.getByText("Create a class")
      expect(createClassItem).toHaveClass("line-through")
    })
  })
})