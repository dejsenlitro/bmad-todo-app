import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../app.js";
import pool from "../config/database.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await pool.query("DELETE FROM todos");
});

describe("GET /api/todos", () => {
  it("returns empty array when no todos exist", async () => {
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("returns all todos in creation order", async () => {
    await pool.query("INSERT INTO todos (text) VALUES ('First')");
    await pool.query("INSERT INTO todos (text) VALUES ('Second')");

    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.statusCode).toBe(200);
    const todos = res.json();
    expect(todos).toHaveLength(2);
    expect(todos[0].text).toBe("First");
    expect(todos[1].text).toBe("Second");
  });

  it("returns camelCase fields", async () => {
    await pool.query("INSERT INTO todos (text) VALUES ('Test')");

    const res = await app.inject({ method: "GET", url: "/api/todos" });
    const todo = res.json()[0];
    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("text");
    expect(todo).toHaveProperty("completed");
    expect(todo).toHaveProperty("createdAt");
    expect(todo).not.toHaveProperty("created_at");
  });
});

describe("POST /api/todos", () => {
  it("creates a todo and returns 201", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Buy milk" },
    });
    expect(res.statusCode).toBe(201);
    const todo = res.json();
    expect(todo.text).toBe("Buy milk");
    expect(todo.completed).toBe(false);
    expect(todo.id).toBeDefined();
    expect(todo.createdAt).toBeDefined();
  });

  it("trims whitespace from text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "  Trim me  " },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().text).toBe("Trim me");
  });

  it("returns 400 for empty text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty("statusCode", 400);
  });

  it("returns 400 for missing text field", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for text exceeding 255 chars", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "x".repeat(256) },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for whitespace-only text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "   " },
    });
    expect(res.statusCode).toBe(400);
  });

  it("persists the todo in the database", async () => {
    await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Persisted" },
    });
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].text).toBe("Persisted");
  });
});

describe("PATCH /api/todos/:id", () => {
  it("marks a todo as completed", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Complete me" },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: "PATCH",
      url: `/api/todos/${id}`,
      payload: { completed: true },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().completed).toBe(true);
    expect(res.json().id).toBe(id);
  });

  it("toggles a todo back to active", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Toggle me" },
    });
    const { id } = createRes.json();

    await app.inject({
      method: "PATCH",
      url: `/api/todos/${id}`,
      payload: { completed: true },
    });
    const res = await app.inject({
      method: "PATCH",
      url: `/api/todos/${id}`,
      payload: { completed: false },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().completed).toBe(false);
  });

  it("returns 404 for non-existent todo", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-0000-0000-000000000000",
      payload: { completed: true },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toHaveProperty("statusCode", 404);
    expect(res.json()).toHaveProperty("error");
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/not-a-uuid",
      payload: { completed: true },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for missing completed field", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Test" },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: "PATCH",
      url: `/api/todos/${id}`,
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("deletes a todo and returns 204", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Delete me" },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/todos/${id}`,
    });
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
  });

  it("todo is gone after deletion", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Gone soon" },
    });
    const { id } = createRes.json();

    await app.inject({ method: "DELETE", url: `/api/todos/${id}` });

    const listRes = await app.inject({ method: "GET", url: "/api/todos" });
    expect(listRes.json()).toHaveLength(0);
  });

  it("returns 404 for non-existent todo", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/00000000-0000-0000-0000-000000000000",
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toHaveProperty("statusCode", 404);
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});
