BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE challenges
  ADD COLUMN challenge_type TEXT NOT NULL DEFAULT 'daily_boolean',
  ADD COLUMN metric_unit TEXT NOT NULL DEFAULT 'completion',
  ADD COLUMN target_value DOUBLE PRECISION NOT NULL DEFAULT 1,
  ADD COLUMN frequency TEXT NOT NULL DEFAULT 'daily',
  ADD COLUMN measurement_direction TEXT NOT NULL DEFAULT 'at_least',
  ADD COLUMN completion_criterion TEXT NOT NULL DEFAULT 'daily_check_in';

UPDATE challenges
SET
  challenge_type = CASE
    WHEN slug = '1000-liegestuetze-challenge' THEN 'cumulative_metric'
    WHEN slug IN (
      '100-liegestuetze-am-stueck',
      'marathon-unter-3-stunden',
      '500-kg-kreuzheben',
      '10000-kalorien-challenge',
      '10min-am-stueck-planken-challenge',
      '5-km-in-weniger-als-20-minuten'
    ) THEN 'one_time_result'
    ELSE 'daily_boolean'
  END,
  metric_unit = CASE
    WHEN slug IN ('100-liegestuetze-am-stueck', '1000-liegestuetze-challenge') THEN 'repetitions'
    WHEN slug = '500-kg-kreuzheben' THEN 'kilograms'
    WHEN slug = '10000-kalorien-challenge' THEN 'kilocalories'
    WHEN slug IN ('marathon-unter-3-stunden', '10min-am-stueck-planken-challenge', '5-km-in-weniger-als-20-minuten') THEN 'seconds'
    ELSE 'completion'
  END,
  target_value = CASE
    WHEN slug = '100-liegestuetze-am-stueck' THEN 100
    WHEN slug = '1000-liegestuetze-challenge' THEN 1000
    WHEN slug = 'marathon-unter-3-stunden' THEN 10800
    WHEN slug = '500-kg-kreuzheben' THEN 500
    WHEN slug = '10000-kalorien-challenge' THEN 10000
    WHEN slug = '10min-am-stueck-planken-challenge' THEN 600
    WHEN slug = '5-km-in-weniger-als-20-minuten' THEN 1200
    ELSE 1
  END,
  frequency = CASE
    WHEN slug = '1000-liegestuetze-challenge' THEN 'challenge_period'
    WHEN slug IN (
      '100-liegestuetze-am-stueck',
      'marathon-unter-3-stunden',
      '500-kg-kreuzheben',
      '10000-kalorien-challenge',
      '10min-am-stueck-planken-challenge',
      '5-km-in-weniger-als-20-minuten'
    ) THEN 'once'
    ELSE 'daily'
  END,
  measurement_direction = CASE
    WHEN slug IN ('marathon-unter-3-stunden', '5-km-in-weniger-als-20-minuten') THEN 'at_most'
    ELSE 'at_least'
  END,
  completion_criterion = CASE
    WHEN slug = '1000-liegestuetze-challenge' THEN 'cumulative_target'
    WHEN slug IN (
      '100-liegestuetze-am-stueck',
      'marathon-unter-3-stunden',
      '500-kg-kreuzheben',
      '10000-kalorien-challenge',
      '10min-am-stueck-planken-challenge',
      '5-km-in-weniger-als-20-minuten'
    ) THEN 'single_result'
    ELSE 'daily_check_in'
  END;

ALTER TABLE challenges
  ADD CONSTRAINT challenges_type_check
    CHECK (challenge_type IN ('daily_boolean', 'cumulative_metric', 'one_time_result')),
  ADD CONSTRAINT challenges_metric_unit_check
    CHECK (metric_unit IN ('completion', 'repetitions', 'steps', 'kilograms', 'kilocalories', 'seconds', 'minutes', 'kilometers')),
  ADD CONSTRAINT challenges_target_value_check CHECK (target_value > 0),
  ADD CONSTRAINT challenges_frequency_check CHECK (frequency IN ('daily', 'challenge_period', 'once')),
  ADD CONSTRAINT challenges_measurement_direction_check CHECK (measurement_direction IN ('at_least', 'at_most')),
  ADD CONSTRAINT challenges_completion_criterion_check
    CHECK (completion_criterion IN ('daily_check_in', 'cumulative_target', 'single_result')),
  ADD CONSTRAINT challenges_definition_consistency_check CHECK (
    (challenge_type = 'daily_boolean' AND metric_unit = 'completion' AND target_value = 1 AND frequency = 'daily' AND measurement_direction = 'at_least' AND completion_criterion = 'daily_check_in') OR
    (challenge_type = 'cumulative_metric' AND metric_unit <> 'completion' AND frequency = 'challenge_period' AND measurement_direction = 'at_least' AND completion_criterion = 'cumulative_target') OR
    (challenge_type = 'one_time_result' AND metric_unit <> 'completion' AND frequency = 'once' AND completion_criterion = 'single_result')
  );

ALTER TABLE check_ins
  ADD COLUMN value DOUBLE PRECISION,
  ADD CONSTRAINT check_ins_value_check CHECK (value IS NULL OR value > 0);

INSERT INTO schema_migrations (version) VALUES ('0010_challenge_types');

COMMIT;
