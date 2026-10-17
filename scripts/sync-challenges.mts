import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { loadChallengeFiles } from "../lib/challenge-markdown.ts";
import {
  planChallengeContent,
  syncChallengeContent,
} from "../infrastructure/sqlite/sqlite-challenge-content.ts";
import { getDb } from "../lib/db.ts";

const catalog = loadChallengeFiles(path.resolve("content/challenges"));
const apply = process.argv.includes("--apply");
const dbPath =
  process.env.CHALLENGEHUB_DB_PATH ?? path.resolve(".data/challengehub.sqlite");
const db = apply
  ? getDb({ syncContent: false })
  : fs.existsSync(dbPath)
    ? new DatabaseSync(dbPath, { readOnly: true })
    : new DatabaseSync(":memory:");
try {
  const plan = apply
    ? syncChallengeContent(db, catalog)
    : planChallengeContent(db, catalog);
  console.log(
    JSON.stringify({ mode: apply ? "applied" : "preview", ...plan }, null, 2),
  );
  if (plan.blocked.length) process.exitCode = 1;
} finally {
  db.close();
}
