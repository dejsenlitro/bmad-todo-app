import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTodos } from "./use-todos";

// Mock the API module
vi.mock("../api/todo-api", () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import {
  fetchTodos,
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
} from "../api/todo-api";

const mockFetchTodos = vi.mocked(fetchTodos);
const mockApiCreateTodo = vi.mocked(apiCreateTodo);
const mockApiUpdateTodo = vi.mocked(apiUpdateTodo);
const mockApiDeleteTodo = vi.mocked(apiDeleteTodo);

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchTodos.mockResolvedValue([]);
});

describe("useTodos", () => {
  describe("initial load", () => {
    it("starts with loading state", () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.isLoading).toBe(true);
      expect(result.current.todos).toEqual([]);
    });

    it("loads todos and clears loading", async () => {
      const todos = [
        { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
      ];
      mockFetchTodos.mockResolvedValue(todos);

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.todos).toEqual(todos);
    });

    it("sets error on fetch failure", async () => {
      mockFetchTodos.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.error).toBe("Failed to load todos");
    });
  });

  describe("addTodo", () => {
    it("optimistically adds todo then replaces with server response", async () => {
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const saved = {
        id: "server-1",
        text: "New",
        completed: false,
        createdAt: "2026-01-01",
      };
      mockApiCreateTodo.mockResolvedValue(saved);

      await act(async () => {
        await result.current.addTodo("New");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].id).toBe("server-1");
      expect(result.current.todos[0].text).toBe("New");
    });

    it("reverts and shows error on API failure", async () => {
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockApiCreateTodo.mockRejectedValue(new Error("fail"));

      await act(async () => {
        await result.current.addTodo("Failing");
      });

      expect(result.current.todos).toHaveLength(0);
      expect(result.current.error).toBe(
        "Failed to save todo. Please try again.",
      );
    });
  });

  describe("toggleTodo", () => {
    it("optimistically toggles and updates from server", async () => {
      const todos = [
        { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
      ];
      mockFetchTodos.mockResolvedValue(todos);

      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const updated = { ...todos[0], completed: true };
      mockApiUpdateTodo.mockResolvedValue(updated);

      await act(async () => {
        await result.current.toggleTodo("1");
      });

      expect(result.current.todos[0].completed).toBe(true);
    });

    it("reverts on API failure", async () => {
      const todos = [
        { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
      ];
      mockFetchTodos.mockResolvedValue(todos);

      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockApiUpdateTodo.mockRejectedValue(new Error("fail"));

      await act(async () => {
        await result.current.toggleTodo("1");
      });

      expect(result.current.todos[0].completed).toBe(false);
      expect(result.current.error).toBe(
        "Failed to update todo. Please try again.",
      );
    });
  });

  describe("removeTodo", () => {
    it("optimistically removes todo", async () => {
      const todos = [
        { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
      ];
      mockFetchTodos.mockResolvedValue(todos);

      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockApiDeleteTodo.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.removeTodo("1");
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it("reverts and shows error on API failure", async () => {
      const todos = [
        { id: "1", text: "Test", completed: false, createdAt: "2026-01-01" },
      ];
      mockFetchTodos.mockResolvedValue(todos);

      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockApiDeleteTodo.mockRejectedValue(new Error("fail"));

      act(() => {
        result.current.removeTodo("1");
      });

      await waitFor(() => {
        expect(result.current.error).toBe(
          "Failed to delete todo. Please try again.",
        );
      });
      expect(result.current.todos).toHaveLength(1);
    });
  });

  describe("error auto-dismiss", () => {
    it("clears error after 5 seconds", async () => {
      vi.useFakeTimers();
      mockFetchTodos.mockRejectedValue(new Error("fail"));

      const { result } = renderHook(() => useTodos());

      // Flush the rejected promise and state updates
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(result.current.error).toBe("Failed to load todos");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(result.current.error).toBeNull();
      vi.useRealTimers();
    });
  });

  describe("clearError", () => {
    it("manually clears the error", async () => {
      mockFetchTodos.mockRejectedValue(new Error("fail"));

      const { result } = renderHook(() => useTodos());
      await waitFor(() =>
        expect(result.current.error).toBe("Failed to load todos"),
      );

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
