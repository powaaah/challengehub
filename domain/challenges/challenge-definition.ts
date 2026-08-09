export const CHALLENGE_TYPES = [
  "daily_boolean",
  "cumulative_metric",
  "one_time_result"
] as const;

export const METRIC_UNITS = [
  "completion",
  "repetitions",
  "steps",
  "kilograms",
  "kilocalories",
  "seconds",
  "minutes",
  "kilometers"
] as const;

export type ChallengeType = (typeof CHALLENGE_TYPES)[number];
export type MetricUnit = (typeof METRIC_UNITS)[number];
export type MeasurementDirection = "at_least" | "at_most";

export type DailyBooleanChallengeDefinition = {
  type: "daily_boolean";
  unit: "completion";
  targetValue: 1;
  frequency: "daily";
  direction: "at_least";
  completionCriterion: "daily_check_in";
};

export type CumulativeMetricChallengeDefinition = {
  type: "cumulative_metric";
  unit: Exclude<MetricUnit, "completion">;
  targetValue: number;
  frequency: "challenge_period";
  direction: "at_least";
  completionCriterion: "cumulative_target";
};

export type OneTimeResultChallengeDefinition = {
  type: "one_time_result";
  unit: Exclude<MetricUnit, "completion">;
  targetValue: number;
  frequency: "once";
  direction: MeasurementDirection;
  completionCriterion: "single_result";
};

export type ChallengeDefinition =
  | DailyBooleanChallengeDefinition
  | CumulativeMetricChallengeDefinition
  | OneTimeResultChallengeDefinition;

export const DAILY_BOOLEAN_DEFINITION: DailyBooleanChallengeDefinition = {
  type: "daily_boolean",
  unit: "completion",
  targetValue: 1,
  frequency: "daily",
  direction: "at_least",
  completionCriterion: "daily_check_in"
};

export const CURATED_CHALLENGE_DEFINITIONS: Readonly<Record<string, ChallengeDefinition>> = {
  "100-liegestuetze-am-stueck": metricResult("repetitions", 100, "at_least"),
  "1000-liegestuetze-challenge": cumulativeMetric("repetitions", 1000),
  "marathon-unter-3-stunden": metricResult("seconds", 10_800, "at_most"),
  "500-kg-kreuzheben": metricResult("kilograms", 500, "at_least"),
  "10000-kalorien-challenge": metricResult("kilocalories", 10_000, "at_least"),
  "10min-am-stueck-planken-challenge": metricResult("seconds", 600, "at_least"),
  "5-km-in-weniger-als-20-minuten": metricResult("seconds", 1_200, "at_most")
};

export function getCuratedChallengeDefinition(slug: string): ChallengeDefinition {
  return CURATED_CHALLENGE_DEFINITIONS[slug] ?? DAILY_BOOLEAN_DEFINITION;
}

export function createChallengeDefinition(input: {
  type: unknown;
  unit?: unknown;
  targetValue?: unknown;
  direction?: unknown;
}): ChallengeDefinition | null {
  if (input.type === "daily_boolean") {
    return DAILY_BOOLEAN_DEFINITION;
  }

  if (!isMetricUnit(input.unit) || !isPositiveFiniteNumber(input.targetValue)) {
    return null;
  }

  if (input.type === "cumulative_metric" && input.direction === "at_least") {
    return cumulativeMetric(input.unit, input.targetValue);
  }

  if (
    input.type === "one_time_result" &&
    (input.direction === "at_least" || input.direction === "at_most")
  ) {
    return metricResult(input.unit, input.targetValue, input.direction);
  }

  return null;
}

export function parseChallengeDefinition(value: unknown): ChallengeDefinition | null {
  if (!isRecord(value) || !isPositiveFiniteNumber(value.targetValue)) {
    return null;
  }

  if (
    value.type === "daily_boolean" &&
    value.unit === "completion" &&
    value.targetValue === 1 &&
    value.frequency === "daily" &&
    value.direction === "at_least" &&
    value.completionCriterion === "daily_check_in"
  ) {
    return DAILY_BOOLEAN_DEFINITION;
  }

  if (!isMetricUnit(value.unit)) {
    return null;
  }

  if (
    value.type === "cumulative_metric" &&
    value.frequency === "challenge_period" &&
    value.direction === "at_least" &&
    value.completionCriterion === "cumulative_target"
  ) {
    return cumulativeMetric(value.unit, value.targetValue);
  }

  if (
    value.type === "one_time_result" &&
    value.frequency === "once" &&
    (value.direction === "at_least" || value.direction === "at_most") &&
    value.completionCriterion === "single_result"
  ) {
    return metricResult(value.unit, value.targetValue, value.direction);
  }

  return null;
}

function cumulativeMetric(
  unit: Exclude<MetricUnit, "completion">,
  targetValue: number
): CumulativeMetricChallengeDefinition {
  return {
    type: "cumulative_metric",
    unit,
    targetValue,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  };
}

function metricResult(
  unit: Exclude<MetricUnit, "completion">,
  targetValue: number,
  direction: MeasurementDirection
): OneTimeResultChallengeDefinition {
  return {
    type: "one_time_result",
    unit,
    targetValue,
    frequency: "once",
    direction,
    completionCriterion: "single_result"
  };
}

function isMetricUnit(value: unknown): value is Exclude<MetricUnit, "completion"> {
  return typeof value === "string" && value !== "completion" && METRIC_UNITS.includes(value as MetricUnit);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
