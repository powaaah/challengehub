export const BODY_SLUG = "100-tage-body-transformation";
export const NAVY_VERSION = "navy-circumference-v1";
export type NavyProfile = { variant: "male" | "female"; height: number };
export type BodyMeasurement = {
  date: string;
  weight: number;
  waist: number;
  neck: number | null;
  hip: number | null;
};
export type BodyHabit = {
  id: string;
  name: string;
  unit: string;
  target: number;
  period: "day" | "week";
  entries: Record<string, number>;
};
export type BodyState = {
  version: typeof NAVY_VERSION;
  profile: NavyProfile | null;
  measurements: BodyMeasurement[];
  habits: BodyHabit[];
};
export const emptyBodyState = (): BodyState => ({
  version: NAVY_VERSION,
  profile: null,
  measurements: [],
  habits: [],
});

// Hodgdon/Beckett circumference equations: coefficients expect inches, UI uses cm.
export function navyBodyFat(
  profile: NavyProfile,
  measurement: Pick<BodyMeasurement, "waist" | "neck" | "hip">,
): number | null {
  const { waist, neck, hip } = measurement;
  if (
    !Number.isFinite(profile.height) ||
    profile.height <= 0 ||
    neck === null ||
    !Number.isFinite(neck) ||
    !Number.isFinite(waist)
  )
    return null;
  const circumference =
    profile.variant === "male"
      ? waist - neck
      : hip === null
        ? NaN
        : waist + hip - neck;
  if (!Number.isFinite(circumference) || circumference <= 0) return null;
  const result =
    profile.variant === "male"
      ? 86.01 * Math.log10(circumference / 2.54) -
        70.041 * Math.log10(profile.height / 2.54) +
        36.76
      : 163.205 * Math.log10(circumference / 2.54) -
        97.684 * Math.log10(profile.height / 2.54) -
        78.387;
  return Number.isFinite(result) && result > 0 && result < 75 ? result : null;
}

export function bodyScore(
  state: BodyState,
  start: string,
  end: string,
  today: string,
) {
  if (!state.profile) return null;
  const points = state.measurements
    .filter((m) => m.date >= start && m.date <= end && m.date <= today)
    .map((m) => ({ date: m.date, kfa: navyBodyFat(state.profile!, m) }))
    .filter((m): m is { date: string; kfa: number } => m.kfa !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = points.find((m) => m.date === start);
  const last = points.at(-1);
  if (!first || !last || first.date === last.date) return null;
  return {
    start: first.kfa,
    current: last.kfa,
    points: Math.round((first.kfa - last.kfa) * 10) / 10,
    final: last.date === end && today >= end,
    date: last.date,
  };
}

export function validBodyDate(
  date: string,
  start: string,
  end: string,
  today: string,
) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date &&
    date >= start &&
    date <= end &&
    date <= today
  );
}

export function habitValue(habit: BodyHabit, date: string) {
  if (habit.period === "day") return habit.entries[date] ?? null;
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  const start = day.toISOString().slice(0, 10);
  const entries = Object.entries(habit.entries).filter(
    ([d]) => d >= start && d <= date,
  );
  return entries.length ? entries.reduce((sum, [, v]) => sum + v, 0) : null;
}
