import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlEmailVerificationRepository } from "../infrastructure/postgresql/postgresql-email-verification-repository.ts";

type Query = { text: string; values?: unknown[] };
type User = { emailVerifiedAt: string | null };
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
  const users = new Map<string, User>([
    ["u1", { emailVerifiedAt: null }],
    ["u2", { emailVerifiedAt: "2026-09-03T09:00:00.000Z" }]
  ]);
  const tokens = new Map<string, Token>();

  const query = async (text: string, values?: unknown[]) => {
    queries.push({ text, values });

    if (text.includes("WITH selected_user")) {
      const [id, userId, tokenHash, expiresAt, createdAt] = (values ?? []).map(String);
      const user = users.get(userId);
      const conflict = tokens.has(id) || [...tokens.values()].some((token) => token.tokenHash === tokenHash);
      if (user && user.emailVerifiedAt === null && !conflict) {
        tokens.set(id, { id, userId, tokenHash, expiresAt, createdAt, usedAt: null });
      }
      return { rows: [{
        user_exists: Boolean(user),
        already_verified: Boolean(user?.emailVerifiedAt),
        created: Boolean(user && user.emailVerifiedAt === null && !conflict)
      }] };
    }

    if (text.includes("SELECT created_at") && text.includes("FOR UPDATE")) {
      const token = tokens.get(String(values?.[0]));
      return {
        rows: token && token.userId === values?.[1] && token.usedAt === null
          ? [{ created_at: new Date(token.createdAt) }]
          : []
      };
    }

    if (text.includes("UPDATE email_verification_tokens") && text.includes("created_at <")) {
      const [usedAt, userId, currentId, currentCreatedAt] = (values ?? []).map(String);
      for (const token of tokens.values()) {
        if (
          token.userId === userId && token.id !== currentId && token.usedAt === null &&
          token.createdAt < currentCreatedAt
        ) token.usedAt = usedAt;
      }
      return { rows: [] };
    }

    if (text.startsWith("DELETE FROM email_verification_tokens")) {
      const token = tokens.get(String(values?.[0]));
      if (token?.userId === values?.[1]) tokens.delete(token.id);
      return { rows: [] };
    }

    if (text.includes("UPDATE email_verification_tokens") && text.includes("RETURNING user_id")) {
      const [now, tokenHash] = (values ?? []).map(String);
      const token = [...tokens.values()].find((candidate) =>
        candidate.tokenHash === tokenHash && candidate.usedAt === null && candidate.expiresAt > now
      );
      if (!token) return { rows: [] };
      token.usedAt = now;
      return { rows: [{ user_id: token.userId }] };
    }

    if (text.includes("UPDATE users") && text.includes("email_verified_at IS NULL")) {
      const [verifiedAt, userId] = (values ?? []).map(String);
      const user = users.get(userId);
      if (!user || user.emailVerifiedAt !== null) return { rows: [] };
      user.emailVerifiedAt = verifiedAt;
      return { rows: [{ id: userId }] };
    }

    if (text.includes("UPDATE email_verification_tokens") && text.includes("WHERE user_id = $2")) {
      const [usedAt, userId] = (values ?? []).map(String);
      for (const token of tokens.values()) {
        if (token.userId === userId && token.usedAt === null) token.usedAt = usedAt;
      }
      return { rows: [] };
    }

    throw new Error(`Unerwartete Abfrage: ${text}`);
  };

  const client: PostgresTransactionalQueryClient = {
    query,
    transaction: async <T>(callback: (transaction: PostgresQueryClient) => Promise<T>) => callback({ query })
  };
  return { client, queries, users, tokens };
}

const firstToken = {
  id: "verify-1",
  userId: "u1",
  tokenHash: "hash-1",
  expiresAt: "2026-09-03T10:30:00.000Z"
};

test("PostgreSQL-Verifikationsadapter speichert nur Hashes für unverifizierte Konten", async () => {
  const { client, queries, tokens } = createClient();
  const repository = new PostgresqlEmailVerificationRepository(client, () => "2026-09-03T10:00:00.000Z");

  assert.deepEqual(await repository.createForUser(firstToken), { status: "created" });
  assert.deepEqual(await repository.createForUser({ ...firstToken, id: "verify-2" }), {
    status: "token_conflict"
  });
  assert.deepEqual(await repository.createForUser({
    ...firstToken, id: "verify-3", userId: "u2", tokenHash: "hash-3"
  }), { status: "already_verified" });
  assert.deepEqual(await repository.createForUser({
    ...firstToken, id: "verify-4", userId: "missing", tokenHash: "hash-4"
  }), { status: "user_not_found" });
  assert.equal(tokens.size, 1);

  const insert = queries.find((item) => item.text.includes("WITH selected_user"));
  assert.deepEqual(insert?.values, [
    "verify-1", "u1", "hash-1", "2026-09-03T10:30:00.000Z", "2026-09-03T10:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
});

test("PostgreSQL-Verifikationsadapter ersetzt erst nach Zustellung nur ältere Links", async () => {
  const { client, tokens } = createClient();
  let now = "2026-09-03T10:00:00.000Z";
  const repository = new PostgresqlEmailVerificationRepository(client, () => now);
  await repository.createForUser(firstToken);
  now = "2026-09-03T10:01:00.000Z";
  await repository.createForUser({ ...firstToken, id: "verify-2", tokenHash: "hash-2" });

  await repository.confirmDelivery({
    id: "verify-1", userId: "u1", deliveredAt: "2026-09-03T10:02:00.000Z"
  });
  assert.equal(tokens.get("verify-2")?.usedAt, null);
  await repository.confirmDelivery({
    id: "verify-2", userId: "u1", deliveredAt: "2026-09-03T10:03:00.000Z"
  });
  assert.equal(tokens.get("verify-1")?.usedAt, "2026-09-03T10:03:00.000Z");

  now = "2026-09-03T10:04:00.000Z";
  await repository.createForUser({ ...firstToken, id: "verify-failed", tokenHash: "hash-failed" });
  await repository.discard({ id: "verify-failed", userId: "u1" });
  assert.equal(tokens.has("verify-failed"), false);
  assert.equal(tokens.get("verify-2")?.usedAt, null);
});

test("PostgreSQL-Verifikationsadapter bestätigt atomar und entwertet weitere Links", async () => {
  const { client, users, tokens } = createClient();
  let now = "2026-09-03T10:00:00.000Z";
  const repository = new PostgresqlEmailVerificationRepository(client, () => now);
  await repository.createForUser(firstToken);
  now = "2026-09-03T10:01:00.000Z";
  await repository.createForUser({ ...firstToken, id: "verify-2", tokenHash: "hash-2" });

  assert.deepEqual(await repository.verifyEmail({
    tokenHash: "hash-2", now: "2026-09-03T10:15:00.000Z"
  }), { status: "verified" });
  assert.equal(users.get("u1")?.emailVerifiedAt, "2026-09-03T10:15:00.000Z");
  assert.equal(tokens.get("verify-1")?.usedAt, "2026-09-03T10:15:00.000Z");
  assert.deepEqual(await repository.verifyEmail({
    tokenHash: "hash-2", now: "2026-09-03T10:16:00.000Z"
  }), { status: "invalid_token" });
});

test("PostgreSQL-Verifikationsadapter lehnt abgelaufene Links ab", async () => {
  const { client, users } = createClient();
  const repository = new PostgresqlEmailVerificationRepository(client, () => "2026-09-03T10:00:00.000Z");
  await repository.createForUser({ ...firstToken, expiresAt: "2026-09-03T10:05:00.000Z" });

  assert.deepEqual(await repository.verifyEmail({
    tokenHash: "hash-1", now: "2026-09-03T10:05:00.000Z"
  }), { status: "invalid_token" });
  assert.equal(users.get("u1")?.emailVerifiedAt, null);
});
