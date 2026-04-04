import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

console.log(`Backend running on http://localhost:${port}`);

const server = serve({ fetch: app.fetch, port });

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
