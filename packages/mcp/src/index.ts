import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./db/index.js";
import { createServer, startServer } from "./server.js";
import { startHttpServer } from "./http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface CliArgs {
  dbPath: string;
  ui: boolean;
  port: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let dbPath = path.join(process.cwd(), "data", "bible.db");
  let ui = false;
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--db-path" && args[i + 1]) {
      dbPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === "--ui") {
      ui = true;
    } else if (args[i] === "--port" && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { dbPath, ui, port };
}

async function main() {
  const { dbPath, ui, port } = parseArgs();
  console.error(`[init] DB path: ${dbPath}`);

  const db = getDb(dbPath);
  console.error("[init] Base de données initialisée");

  const mcpServer = createServer(db, dbPath);

  if (ui) {
    const uiDir = path.resolve(__dirname, "..", "public");
    startHttpServer(mcpServer, dbPath, { port, uiDir });
  } else {
    await startServer(mcpServer);
  }
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
