import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

console.log(`Backend running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
