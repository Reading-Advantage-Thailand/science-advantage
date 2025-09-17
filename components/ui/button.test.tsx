import React from "react";
import { render } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
  it("renders the default variant with primary styles", () => {
    const { getByRole } = render(<Button>Mark complete</Button>);

    expect(getByRole("button", { name: "Mark complete" })).toHaveClass("bg-primary");
  });

  it("allows rendering as a child component", () => {
    const { getByRole } = render(
      <Button asChild>
        <a href="#">View details</a>
      </Button>
    );

    expect(getByRole("link", { name: "View details" })).toHaveClass("inline-flex");
  });
});
