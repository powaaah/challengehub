import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { parseChallengeDefinition, calculateChallengeOutcome } from "../domain/challenges/competition-definition.ts";
import { getChallengeBySlug } from "../data/challenges.ts";
import type { DuelSource, DuelView } from "../domain/guest-duels/types.ts";

export class DuelError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const fail = (status: number, message: string): never => {
  throw new DuelError(status, message);
};
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("base64url");
const validToken = (value: unknown): value is string =>
  typeof value === "string" && /^[\w-]{43}$/.test(value);
const nameOf = (value: unknown) => {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    [...value.trim()].length > 30
  )
    return fail(400, "Bitte gib einen Namen mit 1 bis 30 Zeichen ein.");
  return value.trim();
};
type Battle = {
  id: string;
  owner_id: string;
  source: string;
  duration_days: number;
  status: "lobby" | "active" | "completed";
  created_at: number;
  started_at: number | null;
  ends_at: number | null;
  invite_hash: string | null;
  invite_expires: number | null;
};
type Member = {
  id: string;
  guest_id: string;
  name: string;
  finished_at: number | null;
};

export class GuestDuels {
  readonly db: DatabaseSync;
  readonly now: () => number;
  constructor(db: DatabaseSync, now: () => number = Date.now) {
    this.db = db;
    this.now = now;
    db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS guest_sessions(id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS guest_duels(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES guest_sessions(id), source TEXT NOT NULL, duration_days INTEGER NOT NULL CHECK(duration_days BETWEEN 1 AND 7), status TEXT NOT NULL CHECK(status IN ('lobby','active','completed')), created_at INTEGER NOT NULL, started_at INTEGER, ends_at INTEGER, invite_hash TEXT UNIQUE, invite_expires INTEGER, request_id TEXT NOT NULL, request_hash TEXT NOT NULL, UNIQUE(owner_id,request_id));
      CREATE TABLE IF NOT EXISTS guest_duel_members(id TEXT PRIMARY KEY, battle_id TEXT NOT NULL REFERENCES guest_duels(id) ON DELETE CASCADE, guest_id TEXT NOT NULL REFERENCES guest_sessions(id), name TEXT NOT NULL, slot INTEGER NOT NULL CHECK(slot IN (1,2)), finished_at INTEGER, UNIQUE(battle_id,guest_id), UNIQUE(battle_id,slot));
      CREATE TABLE IF NOT EXISTS guest_duel_entries(id TEXT NOT NULL, member_id TEXT NOT NULL REFERENCES guest_duel_members(id) ON DELETE CASCADE, at INTEGER NOT NULL, day TEXT NOT NULL, value REAL, PRIMARY KEY(member_id,id));
      CREATE TABLE IF NOT EXISTS guest_duel_limits(key TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL);`);
  }
  transaction<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  rate(key: string, limit: number) {
    const window = Math.floor(this.now() / 60000);
    this.db
      .prepare("DELETE FROM guest_duel_limits WHERE window < ?")
      .run(window - 2);
    const value = this.db
      .prepare(
        "INSERT INTO guest_duel_limits(key,window,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window=excluded.window,count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END RETURNING count",
      )
      .get(hash(key), window) as { count: number };
    if (value.count > limit)
      fail(429, "Zu viele Anfragen. Bitte warte eine Minute.");
  }
  session() {
    // Remove expired sessions only after their duels have passed retention.
    const cutoff = this.now() - 30 * 86400000;
    this.db.prepare("DELETE FROM guest_duels WHERE created_at < ?").run(cutoff);
    this.db
      .prepare(
        "DELETE FROM guest_sessions WHERE expires_at < ? AND id NOT IN (SELECT owner_id FROM guest_duels) AND id NOT IN (SELECT guest_id FROM guest_duel_members)",
      )
      .run(this.now());
    const secret = token();
    this.db
      .prepare("INSERT INTO guest_sessions VALUES(?,?,?)")
      .run(randomUUID(), hash(secret), this.now() + 30 * 86400000);
    return { token: secret };
  }
  authenticate(secret: string | null) {
    if (!validToken(secret))
      return fail(401, "Dein Gastzugang fehlt oder ist abgelaufen.");
    const session = this.db
      .prepare(
        "SELECT id FROM guest_sessions WHERE token_hash=? AND expires_at>?",
      )
      .get(hash(secret), this.now()) as { id: string } | undefined;
    return (
      session?.id ?? fail(401, "Dein Gastzugang fehlt oder ist abgelaufen.")
    );
  }
  source(raw: unknown): DuelSource {
    if (!raw || typeof raw !== "object")
      return fail(400, "Die Challenge fehlt.");
    let value = raw as DuelSource;
    if (typeof value.sourceKey !== "string" || value.sourceKey.length > 150)
      return fail(400, "Ungültige Challenge.");
    if (value.sourceKey.startsWith("public:")) {
      const slug = value.sourceKey.slice(7),
        curated = getChallengeBySlug(slug);
      if (!curated || slug === "100-tage-body-transformation")
        return fail(
          400,
          "Diese Challenge wird für Duelle noch nicht unterstützt.",
        );
      value = {
        sourceKey: value.sourceKey,
        title: curated.title,
        goal: curated.goal,
        rules: curated.rules,
        definition: curated.definition,
        durationDays: null,
      };
    }
    const definition = parseChallengeDefinition(value.definition);
    if (
      !definition ||
      (definition.targetValue !== null && definition.targetValue > 1e12) ||
      typeof value.title !== "string" ||
      !value.title.trim() ||
      value.title.length > 100 ||
      typeof value.goal !== "string" ||
      !value.goal.trim() ||
      value.goal.length > 200 ||
      !Array.isArray(value.rules) ||
      value.rules.length < 1 ||
      value.rules.length > 20 ||
      value.rules.some(
        (rule) => typeof rule !== "string" || !rule.trim() || rule.length > 300,
      )
    )
      return fail(400, "Prüfe Titel, Ziel, Regeln und Wertung.");
    return {
      sourceKey: value.sourceKey,
      title: value.title.trim(),
      goal: value.goal.trim(),
      rules: value.rules.map((rule) => rule.trim()),
      definition,
      durationDays: null,
    };
  }
  create(
    guest: string,
    input: {
      source: unknown;
      name: unknown;
      days: unknown;
      requestId: unknown;
    },
  ) {
    const source = this.source(input.source),
      name = nameOf(input.name),
      days = input.days;
    if (
      !Number.isInteger(days) ||
      Number(days) < 1 ||
      Number(days) > 7 ||
      typeof input.requestId !== "string" ||
      !/^[\w-]{16,80}$/.test(input.requestId)
    )
      return fail(400, "Wähle ein Duell-Zeitfenster von 1 bis 7 Tagen.");
    const requestHash = hash(JSON.stringify({ source, name, days }));
    return this.transaction(() => {
      const previous = this.db
        .prepare(
          "SELECT id,request_hash FROM guest_duels WHERE owner_id=? AND request_id=?",
        )
        .get(guest, input.requestId as string) as
        { id: string; request_hash: string } | undefined;
      if (previous) {
        if (previous.request_hash !== requestHash)
          fail(
            409,
            "Dieser Vorgang wurde bereits mit anderen Angaben gespeichert.",
          );
        return this.view(guest, previous.id);
      }
      const count = this.db
        .prepare("SELECT COUNT(*) AS n FROM guest_duels WHERE owner_id=?")
        .get(guest) as { n: number };
      if (count.n >= 25) return fail(429, "Maximal 25 Duelle pro Gastzugang.");
      const id = randomUUID();
      this.db
        .prepare(
          "INSERT INTO guest_duels(id,owner_id,source,duration_days,status,created_at,request_id,request_hash) VALUES(?,?,?,?,'lobby',?,?,?)",
        )
        .run(
          id,
          guest,
          JSON.stringify(source),
          Number(days),
          this.now(),
          input.requestId as string,
          requestHash,
        );
      this.db
        .prepare(
          "INSERT INTO guest_duel_members(id,battle_id,guest_id,name,slot) VALUES(?,?,?,?,1)",
        )
        .run(randomUUID(), id, guest, name);
      return this.view(guest, id);
    });
  }
  battle(guest: string, id: string): Battle {
    const battle = this.db
      .prepare(
        "SELECT b.* FROM guest_duels b JOIN guest_duel_members m ON m.battle_id=b.id WHERE b.id=? AND m.guest_id=? AND b.created_at>=?",
      )
      .get(id, guest, this.now() - 30 * 86400000) as Battle | undefined;
    return battle ?? fail(404, "Duell nicht verfügbar.");
  }
  status(b: Battle) {
    return b.status === "active" && this.now() >= (b.ends_at ?? 0)
      ? "completed"
      : b.status;
  }
  invite(guest: string, id: string) {
    const b = this.battle(guest, id);
    if (b.owner_id !== guest || b.status !== "lobby")
      return fail(403, "Nur der Gastgeber kann vor dem Start einladen.");
    const count = this.db
      .prepare("SELECT COUNT(*) n FROM guest_duel_members WHERE battle_id=?")
      .get(id) as { n: number };
    if (count.n !== 1) return fail(409, "Dein Gegner ist bereits beigetreten.");
    const secret = token();
    this.db
      .prepare(
        "UPDATE guest_duels SET invite_hash=?,invite_expires=? WHERE id=?",
      )
      .run(hash(secret), this.now() + 86400000, id);
    return { token: secret };
  }
  join(guest: string, secret: unknown, rawName: unknown) {
    const name = nameOf(rawName);
    if (!validToken(secret)) return fail(404, "Einladung nicht verfügbar.");
    return this.transaction(() => {
      const b = this.db
        .prepare(
          "SELECT * FROM guest_duels WHERE invite_hash=? AND invite_expires>? AND created_at>=?",
        )
        .get(hash(secret), this.now(), this.now() - 30 * 86400000) as
        Battle | undefined;
      if (!b) return fail(404, "Einladung nicht verfügbar.");
      if (b.owner_id === guest)
        return fail(
          409,
          "Du bist der Gastgeber. Öffne den Link mit dem Gastzugang deines Gegners.",
        );
      const existing = this.db
        .prepare(
          "SELECT id FROM guest_duel_members WHERE battle_id=? AND guest_id=?",
        )
        .get(b.id, guest);
      if (existing) return this.view(guest, b.id);
      if (
        b.status !== "lobby" ||
        (
          this.db
            .prepare(
              "SELECT COUNT(*) n FROM guest_duel_members WHERE battle_id=?",
            )
            .get(b.id) as { n: number }
        ).n !== 1
      )
        return fail(409, "Diese Einladung ist bereits vergeben.");
      this.db
        .prepare(
          "INSERT INTO guest_duel_members(id,battle_id,guest_id,name,slot) VALUES(?,?,?,?,2)",
        )
        .run(randomUUID(), b.id, guest, name);
      return this.view(guest, b.id);
    });
  }
  start(guest: string, id: string) {
    return this.transaction(() => {
      const b = this.battle(guest, id);
      if (b.owner_id !== guest)
        return fail(403, "Nur der Gastgeber startet das Duell.");
      if (b.status !== "lobby") return this.view(guest, id);
      if (
        (
          this.db
            .prepare(
              "SELECT COUNT(*) n FROM guest_duel_members WHERE battle_id=?",
            )
            .get(id) as { n: number }
        ).n !== 2
      )
        return fail(409, "Zum Start müssen beide Personen beigetreten sein.");
      const now = this.now(),
        midnight = Date.parse(
          new Date(now).toISOString().slice(0, 10) + "T00:00:00Z",
        );
      this.db
        .prepare(
          "UPDATE guest_duels SET status='active',started_at=?,ends_at=? WHERE id=?",
        )
        .run(now, midnight + b.duration_days * 86400000, id);
      return this.view(guest, id);
    });
  }
  entry(
    guest: string,
    id: string,
    input: { requestId: unknown; value: unknown },
  ) {
    if (
      typeof input.requestId !== "string" ||
      !/^[\w-]{16,80}$/.test(input.requestId)
    )
      return fail(400, "Ungültiger Eintrag.");
    return this.transaction(() => {
      const b = this.battle(guest, id),
        member = this.db
          .prepare(
            "SELECT * FROM guest_duel_members WHERE battle_id=? AND guest_id=?",
          )
          .get(id, guest) as Member;
      const previous = this.db
        .prepare(
          "SELECT value FROM guest_duel_entries WHERE member_id=? AND id=?",
        )
        .get(member.id, input.requestId as string) as
        { value: number | null } | undefined;
      if (previous) {
        if (previous.value !== input.value)
          fail(
            409,
            "Dieser Eintrag wurde bereits mit einem anderen Wert gespeichert.",
          );
        return this.view(guest, id);
      }
      if (
        this.status(b) !== "active" ||
        member.finished_at !== null ||
        this.now() < (b.started_at ?? 0)
      )
        return fail(
          409,
          "Für dieses Duell sind keine weiteren Einträge möglich.",
        );
      const source = JSON.parse(b.source) as DuelSource,
        day = new Date(this.now()).toISOString().slice(0, 10);
      if (source.definition.type === "daily_boolean") {
        if (input.value !== null)
          return fail(400, "Für diese Challenge wird nur abgehakt.");
        if (
          this.db
            .prepare(
              "SELECT id FROM guest_duel_entries WHERE member_id=? AND day=?",
            )
            .get(member.id, day)
        )
          return fail(409, "Heute hast du bereits abgehakt (UTC).");
      } else if (
        typeof input.value !== "number" ||
        !Number.isFinite(input.value) ||
        input.value <= 0 ||
        input.value > 1e12
      )
        return fail(400, "Gib einen positiven Messwert bis 1 Billion ein.");
      const count = this.db
        .prepare("SELECT COUNT(*) n FROM guest_duel_entries WHERE member_id=?")
        .get(member.id) as { n: number };
      if (count.n >= 1000) return fail(429, "Maximal 1000 Einträge pro Duell.");
      this.db
        .prepare("INSERT INTO guest_duel_entries VALUES(?,?,?,?,?)")
        .run(
          input.requestId as string,
          member.id,
          this.now(),
          day,
          input.value as number | null,
        );
      return this.view(guest, id);
    });
  }
  finish(guest: string, id: string) {
    return this.transaction(() => {
      const b = this.battle(guest, id);
      if (this.status(b) === "completed") return this.view(guest, id);
      if (b.status !== "active")
        return fail(409, "Das Duell läuft noch nicht.");
      this.db
        .prepare(
          "UPDATE guest_duel_members SET finished_at=COALESCE(finished_at,?) WHERE battle_id=? AND guest_id=?",
        )
        .run(this.now(), id, guest);
      if (
        (
          this.db
            .prepare(
              "SELECT COUNT(*) n FROM guest_duel_members WHERE battle_id=? AND finished_at IS NOT NULL",
            )
            .get(id) as { n: number }
        ).n === 2
      )
        this.db
          .prepare("UPDATE guest_duels SET status='completed' WHERE id=?")
          .run(id);
      return this.view(guest, id);
    });
  }
  list(guest: string) {
    return (
      this.db
        .prepare(
          "SELECT b.id FROM guest_duels b JOIN guest_duel_members m ON b.id=m.battle_id WHERE m.guest_id=? AND b.created_at>=? ORDER BY b.created_at DESC LIMIT 100",
        )
        .all(guest, this.now() - 30 * 86400000) as { id: string }[]
    ).map((b) => this.view(guest, b.id));
  }
  view(guest: string, id: string): DuelView {
    const b = this.battle(guest, id),
      source = JSON.parse(b.source) as DuelSource;
    const members = (
      this.db
        .prepare(
          "SELECT * FROM guest_duel_members WHERE battle_id=? ORDER BY slot",
        )
        .all(id) as Member[]
    ).map((m) => {
      const entries = this.db
        .prepare(
          "SELECT id,at,value,day FROM guest_duel_entries WHERE member_id=? ORDER BY at,id",
        )
        .all(m.id) as {
        id: string;
        at: number;
        value: number | null;
        day: string;
      }[];
      const score = calculateChallengeOutcome({
        definition: source.definition,
        checkIns: entries.map((e) => ({ date: e.day, value: e.value })),
      });
      return {
        id: m.id,
        name: m.name,
        finished: m.finished_at !== null,
        value: score.value,
        label: score.label,
        entries: entries.map((e) => ({
          id: e.id,
          at: new Date(e.at).toISOString(),
          value: e.value,
        })),
        guest: m.guest_id,
      };
    });
    const status = this.status(b);
    let result: DuelView["result"] = null;
    if (status === "completed" && members.length === 2) {
      const [a, c] = members;
      const lower = source.definition.direction === "at_most" || source.definition.direction === "minimize";
      const tie = a.value === c.value;
      const winner = tie
        ? null
        : lower
          ? a.value === 0
            ? c
            : c.value === 0
              ? a
              : a.value < c.value
                ? a
                : c
          : a.value > c.value
            ? a
            : c;
      result = { winnerId: winner?.id ?? null, tie };
    }
    return {
      id: b.id,
      source,
      durationDays: b.duration_days,
      status,
      startedAt:
        b.started_at === null ? null : new Date(b.started_at).toISOString(),
      endsAt: b.ends_at === null ? null : new Date(b.ends_at).toISOString(),
      owner: b.owner_id === guest,
      me: members.find((m) => m.guest === guest)!.id,
      members: members.map(({ id, name, finished, value, label, entries }) => ({
        id,
        name,
        finished,
        value,
        label,
        entries,
      })),
      result,
    };
  }
}
