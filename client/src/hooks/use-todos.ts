import { useState, useEffect, useCallback } from "react";
import type { Todo } from "../types/todo";
import { fetchTodos, createTodo as apiCreateTodo } from "../api/todo-api";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setError("Failed to load todos"))
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
    setError(null);

    try {
      const saved = await apiCreateTodo(text);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      setError("Failed to save todo. Please try again.");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { todos, isLoading, error, addTodo, clearError };
}
