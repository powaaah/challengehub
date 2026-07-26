BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TEMPORARY TABLE username_migration_reserved (
  name TEXT PRIMARY KEY
) ON COMMIT DROP;

DO $$
DECLARE
  user_row RECORD;
  base_name TEXT;
  candidate TEXT;
  suffix INTEGER;
BEGIN
  FOR user_row IN SELECT id, name FROM users ORDER BY created_at, id LOOP
    base_name := btrim(user_row.name);
    IF base_name = '' THEN
      base_name := 'user-' || user_row.id;
    END IF;
    candidate := base_name;
    suffix := 1;

    WHILE EXISTS (
      SELECT 1 FROM username_migration_reserved WHERE lower(name) = lower(candidate)
    ) LOOP
      candidate := base_name || '-' || user_row.id
        || CASE WHEN suffix = 1 THEN '' ELSE '-' || suffix::TEXT END;
      suffix := suffix + 1;
    END LOOP;

    UPDATE users SET name = candidate WHERE id = user_row.id;
    INSERT INTO username_migration_reserved (name) VALUES (candidate);
  END LOOP;
END $$;

CREATE UNIQUE INDEX users_name_unique_idx ON users (lower(name));

INSERT INTO schema_migrations (version) VALUES ('0004_unique_usernames');

COMMIT;
