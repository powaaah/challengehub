import type { DatabaseSync } from "node:sqlite";

export function ensureUniqueUsernames(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");

  try {
    const users = db.prepare("SELECT id, name FROM users ORDER BY created_at, id").all() as Array<{
      id: string;
      name: string;
    }>;
    const reservedNames = new Set<string>();
    const updateName = db.prepare("UPDATE users SET name = ? WHERE id = ?");

    for (const user of users) {
      const normalized = user.name.trim() || `user-${user.id}`;
      let uniqueName = normalized;
      let suffix = 1;
      while (reservedNames.has(uniqueName.toLocaleLowerCase("de-DE"))) {
        uniqueName = `${normalized}-${user.id}${suffix === 1 ? "" : `-${suffix}`}`;
        suffix += 1;
      }
      reservedNames.add(uniqueName.toLocaleLowerCase("de-DE"));
      if (uniqueName !== user.name) {
        updateName.run(uniqueName, user.id);
      }
    }

    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS users_name_unique_idx
      ON users (name COLLATE NOCASE)`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
