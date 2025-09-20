import { render, screen } from "@testing-library/react";

import { LessonContent } from "./lesson-content";

describe("LessonContent", () => {
  it("renders lesson markdown as preformatted text", () => {
    const content = "## Title\n- Item one\n- Item two";

    render(<LessonContent content={content} />);

    expect(screen.getByText("## Title", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("- Item one", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("- Item two", { exact: false })).toBeInTheDocument();
  });
});
