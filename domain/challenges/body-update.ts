import {
  navyBodyFat,
  validBodyDate,
  type BodyState,
  type NavyProfile,
} from "./navy.ts";

export function updateBody(
  state: BodyState,
  input: Record<string, unknown>,
  window: { start: string; end: string; today: string },
  newId: string,
): BodyState {
  const next = structuredClone(state);
  const fail = () => {
    throw new Error(
      "Bitte prüfe deine Angaben und den Zeitraum deiner Challenge.",
    );
  };
  const number = (key: string, min: number, max: number) => {
    const raw = input[key];
    const value =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim()
          ? Number(raw.replace(",", "."))
          : NaN;
    if (!Number.isFinite(value) || value < min || value > max) return fail();
    return value;
  };
  const date = String(input.date ?? "");
  if (input.action === "measurement") {
    if (!validBodyDate(date, window.start, window.end, window.today)) fail();
    const variant = input.variant;
    if (variant !== "male" && variant !== "female") fail();
    const profile = {
      variant,
      height: number("height", 100, 250),
    } as NavyProfile;
    if (
      next.profile &&
      (next.profile.variant !== profile.variant ||
        next.profile.height !== profile.height)
    )
      throw new Error(
        "Formelvariante und Körpergröße bleiben für diese Teilnahme gleich.",
      );
    const measurement = {
      date,
      weight: number("weight", 25, 400),
      waist: number("waist", 35, 250),
      neck:
        input.neck === "" || input.neck === null || input.neck === undefined
          ? null
          : number("neck", 15, 80),
      hip:
        input.hip === "" || input.hip === null || input.hip === undefined
          ? null
          : number("hip", 40, 250),
    };
    const complete =
      measurement.neck !== null &&
      (variant === "male" || measurement.hip !== null);
    if (complete && navyBodyFat(profile, measurement) === null)
      throw new Error(
        "Diese Umfänge ergeben keinen plausiblen Navy-KFA. Bitte prüfe die Messstellen.",
      );
    next.profile = profile;
    next.measurements = [
      ...next.measurements.filter((m) => m.date !== date),
      measurement,
    ].sort((a, b) => a.date.localeCompare(b.date));
  } else if (input.action === "habit") {
    if (next.habits.length >= 12)
      throw new Error("Du kannst bis zu zwölf Teil-Challenges anlegen.");
    const name = String(input.name ?? "").trim(),
      unit = String(input.unit ?? "").trim();
    if (
      !name ||
      name.length > 80 ||
      !unit ||
      unit.length > 20 ||
      !["day", "week"].includes(String(input.period))
    )
      fail();
    next.habits.push({
      id: newId,
      name,
      unit,
      target: number("target", 0.1, 100000),
      period: input.period as "day" | "week",
      entries: {},
    });
  } else if (input.action === "habit-entry") {
    if (!validBodyDate(date, window.start, window.end, window.today)) fail();
    const habit = next.habits.find((h) => h.id === input.habitId);
    if (!habit) fail();
    habit!.entries[date] = number("value", 0, 100000);
  } else if (input.action === "delete-habit") {
    next.habits = next.habits.filter((h) => h.id !== input.habitId);
  } else fail();
  return next;
}
