import type { ChallengeDefinition, MetricUnit } from "./challenge-definition.ts";

export type ChallengeCheckIn = {
  date: string;
  value: number | null;
};

export type ChallengeOutcome = {
  value: number;
  completionRate: number;
  completed: boolean;
  label: string;
};

export function calculateChallengeOutcome(input: {
  definition: ChallengeDefinition;
  checkIns: ChallengeCheckIn[];
}): ChallengeOutcome {
  if (input.definition.type === "daily_boolean") {
    const fulfilledDays = new Set(input.checkIns.map((checkIn) => checkIn.date)).size;
    return {
      value: fulfilledDays,
      completionRate: fulfilledDays > 0 ? 100 : 0,
      completed: false,
      label: `${fulfilledDays} ${fulfilledDays === 1 ? "Tag" : "Tage"}`
    };
  }

  const values = input.checkIns
    .map((checkIn) => checkIn.value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  const value = input.definition.type === "cumulative_metric"
    ? values.reduce((total, current) => total + current, 0)
    : selectBestResult(values, input.definition.direction);
  const completed = input.definition.direction === "at_least"
    ? value >= input.definition.targetValue
    : value > 0 && value <= input.definition.targetValue;
  const completionRate = calculateMetricCompletionRate(
    value,
    input.definition.targetValue,
    input.definition.direction
  );

  return {
    value,
    completionRate,
    completed,
    label: input.definition.type === "cumulative_metric"
      ? `${formatMetricNumber(value, input.definition.unit)} von ${formatMetricValue(input.definition.targetValue, input.definition.unit)}`
      : value > 0
        ? formatMetricValue(value, input.definition.unit)
        : "Noch kein Ergebnis"
  };
}

export function formatMetricValue(value: number, unit: Exclude<MetricUnit, "completion">) {
  if (unit === "seconds") {
    const rounded = Math.round(value);
    const minutes = Math.floor(rounded / 60);
    const seconds = rounded % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")} Minuten`;
  }

  const labels: Record<Exclude<MetricUnit, "completion" | "seconds">, string> = {
    repetitions: "Wiederholungen",
    steps: "Schritte",
    kilograms: "kg",
    kilocalories: "kcal",
    minutes: "Minuten",
    kilometers: "km"
  };
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value)} ${labels[unit]}`;
}

function formatMetricNumber(value: number, unit: Exclude<MetricUnit, "completion">) {
  if (unit === "seconds") {
    const rounded = Math.round(value);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
  }
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value);
}

function selectBestResult(values: number[], direction: "at_least" | "at_most") {
  if (values.length === 0) {
    return 0;
  }
  return direction === "at_least" ? Math.max(...values) : Math.min(...values);
}

function calculateMetricCompletionRate(
  value: number,
  targetValue: number,
  direction: "at_least" | "at_most"
) {
  if (value <= 0) {
    return 0;
  }
  const ratio = direction === "at_least" ? value / targetValue : targetValue / value;
  return Math.min(100, Math.round(ratio * 100));
}
