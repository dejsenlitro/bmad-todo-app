import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../repositories/todo-repository.js", () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import * as todoService from "./todo-service.js";
import * as todoRepository from "../repositories/todo-repository.js";

const mockRepo = vi.mocked(todoRepository);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listTodos", () => {
  it("delegates to repository.findAll", async () => {
    const fakeTodos = [
      { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
    ];
    mockRepo.findAll.mockResolvedValue(fakeTodos);

    const result = await todoService.listTodos();

    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(fakeTodos);
  });
});

describe("createTodo", () => {
  it("trims text and creates todo", async () => {
    const saved = { id: "1", text: "Trimmed", completed: false, createdAt: "2026-01-01" };
    mockRepo.create.mockResolvedValue(saved);

    const result = await todoService.createTodo("  Trimmed  ");

    expect(mockRepo.create).toHaveBeenCalledWith("Trimmed");
    expect(result).toEqual(saved);
  });

  it("throws 400 for empty text", async () => {
    await expect(todoService.createTodo("")).rejects.toThrow(
      "Text must be between 1 and 255 characters",
    );
    try {
      await todoService.createTodo("");
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });

  it("throws 400 for whitespace-only text", async () => {
    await expect(todoService.createTodo("   ")).rejects.toThrow();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("throws 400 for text exceeding 255 chars", async () => {
    await expect(todoService.createTodo("x".repeat(256))).rejects.toThrow();
    try {
      await todoService.createTodo("x".repeat(256));
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });

  it("accepts text at exactly 255 chars", async () => {
    const text = "x".repeat(255);
    mockRepo.create.mockResolvedValue({
      id: "1", text, completed: false, createdAt: "2026-01-01",
    });

    await todoService.createTodo(text);
    expect(mockRepo.create).toHaveBeenCalledWith(text);
  });

  it("accepts single character text", async () => {
    mockRepo.create.mockResolvedValue({
      id: "1", text: "a", completed: false, createdAt: "2026-01-01",
    });

    await todoService.createTodo("a");
    expect(mockRepo.create).toHaveBeenCalledWith("a");
  });
});

describe("updateTodo", () => {
  it("updates and returns the todo", async () => {
    const updated = { id: "1", text: "Test", completed: true, createdAt: "2026-01-01" };
    mockRepo.update.mockResolvedValue(updated);

    const result = await todoService.updateTodo("1", true);

    expect(mockRepo.update).toHaveBeenCalledWith("1", { completed: true });
    expect(result).toEqual(updated);
  });

  it("throws 404 when todo not found", async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(todoService.updateTodo("missing-id", true)).rejects.toThrow("Todo not found");
    try {
      await todoService.updateTodo("missing-id", true);
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });
});

describe("deleteTodo", () => {
  it("deletes successfully when todo exists", async () => {
    mockRepo.remove.mockResolvedValue(true);

    await expect(todoService.deleteTodo("1")).resolves.toBeUndefined();
    expect(mockRepo.remove).toHaveBeenCalledWith("1");
  });

  it("throws 404 when todo not found", async () => {
    mockRepo.remove.mockResolvedValue(false);

    await expect(todoService.deleteTodo("missing-id")).rejects.toThrow("Todo not found");
    try {
      await todoService.deleteTodo("missing-id");
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });
});
