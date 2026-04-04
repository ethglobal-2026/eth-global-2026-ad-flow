import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

/** Same rule as publishers: in-memory store in local dev when POSTGRES_URL is unset. */
export function useInMemoryAdvertisers(): boolean {
  loadNextAppEnvLocalFallback();
  if (process.env.POSTGRES_URL?.trim()) {
    return false;
  }
  return process.env.NODE_ENV === "development";
}
