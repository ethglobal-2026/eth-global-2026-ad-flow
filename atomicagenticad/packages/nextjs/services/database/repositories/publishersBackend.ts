import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

/**
 * When POSTGRES_URL is missing in development, publisher APIs use an in-memory store
 * so onboarding can be completed without Neon/local Postgres. Production builds require POSTGRES_URL.
 */
export function useInMemoryPublishers(): boolean {
  loadNextAppEnvLocalFallback();
  if (process.env.POSTGRES_URL?.trim()) {
    return false;
  }
  return process.env.NODE_ENV === "development";
}
