import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { GuestDuels, DuelError } from "../lib/guest-duels.ts";
import { guestDuelHttp } from "../lib/guest-duel-http.ts";
import { DAILY_BOOLEAN_DEFINITION } from "../domain/challenges/challenge-definition.ts";
const source = {
  sourceKey: "local:test",
  title: "Täglich",
  goal: "Dranbleiben",
  rules: ["Einmal täglich"],
  definition: DAILY_BOOLEAN_DEFINITION,
  durationDays: null,
};
function setup() {
  let now = Date.parse("2026-11-03T12:00:00Z");
  const db = new DatabaseSync(":memory:");
  const s = new GuestDuels(db, () => now);
  const tokens = [s.session().token, s.session().token, s.session().token];
  const [a, b, c] = tokens.map((t) => s.authenticate(t));
  const duel = s.create(a, {
    source,
    name: "Anna",
    days: 2,
    requestId: randomUUID(),
  });
  return {
    s,
    db,
    a,
    b,
    c,
    duel,
    tokens,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
const rejects = (fn: () => unknown, status: number) =>
  assert.throws(
    fn,
    (e: unknown) => e instanceof DuelError && e.status === status,
  );
test("private membership, hashed credentials, one opponent, host start", () => {
  const { s, db, a, b, c, duel, tokens } = setup();
  assert.ok(
    !JSON.stringify(db.prepare("SELECT * FROM guest_sessions").all()).includes(
      tokens[0],
    ),
  );
  rejects(() => s.authenticate("x".repeat(43)), 401);
  rejects(() => s.view(b, duel.id), 404);
  rejects(() => s.start(a, duel.id), 409);
  const invite = s.invite(a, duel.id).token;
  rejects(() => s.join(a, invite, "Self"), 409);
  const joined = s.join(b, invite, "Ben");
  assert.equal(joined.members.length, 2);
  assert.deepEqual(s.join(b, invite, "Ben"), joined);
  rejects(() => s.join(c, invite, "Third"), 409);
  rejects(() => s.start(b, duel.id), 403);
  rejects(
    () => s.entry(a, duel.id, { requestId: randomUUID(), value: null }),
    409,
  );
  assert.equal(s.start(a, duel.id).status, "active");
  assert.ok(!JSON.stringify(joined).includes(a));
});
test("rotation and expiry invalidate invites", () => {
  const { s, a, b, duel, advance } = setup();
  const old = s.invite(a, duel.id).token;
  const fresh = s.invite(a, duel.id).token;
  rejects(() => s.join(b, old, "Ben"), 404);
  advance(86400000);
  rejects(() => s.join(b, fresh, "Ben"), 404);
});
test("idempotent create and daily entries, finish locks, shared result", () => {
  const { s, a, b, duel } = setup();
  const requestId = randomUUID();
  const input = { source, name: "Anna", days: 2, requestId };
  const created = s.create(a, input);
  assert.equal(s.create(a, input).id, created.id);
  rejects(() => s.create(a, { ...input, days: 3 }), 409);
  s.join(b, s.invite(a, duel.id).token, "Ben");
  s.start(a, duel.id);
  const entry = { requestId: randomUUID(), value: null };
  s.entry(a, duel.id, entry);
  assert.equal(s.entry(a, duel.id, entry).members[0].value, 1);
  rejects(() => s.entry(a, duel.id, { ...entry, value: 2 }), 409);
  rejects(
    () => s.entry(a, duel.id, { requestId: randomUUID(), value: null }),
    409,
  );
  s.finish(a, duel.id);
  rejects(
    () => s.entry(a, duel.id, { requestId: randomUUID(), value: null }),
    409,
  );
  const result = s.finish(b, duel.id);
  assert.equal(result.result?.winnerId, result.members[0].id);
  assert.equal(result.status, "completed");
  assert.equal(s.view(b, duel.id).result?.winnerId, result.result?.winnerId);
});
test("UTC boundary, automatic expiry, expired guest access", () => {
  const { s, a, b, duel, advance, tokens } = setup();
  s.join(b, s.invite(a, duel.id).token, "Ben");
  s.start(a, duel.id);
  s.entry(a, duel.id, { requestId: randomUUID(), value: null });
  advance(12 * 3600000);
  assert.equal(
    s.entry(a, duel.id, { requestId: randomUUID(), value: null }).members[0]
      .value,
    2,
  );
  advance(86400000);
  assert.equal(s.view(a, duel.id).status, "completed");
  rejects(
    () => s.entry(b, duel.id, { requestId: randomUUID(), value: null }),
    409,
  );
  advance(30 * 86400000);
  rejects(() => s.authenticate(tokens[0]), 401);
});
test("time results choose lower positive best, cumulative sums and ties", () => {
  for (const type of ["one_time_result", "cumulative_metric"] as const) {
    const { s, a, b } = setup();
    const definition =
      type === "one_time_result"
        ? {
            type,
            unit: "seconds" as const,
            targetValue: 60,
            frequency: "once" as const,
            direction: "at_most" as const,
            completionCriterion: "single_result" as const,
          }
        : {
            type,
            unit: "steps" as const,
            targetValue: 100,
            frequency: "challenge_period" as const,
            direction: "at_least" as const,
            completionCriterion: "cumulative_target" as const,
          };
    const d = s.create(a, {
      source: { ...source, definition },
      name: "Anna",
      days: 1,
      requestId: randomUUID(),
    });
    s.join(b, s.invite(a, d.id).token, "Ben");
    s.start(a, d.id);
    for (const value of [20, 10])
      s.entry(a, d.id, { requestId: randomUUID(), value });
    rejects(
      () => s.entry(b, d.id, { requestId: randomUUID(), value: -1 }),
      400,
    );
    s.finish(a, d.id);
    const result = s.finish(b, d.id);
    assert.equal(result.members[0].value, type === "one_time_result" ? 10 : 30);
    assert.equal(result.result?.winnerId, result.members[0].id);
  }
});
test("HTTP auth, origin, size, methods, rate limits and sanitized errors", async () => {
  const { s, tokens } = setup();
  const req = (path: string, options: RequestInit = {}) =>
    guestDuelHttp(
      new Request("http://localhost/api/v1/guest-duels" + path, options),
      s,
    );
  assert.equal((await req("")).status, 401);
  assert.equal(
    (await req("", { headers: { Authorization: `Bearer ${tokens[0]}` } }))
      .status,
    200,
  );
  assert.equal(
    (await req("", { headers: { origin: "https://evil.test" } })).status,
    403,
  );
  assert.equal((await req("", { method: "DELETE" })).status, 405);
  assert.equal(
    (
      await req("/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(17000),
      })
    ).status,
    413,
  );
  assert.equal(
    (
      await req("/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "null",
      })
    ).status,
    400,
  );
  s.rate("test", 1);
  rejects(() => s.rate("test", 1), 429);
});
test("empty result is a tie and stored membership survives a database reopen", async () => {
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const folder = mkdtempSync(join(tmpdir(), "guest-duels-"));
  let db = new DatabaseSync(join(folder, "duels.sqlite"));
  try {
    let s = new GuestDuels(db);
    const token = s.session().token,
      a = s.authenticate(token),
      b = s.authenticate(s.session().token);
    const duel = s.create(a, {
      source,
      name: "Anna",
      days: 1,
      requestId: randomUUID(),
    });
    s.join(b, s.invite(a, duel.id).token, "Ben");
    s.start(a, duel.id);
    s.finish(a, duel.id);
    assert.equal(s.finish(b, duel.id).result?.tie, true);
    db.close();
    db = new DatabaseSync(join(folder, "duels.sqlite"));
    s = new GuestDuels(db);
    assert.equal(s.list(s.authenticate(token))[0].id, duel.id);
    assert.equal(s.view(a, duel.id).result?.tie, true);
  } finally {
    db.close();
    rmSync(folder, { recursive: true, force: true });
  }
});
