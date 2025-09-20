import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LessonCompletionToggle } from "./lesson-completion-toggle";

describe("LessonCompletionToggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the initial completion state", () => {
    render(
      <LessonCompletionToggle
        lessonSlug="lesson-1"
        classContext={{ id: "class-1", name: "NGSS Cohort" }}
        initialCompleted
      />
    );

    expect(screen.getByText("Marked complete")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark incomplete" })).toBeInTheDocument();
    expect(screen.getByText(/Completion for NGSS Cohort/)).toBeInTheDocument();
  });

  it("toggles completion state after a successful update", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          completion: { completed: true },
          classContext: { id: "class-1", name: "NGSS Cohort" },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    render(
      <LessonCompletionToggle
        lessonSlug="lesson-1"
        classContext={{ id: "class-1", name: "NGSS Cohort" }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark complete" }));

    await waitFor(() => {
      expect(screen.getByText("Marked complete")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Mark incomplete" })).toBeEnabled();
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/lessons/lesson-1/completion");
    expect(options?.method).toBe("POST");
    expect(JSON.parse((options?.body as string) ?? "{}")).toEqual({
      completed: true,
      classId: "class-1",
    });
  });

  it("disables the toggle when no class context exists", async () => {
    const user = userEvent.setup();

    const fetchSpy = vi.spyOn(global, "fetch");

    render(<LessonCompletionToggle lessonSlug="lesson-1" />);

    const button = screen.getByRole("button", { name: "Mark complete" });
    expect(button).toBeDisabled();

    await user.click(button);

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("shows an error if the update fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "No class context for completion" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(
      <LessonCompletionToggle
        lessonSlug="lesson-1"
        classContext={{ id: "class-1", name: "NGSS Cohort" }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark complete" }));

    await waitFor(() => {
      expect(screen.getByText("No class context for completion")).toBeInTheDocument();
    });
  });
});
