import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ContextualHelp, ContextualHelpPlainText } from "../contextual-help"

vi.mock("@/components/ui/tooltip", async () => {
  const actual = await vi.importActual("@/components/ui/tooltip")
  return {
    ...(actual as object),
    TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
    Tooltip: ({ children }: { children: React.ReactNode }) => children,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => children,
    TooltipContent: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe("ContextualHelp", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders help trigger button", () => {
    render(
      <ContextualHelp surfaceId="test-surface" content={<span>Help text</span>}>
        <span>?</span>
      </ContextualHelp>
    )
    expect(screen.getByRole("button", { name: /dismiss help tooltip/i })).toBeInTheDocument()
  })

  it("persists dismissal to localStorage", async () => {
    const { unmount } = render(
      <ContextualHelp surfaceId="test-persist" content={<span>Help text</span>} />
    )

    const button = screen.getByRole("button", { name: /dismiss help tooltip/i })
    fireEvent.click(button)

    await waitFor(() => {
      const stored = localStorage.getItem("contextual_help_dismissed")
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed["test-persist"]).toBe(true)
    })

    unmount()
  })

  it("does not render after dismissal on re-mount", async () => {
    localStorage.setItem("contextual_help_dismissed", JSON.stringify({ "test-surface": true }))

    const { unmount } = render(
      <ContextualHelp surfaceId="test-surface" content={<span>Help text</span>} />
    )

    expect(screen.queryByRole("button", { name: /dismiss help tooltip/i })).toBeNull()

    unmount()
  })
})

describe("ContextualHelpPlainText", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders plain text help with dismiss button", () => {
    render(
      <ContextualHelpPlainText
        surfaceId="test-plain"
        content="This is helpful text"
      />
    )

    expect(screen.getByText("This is helpful text")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /dismiss help/i })).toBeInTheDocument()
  })

  it("persists dismissal to localStorage", async () => {
    render(
      <ContextualHelpPlainText surfaceId="test-plain-2" content="Dismiss me" />
    )

    const button = screen.getByRole("button", { name: /dismiss help/i })
    fireEvent.click(button)

    await waitFor(() => {
      const stored = localStorage.getItem("contextual_help_dismissed")
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed["test-plain-2"]).toBe(true)
    })
  })
})