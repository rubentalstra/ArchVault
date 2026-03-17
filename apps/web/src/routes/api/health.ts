import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "#/lib/database";

const startedAt = Date.now();

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.execute(sql`SELECT 1`);
          return Response.json(
            {
              status: "healthy",
              database: "connected",
              uptime: Math.floor((Date.now() - startedAt) / 1000),
              version: process.env.APP_VERSION ?? "dev",
            },
            { status: 200 },
          );
        } catch {
          return Response.json(
            {
              status: "unhealthy",
              database: "disconnected",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});
