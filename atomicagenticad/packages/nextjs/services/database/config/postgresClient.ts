import * as schema from "./schema";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";
import { neonConfig, Pool as NeonPool, neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

type NodePgDatabaseClient = ReturnType<typeof drizzle<typeof schema>>;
type NeonServerlessDatabaseClient = ReturnType<typeof drizzleNeon<typeof schema>>;
type NeonHttpDatabaseClient = ReturnType<typeof drizzleNeonHttp<typeof schema>>;
type DatabaseClient = NodePgDatabaseClient | NeonServerlessDatabaseClient | NeonHttpDatabaseClient;

let dbInstance: DatabaseClient | null = null;
let poolInstance: Pool | NeonPool | null = null;

function getConnectionString() {
  loadNextAppEnvLocalFallback();
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured");
  }

  return connectionString;
}

export function getDb(): DatabaseClient {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = getConnectionString();
  const isNextRuntime = Boolean(process.env.NEXT_RUNTIME);

  if (connectionString.includes("neondb")) {
    if (isNextRuntime) {
      poolInstance = new NeonPool({ connectionString });
      dbInstance = drizzleNeon(poolInstance as NeonPool, { schema, casing: "snake_case" });
    } else {
      const sql = neon(connectionString);
      dbInstance = drizzleNeonHttp({ client: sql, schema, casing: "snake_case" });
    }
  } else {
    poolInstance = new Pool({ connectionString });
    dbInstance = drizzle(poolInstance, { schema, casing: "snake_case" });
  }

  return dbInstance;
}

export async function closeDb() {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }

  dbInstance = null;
}

const dbProxy = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === "close") {
        return closeDb;
      }

      const db = getDb();
      return db[prop as keyof typeof db];
    },
  },
);

export const db = dbProxy as ReturnType<typeof getDb> & { close: typeof closeDb };
