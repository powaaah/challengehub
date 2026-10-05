import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlPasswordResetRepository } from "../infrastructure/postgresql/postgresql-password-reset-repository.ts";

type Query = { text: string; values?: unknown[] };
type Token = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
};

function createClient() {
  const queries: Query[] = [];
  const users = new Map([["u1", "old-hash"], ["u2", "other-hash"]]);
  const sessions = new Map([["s1", "u1"], ["s2", "u2"]]);
  const tokens = new Map<string, Token>();

  const query = async (text: string, values?: unknown[]) => {
    queries.push({ text, values });

    if (text.includes("WITH selected_user")) {
      const [id, userId, tokenHash, expiresAt, createdAt] = (values ?? []).map(String);
      const userExists = users.has(userId);
      const conflict = tokens.has(id) || [...tokens.values()].some((token) => token.tokenHash === tokenHash);
      if (userExists && !conflict) {
        tokens.set(id, { id, userId, tokenHash, expiresAt, createdAt, usedAt: null });
      }
      return { rows: [{ user_exists: userExists, created: userExists && !conflict }] };
    }

    if (text.includes("SELECT created_at") && text.includes("FOR UPDATE")) {
      const token = tokens.get(String(values?.[0]));
      return {
        rows: token && token.userId === values?.[1] && token.usedAt === null
          ? [{ created_at: new Date(token.createdAt) }]
          : []
      };
    }

    if (text.includes("UPDATE password_reset_tokens") && text.includes("created_at <")) {
      const [usedAt, userId, currentId, currentCreatedAt] = (values ?? []).map(String);
      for (const token of tokens.values()) {
        if (
          token.userId === userId && token.id !== currentId && token.usedAt === null &&
          token.createdAt < currentCreatedAt
        ) token.usedAt = usedAt;
      }
      return { rows: [] };
    }

    if (text.startsWith("DELETE FROM password_reset_tokens")) {
      const token = tokens.get(String(values?.[0]));
      if (token?.userId === values?.[1]) tokens.delete(token.id);
      return { rows: [] };
    }

    if (text.includes("SELECT 1 AS active")) {
      const token = [...tokens.values()].find((candidate) =>
        candidate.tokenHash === values?.[0] && candidate.usedAt === null &&
        candidate.expiresAt > String(values?.[1])
      );
      return { rows: token ? [{ active: 1 }] : [] };
    }

    if (text.includes("UPDATE password_reset_tokens") && text.includes("RETURNING user_id")) {
      const [now, tokenHash] = (values ?? []).map(String);
      const token = [...tokens.values()].find((candidate) =>
        candidate.tokenHash === tokenHash && candidate.usedAt === null && candidate.expiresAt > now
      );
      if (!token) return { rows: [] };
      token.usedAt = now;
      return { rows: [{ user_id: token.userId }] };
    }

    if (text.startsWith("UPDATE users SET password_hash")) {
      users.set(String(values?.[1]), String(values?.[0]));
      return { rows: [] };
    }

    if (text.startsWith("DELETE FROM sessions")) {
      for (const [id, userId] of sessions) if (userId === values?.[0]) sessions.delete(id);
      return { rows: [] };
    }

    throw new Error(`Unerwartete Abfrage: ${text}`);
  };

  const client: PostgresTransactionalQueryClient = {
    query,
    transaction: async <T>(callback: (transaction: PostgresQueryClient) => Promise<T>) => callback({ query })
  };
  return { client, queries, users, sessions, tokens };
}

const firstToken = {
  id: "reset-1",
  userId: "u1",
  tokenHash: "hash-1",
  expiresAt: "2026-09-03T10:30:00.000Z"
};

test("PostgreSQL-Reset-Adapter speichert nur gehashte Tokens für vorhandene Nutzer", async () => {
  const { client, queries, tokens } = createClient();
  const repository = new PostgresqlPasswordResetRepository(client, () => "2026-09-03T10:00:00.000Z");

  assert.deepEqual(await repository.createForUser(firstToken), { status: "created" });
  assert.deepEqual(await repository.createForUser({ ...firstToken, id: "reset-2" }), {
    status: "token_conflict"
  });
  assert.deepEqual(await repository.createForUser({
    ...firstToken, id: "reset-3", userId: "missing", tokenHash: "hash-3"
  }), { status: "user_not_found" });
  assert.equal(tokens.size, 1);
  assert.equal(tokens.get("reset-1")?.tokenHash, "hash-1");

  const insert = queries.find((item) => item.text.includes("WITH selected_user"));
  assert.deepEqual(insert?.values, [
    "reset-1", "u1", "hash-1", "2026-09-03T10:30:00.000Z", "2026-09-03T10:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
});

test("PostgreSQL-Reset-Adapter entwertet erst nach Zustellung nur ältere Links", async () => {
  const { client, tokens } = createClient();
  let now = "2026-09-03T10:00:00.000Z";
  const repository = new PostgresqlPasswordResetRepository(client, () => now);
  await repository.createForUser(firstToken);
  now = "2026-09-03T10:01:00.000Z";
  await repository.createForUser({ ...firstToken, id: "reset-2", tokenHash: "hash-2" });

  await repository.confirmDelivery({
    id: "reset-1", userId: "u1", deliveredAt: "2026-09-03T10:02:00.000Z"
  });
  assert.equal(tokens.get("reset-2")?.usedAt, null);
  await repository.confirmDelivery({
    id: "reset-2", userId: "u1", deliveredAt: "2026-09-03T10:03:00.000Z"
  });
  assert.equal(tokens.get("reset-1")?.usedAt, "2026-09-03T10:03:00.000Z");

  now = "2026-09-03T10:04:00.000Z";
  await repository.createForUser({ ...firstToken, id: "reset-failed", tokenHash: "hash-failed" });
  await repository.discard({ id: "reset-failed", userId: "u1" });
  assert.equal(tokens.has("reset-failed"), false);
  assert.equal(await repository.isTokenActive({
    tokenHash: "hash-2", now: "2026-09-03T10:15:00.000Z"
  }), true);
});

test("PostgreSQL-Reset-Adapter konsumiert atomar und widerruft alle Nutzersitzungen", async () => {
  const { client, users, sessions } = createClient();
  const repository = new PostgresqlPasswordResetRepository(client, () => "2026-09-03T10:00:00.000Z");
  await repository.createForUser(firstToken);

  const input = {
    tokenHash: "hash-1", passwordHash: "new-hash", now: "2026-09-03T10:15:00.000Z"
  };
  const results = await Promise.all([repository.resetPassword(input), repository.resetPassword(input)]);
  assert.deepEqual(results.map((result) => result.status).sort(), ["invalid_token", "reset"]);
  assert.equal(users.get("u1"), "new-hash");
  assert.equal(sessions.has("s1"), false);
  assert.equal(sessions.has("s2"), true);
  assert.deepEqual(await repository.resetPassword({ ...input, tokenHash: "missing" }), {
    status: "invalid_token"
  });
});

test("PostgreSQL-Reset-Adapter lehnt abgelaufene Tokens ab", async () => {
  const { client, users, sessions } = createClient();
  const repository = new PostgresqlPasswordResetRepository(client, () => "2026-09-03T10:00:00.000Z");
  await repository.createForUser({
    ...firstToken, expiresAt: "2026-09-03T10:05:00.000Z"
  });

  assert.equal(await repository.isTokenActive({
    tokenHash: "hash-1", now: "2026-09-03T10:05:00.000Z"
  }), false);
  assert.deepEqual(await repository.resetPassword({
    tokenHash: "hash-1", passwordHash: "attacker-hash", now: "2026-09-03T10:05:00.000Z"
  }), { status: "invalid_token" });
  assert.equal(users.get("u1"), "old-hash");
  assert.equal(sessions.has("s1"), true);
});
