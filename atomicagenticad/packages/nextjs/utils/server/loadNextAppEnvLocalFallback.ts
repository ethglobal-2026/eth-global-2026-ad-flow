import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

let attempted = false;

/**
 * When `next dev` is started from the monorepo root, Next sometimes does not load
 * `packages/nextjs/.env.local`. Load `.env.local` from cwd and from `packages/nextjs/`
 * so ANTHROPIC_API_KEY and POSTGRES_URL resolve reliably.
 */
export function loadNextAppEnvLocalFallback() {
  if (attempted) return;
  attempted = true;

  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "packages", "nextjs", ".env.local"),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      loadDotenv({ path: envPath, override: true });
    }
  }
}
