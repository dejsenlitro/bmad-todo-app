import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TodoList from "./todo-list";
import type { Todo } from "../types/todo";

const todos: Todo[] = [
  { id: "1", text: "First", completed: false, createdAt: "2026-01-01T00:00:00Z" },
  { id: "2", text: "Second", completed: true, createdAt: "2026-01-02T00:00:00Z" },
];

describe("TodoList", () => {
  it("renders empty state when no todos", () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(
      screen.getByText("Your todo list is empty. Start by adding a task!"),
    ).toBeInTheDocument();
  });

  it("renders all todo items", () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("renders as a list with correct role", () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole("list", { name: "Todo list" })).toBeInTheDocument();
  });

  it("has aria-live polite for screen readers", () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-live", "polite");
  });
});
