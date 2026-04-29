import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoInput from "./todo-input";

describe("TodoInput", () => {
  it("auto-focuses the input on mount", () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByLabelText("Add a new todo")).toHaveFocus();
  });

  it("calls onAdd with trimmed text on submit", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Add a new todo"), "  Buy milk  ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledWith("Buy milk");
  });

  it("clears input after successful submit", async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByLabelText("Add a new todo");
    await user.type(input, "Test");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(input).toHaveValue("");
  });

  it("does not call onAdd for empty input", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd for whitespace-only input", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Add a new todo"), "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("submits on Enter key", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Add a new todo"), "Task{Enter}");

    expect(onAdd).toHaveBeenCalledWith("Task");
  });

  it("has correct placeholder text", () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Add a new todo..."),
    ).toBeInTheDocument();
  });

  it("has autocomplete off", () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByLabelText("Add a new todo")).toHaveAttribute(
      "autocomplete",
      "off",
    );
  });
});
