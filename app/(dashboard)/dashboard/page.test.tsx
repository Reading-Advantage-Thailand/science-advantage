import React from "react";
import { render, screen } from "@testing-library/react";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders highlight cards and action buttons", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /welcome to your science advantage dashboard/i,
      })
    ).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);

    expect(screen.getByRole("button", { name: /start a class demo/i })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: /view sprint backlog/i })).toHaveClass("border");
  });
});
