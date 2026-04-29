import pool from "../config/database.js";
import { Todo } from "../types/todo.js";

interface TodoRow {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

function toCamelCase(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

export async function findAll(): Promise<Todo[]> {
  const result = await pool.query<TodoRow>(
    "SELECT id, text, completed, created_at FROM todos ORDER BY created_at ASC"
  );
  return result.rows.map(toCamelCase);
}

export async function findById(id: string): Promise<Todo | null> {
  const result = await pool.query<TodoRow>(
    "SELECT id, text, completed, created_at FROM todos WHERE id = $1",
    [id]
  );
  if (result.rows.length === 0) return null;
  return toCamelCase(result.rows[0]);
}

export async function create(text: string): Promise<Todo> {
  const result = await pool.query<TodoRow>(
    "INSERT INTO todos (text) VALUES ($1) RETURNING id, text, completed, created_at",
    [text]
  );
  return toCamelCase(result.rows[0]);
}

export async function update(
  id: string,
  fields: { completed: boolean }
): Promise<Todo | null> {
  const result = await pool.query<TodoRow>(
    "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING id, text, completed, created_at",
    [fields.completed, id]
  );
  if (result.rows.length === 0) return null;
  return toCamelCase(result.rows[0]);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
