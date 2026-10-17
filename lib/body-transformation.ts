import { getDb } from "./db";
import {
  bodyScore,
  BODY_SLUG,
  type BodyState,
} from "../domain/challenges/navy";
import { getJourneyPeriod } from "../domain/challenges/journey-period";

export function bodyToday() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function bodyWindow(startedAt: string) {
  const start = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(startedAt));
  return {
    start,
    end: getJourneyPeriod(BODY_SLUG, startedAt, bodyToday()).endDate!,
    today: bodyToday(),
  };
}
export function getBodyRanking() {
  const rows = getDb()
    .prepare(
      `SELECT p.id,p.started_at AS startedAt,u.name,b.state_json AS state
    FROM body_transformation b JOIN participations p ON p.id=b.participation_id JOIN users u ON u.id=p.user_id
    JOIN account_privacy_preferences privacy ON privacy.user_id=u.id
    JOIN challenges c ON c.id=p.challenge_id
    WHERE privacy.ranking_visible=1 AND p.status IN ('active','completed') AND c.slug=?`,
    )
    .all(BODY_SLUG) as unknown as {
    id: string;
    startedAt: string;
    name: string;
    state: string;
  }[];
  return rows
    .flatMap((row) => {
      const w = bodyWindow(row.startedAt);
      const score = bodyScore(
        JSON.parse(row.state) as BodyState,
        w.start,
        w.end,
        w.today,
      );
      return score
        ? [
            {
              id: row.id,
              name: row.name,
              points: score.points,
              final: score.final,
            },
          ]
        : [];
    })
    .sort((a, b) => b.points - a.points || a.id.localeCompare(b.id));
}
