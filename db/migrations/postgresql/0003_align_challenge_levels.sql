BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_level_check;

UPDATE challenges
SET level = CASE level
  WHEN 'Fortgeschritten' THEN 'Advanced'
  WHEN 'Experte' THEN 'Premium'
  ELSE level
END
WHERE level IN ('Fortgeschritten', 'Experte');

ALTER TABLE challenges
  ADD CONSTRAINT challenges_level_check
  CHECK (level IN ('User', 'Beginner', 'Advanced', 'Premium'));

INSERT INTO schema_migrations (version) VALUES ('0003_align_challenge_levels');

COMMIT;
