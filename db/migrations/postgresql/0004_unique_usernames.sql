BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

UPDATE users
SET name = btrim(name);

UPDATE users
SET name = 'user-' || id
WHERE name = '';

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
SET name = users.name || '-' || users.id
FROM ranked_names
WHERE users.id = ranked_names.id
  AND ranked_names.duplicate_number > 1;

CREATE UNIQUE INDEX users_name_unique_idx ON users (lower(name));

INSERT INTO schema_migrations (version) VALUES ('0004_unique_usernames');

COMMIT;
