import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./empty-state";

describe("EmptyState", () => {
  it("renders the empty message", () => {
    render(<EmptyState />);
    expect(
      screen.getByText("Your todo list is empty. Start by adding a task!"),
    ).toBeInTheDocument();
  });
});
