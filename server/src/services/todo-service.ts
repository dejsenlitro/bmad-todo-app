import * as todoRepository from "../repositories/todo-repository.js";
import { Todo } from "../types/todo.js";

export async function listTodos(): Promise<Todo[]> {
  return todoRepository.findAll();
}

export async function createTodo(text: string): Promise<Todo> {
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 255) {
    const err = new Error("Text must be between 1 and 255 characters");
    (err as any).statusCode = 400;
    throw err;
  }
  return todoRepository.create(trimmed);
}

export async function updateTodo(
  id: string,
  completed: boolean,
): Promise<Todo> {
  const todo = await todoRepository.update(id, { completed });
  if (!todo) {
    const err = new Error("Todo not found");
    (err as any).statusCode = 404;
    throw err;
  }
  return todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const deleted = await todoRepository.remove(id);
  if (!deleted) {
    const err = new Error("Todo not found");
    (err as any).statusCode = 404;
    throw err;
  }
}
