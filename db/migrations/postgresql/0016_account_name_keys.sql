BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS users_name_unique_idx;

ALTER TABLE users
  ADD COLUMN name_key TEXT;

CREATE TEMPORARY TABLE account_name_key_reserved (
  name_key TEXT PRIMARY KEY
) ON COMMIT DROP;

DO $$
DECLARE
  user_row RECORD;
  base_name TEXT;
  candidate TEXT;
  candidate_key TEXT;
  suffix INTEGER;
BEGIN
  FOR user_row IN SELECT id, name FROM users ORDER BY created_at, id LOOP
    base_name := normalize(btrim(user_row.name), NFKC);
    IF base_name = '' THEN
      base_name := 'user-' || user_row.id;
    END IF;
    candidate := base_name;
    suffix := 1;
    candidate_key := lower(replace(replace(
      upper(normalize(candidate, NFKC)), 'ẞ', 'SS'
    ), 'ß', 'SS'));

    WHILE EXISTS (
      SELECT 1 FROM account_name_key_reserved WHERE name_key = candidate_key
    ) LOOP
      candidate := base_name || '-' || user_row.id
        || CASE WHEN suffix = 1 THEN '' ELSE '-' || suffix::TEXT END;
      suffix := suffix + 1;
      candidate_key := lower(replace(replace(
        upper(normalize(candidate, NFKC)), 'ẞ', 'SS'
      ), 'ß', 'SS'));
    END LOOP;

    UPDATE users
    SET name = candidate, name_key = candidate_key
    WHERE id = user_row.id;
    INSERT INTO account_name_key_reserved (name_key) VALUES (candidate_key);
  END LOOP;
END $$;

ALTER TABLE users
  ALTER COLUMN name_key SET NOT NULL;

CREATE UNIQUE INDEX users_name_unique_idx ON users (name_key);

INSERT INTO schema_migrations (version) VALUES ('0016_account_name_keys');

COMMIT;
