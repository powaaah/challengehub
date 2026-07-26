import type { DatabaseSync } from "node:sqlite";

export function ensureUniqueUsernames(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");

  try {
    db.exec(`
      UPDATE users SET name = trim(name);
      UPDATE users SET name = 'user-' || id WHERE name = '';

      WITH ranked_names AS (
        SELECT
          id,
          row_number() OVER (
            PARTITION BY lower(name)
            ORDER BY created_at, id
          ) AS duplicate_number
        FROM users
      )
      UPDATE users
      SET name = name || '-' || id
      WHERE id IN (
        SELECT id FROM ranked_names WHERE duplicate_number > 1
      );

      CREATE UNIQUE INDEX IF NOT EXISTS users_name_unique_idx
        ON users (name COLLATE NOCASE);
    `);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
