import { FastifyInstance } from "fastify";
import * as todoService from "../services/todo-service.js";

const uuidPattern =
  "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";

const todoResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    text: { type: "string" },
    completed: { type: "boolean" },
    createdAt: { type: "string" },
  },
} as const;

const createTodoSchema = {
  body: {
    type: "object",
    required: ["text"],
    properties: {
      text: { type: "string", minLength: 1, maxLength: 255 },
    },
    additionalProperties: false,
  },
  response: {
    201: todoResponseSchema,
  },
} as const;

const updateTodoSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", pattern: uuidPattern },
    },
  },
  body: {
    type: "object",
    required: ["completed"],
    properties: {
      completed: { type: "boolean" },
    },
    additionalProperties: false,
  },
  response: {
    200: todoResponseSchema,
  },
} as const;

const deleteTodoSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", pattern: uuidPattern },
    },
  },
} as const;

const getTodosSchema = {
  response: {
    200: {
      type: "array",
      items: todoResponseSchema,
    },
  },
} as const;

export async function todoRoutes(app: FastifyInstance) {
  app.get("/api/todos", { schema: getTodosSchema }, async () => {
    return todoService.listTodos();
  });

  app.post(
    "/api/todos",
    { schema: createTodoSchema },
    async (request, reply) => {
      const { text } = request.body as { text: string };
      const todo = await todoService.createTodo(text);
      return reply.status(201).send(todo);
    }
  );

  app.patch(
    "/api/todos/:id",
    { schema: updateTodoSchema },
    async (request) => {
      const { id } = request.params as { id: string };
      const { completed } = request.body as { completed: boolean };
      return todoService.updateTodo(id, completed);
    }
  );

  app.delete(
    "/api/todos/:id",
    { schema: deleteTodoSchema },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await todoService.deleteTodo(id);
      return reply.status(204).send();
    }
  );

  // Error handler for this plugin scope
  app.setErrorHandler(async (error, _request, reply) => {
    const statusCode = (error as any).statusCode || 500;
    const message = error instanceof Error ? error.message : String(error);

    if (statusCode === 400) {
      return reply.status(400).send({
        error: message || "Bad Request",
        statusCode: 400,
      });
    }

    if (statusCode === 404) {
      return reply.status(404).send({
        error: message || "Not Found",
        statusCode: 404,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: "Internal Server Error",
      statusCode: 500,
    });
  });
}
