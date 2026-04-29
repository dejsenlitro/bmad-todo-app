import { useState, useEffect, useCallback, useRef } from "react";
import type { Todo } from "../types/todo";
import {
  fetchTodos,
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
} from "../api/todo-api";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function setErrorWithAutoDismiss(message: string) {
    clearTimeout(dismissTimer.current);
    setError(message);
    dismissTimer.current = setTimeout(() => setError(null), 5000);
  }

  useEffect(() => {
    return () => clearTimeout(dismissTimer.current);
  }, []);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setErrorWithAutoDismiss("Failed to load todos"))
      .finally(() => setIsLoading(false));
  }, []);

  const addTodo = useCallback(async (text: string) => {
    const tempId = crypto.randomUUID();
    const tempTodo: Todo = {
      id: tempId,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [...prev, tempTodo]);
    clearTimeout(dismissTimer.current);
    setError(null);

    try {
      const saved = await apiCreateTodo(text);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      setErrorWithAutoDismiss("Failed to save todo. Please try again.");
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    let previousCompleted: boolean | undefined;

    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          previousCompleted = t.completed;
          return { ...t, completed: !t.completed };
        }
        return t;
      }),
    );
    clearTimeout(dismissTimer.current);
    setError(null);

    try {
      const saved = await apiUpdateTodo(id, previousCompleted === undefined ? true : !previousCompleted);
      setTodos((prev) => prev.map((t) => (t.id === id ? saved : t)));
    } catch {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: previousCompleted ?? t.completed } : t,
        ),
      );
      setErrorWithAutoDismiss("Failed to update todo. Please try again.");
    }
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    let removed: Todo | undefined;
    let nextFocusId: string | null = null;

    setTodos((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      removed = prev[idx];
      const remaining = prev.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        const nextIdx = idx < remaining.length ? idx : remaining.length - 1;
        nextFocusId = remaining[nextIdx].id;
      }
      return remaining;
    });
    clearTimeout(dismissTimer.current);
    setError(null);

    // Move focus after React re-render
    setTimeout(() => {
      if (nextFocusId) {
        const nextCheckbox = document.querySelector<HTMLElement>(
          `[data-todo-checkbox="${nextFocusId}"]`,
        );
        nextCheckbox?.focus();
      } else {
        document.getElementById("todo-input")?.focus();
      }
    }, 0);

    try {
      await apiDeleteTodo(id);
    } catch {
      if (removed) {
        setTodos((prev) => {
          const index = prev.findIndex(
            (t) => t.createdAt > (removed as Todo).createdAt,
          );
          const newTodos = [...prev];
          if (index === -1) {
            newTodos.push(removed as Todo);
          } else {
            newTodos.splice(index, 0, removed as Todo);
          }
          return newTodos;
        });
      }
      setErrorWithAutoDismiss("Failed to delete todo. Please try again.");
    }
  }, []);

  const clearError = useCallback(() => {
    clearTimeout(dismissTimer.current);
    setError(null);
  }, []);

  return { todos, isLoading, error, addTodo, toggleTodo, removeTodo, clearError };
}
