import path from "node:path";
import { getDb } from "./db/index.js";
import { createServer, startServer } from "./server.js";

function parseArgs(): { dbPath: string } {
  const args = process.argv.slice(2);
  let dbPath = path.join(process.cwd(), "data", "bible.db");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--db-path" && args[i + 1]) {
      dbPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { dbPath };
}

async function main() {
  const { dbPath } = parseArgs();
  console.error(`[init] DB path: ${dbPath}`);

  const db = getDb(dbPath);
  console.error("[init] Base de données initialisée");

  const server = createServer(db, dbPath);
  await startServer(server);
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
