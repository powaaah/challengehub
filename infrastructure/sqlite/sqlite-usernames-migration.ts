import type { DatabaseSync } from "node:sqlite";
import {
  getUsernameKey,
  normalizeUsername,
  SYSTEM_ACCOUNT_NAME_KEY
} from "../../domain/accounts/username.ts";

export function ensureUniqueUsernames(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");

  try {
    const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const hasNameKey = columns.some((column) => column.name === "name_key");
    if (!hasNameKey) {
      db.exec("ALTER TABLE users ADD COLUMN name_key TEXT");
    }

    db.exec("DROP INDEX IF EXISTS users_name_unique_idx");
    const users = db.prepare("SELECT id, name FROM users ORDER BY created_at, id").all() as Array<{
      id: string;
      name: string;
    }>;
    const reservedNames = new Set<string>();
    const updateName = db.prepare("UPDATE users SET name = ?, name_key = ? WHERE id = ?");

    for (const user of users) {
      const normalized = normalizeUsername(user.name) || `user-${user.id}`;
      let uniqueName = normalized;
      let suffix = 1;
      while (user.id !== "system" && reservedNames.has(getUsernameKey(uniqueName))) {
        uniqueName = `${normalized}-${user.id}${suffix === 1 ? "" : `-${suffix}`}`;
        suffix += 1;
      }
      const nameKey = user.id === "system" ? SYSTEM_ACCOUNT_NAME_KEY : getUsernameKey(uniqueName);
      reservedNames.add(nameKey);
      updateName.run(uniqueName, nameKey, user.id);
    }

    db.exec("CREATE UNIQUE INDEX users_name_unique_idx ON users (name_key)");
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS users_name_key_not_null_insert
      BEFORE INSERT ON users
      WHEN NEW.name_key IS NULL
      BEGIN
        SELECT RAISE(ABORT, 'users.name_key must not be null');
      END;
      CREATE TRIGGER IF NOT EXISTS users_name_key_not_null_update
      BEFORE UPDATE OF name_key ON users
      WHEN NEW.name_key IS NULL
      BEGIN
        SELECT RAISE(ABORT, 'users.name_key must not be null');
      END;
    `);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
