import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "./todo-api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchTodos", () => {
  it("returns todos on success", async () => {
    const todos = [{ id: "1", text: "Test", completed: false, createdAt: "2026-01-01" }];
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(todos) });

    const result = await fetchTodos();

    expect(mockFetch).toHaveBeenCalledWith("/api/todos");
    expect(result).toEqual(todos);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchTodos()).rejects.toThrow("Failed to load todos");
  });
});

describe("createTodo", () => {
  it("sends POST and returns created todo", async () => {
    const todo = { id: "1", text: "New", completed: false, createdAt: "2026-01-01" };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(todo) });

    const result = await createTodo("New");

    expect(mockFetch).toHaveBeenCalledWith("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "New" }),
    });
    expect(result).toEqual(todo);
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });

    await expect(createTodo("")).rejects.toThrow("Failed to save todo");
  });
});

describe("updateTodo", () => {
  it("sends PATCH and returns updated todo", async () => {
    const todo = { id: "1", text: "Test", completed: true, createdAt: "2026-01-01" };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(todo) });

    const result = await updateTodo("1", true);

    expect(mockFetch).toHaveBeenCalledWith("/api/todos/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    expect(result).toEqual(todo);
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(updateTodo("1", true)).rejects.toThrow("Failed to update todo");
  });
});

describe("deleteTodo", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await deleteTodo("1");

    expect(mockFetch).toHaveBeenCalledWith("/api/todos/1", { method: "DELETE" });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(deleteTodo("1")).rejects.toThrow("Failed to delete todo");
  });
});
