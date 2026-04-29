import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "./todo-item";
import type { Todo } from "../types/todo";

const baseTodo: Todo = {
  id: "abc-123",
  text: "Buy groceries",
  completed: false,
  createdAt: "2026-01-01T00:00:00Z",
};

describe("TodoItem", () => {
  it("renders todo text", () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("calls onToggle with todo id when checkbox clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={onToggle} onDelete={vi.fn()} />
      </ul>,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("abc-123");
  });

  it("calls onDelete with todo id when delete clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={onDelete} />
      </ul>,
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("abc-123");
  });

  it("has correct aria-label on checkbox", () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-label",
      "Mark Buy groceries as complete",
    );
  });

  it("has correct aria-label on delete button", () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    expect(screen.getByRole("button", { name: /delete/i })).toHaveAttribute(
      "aria-label",
      "Delete Buy groceries",
    );
  });

  it("shows aria-checked=false for active todo", () => {
    render(
      <ul>
        <TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("shows aria-checked=true for completed todo", () => {
    const completed = { ...baseTodo, completed: true };
    render(
      <ul>
        <TodoItem todo={completed} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("applies strikethrough style for completed todo", () => {
    const completed = { ...baseTodo, completed: true };
    render(
      <ul>
        <TodoItem todo={completed} onToggle={vi.fn()} onDelete={vi.fn()} />
      </ul>,
    );
    const text = screen.getByText("Buy groceries");
    expect(text.className).toContain("line-through");
  });
});
