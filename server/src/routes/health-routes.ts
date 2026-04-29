import { FastifyInstance } from "fastify";
import pool from "../config/database.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/health", async (_request, reply) => {
    try {
      await pool.query("SELECT 1");
      return { status: "ok" };
    } catch {
      return reply.status(503).send({ status: "error" });
    }
  });
}
