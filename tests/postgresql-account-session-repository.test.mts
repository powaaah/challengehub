import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { PostgresQueryClient } from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlAccountSessionRepository } from "../infrastructure/postgresql/postgresql-account-session-repository.ts";

type Query = { text: string; values?: unknown[] };
type StoredAccount = {
  id: string;
  email: string;
  name: string;
  nameKey: string;
  passwordHash: string;
  createdAt: string;
  emailVerifiedAt: string | null;
};
type StoredSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

function createClient() {
  const queries: Query[] = [];
  const accounts = new Map<string, StoredAccount>();
  const sessions = new Map<string, StoredSession>();

  const accountRows = (items: StoredAccount[]) => items.map((account) => ({
    id: account.id,
    email: account.email,
    name: account.name,
    password_hash: account.passwordHash,
    created_at: new Date(account.createdAt),
    email_verified_at: account.emailVerifiedAt ? new Date(account.emailVerifiedAt) : null
  }));

  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });

      if (text.includes("INSERT INTO users")) {
        const [id, email, name, nameKey, passwordHash, createdAt] = values ?? [];
        const conflict = [...accounts.values()].some((account) =>
          account.id === id || account.email === email || account.nameKey === nameKey
        );
        if (conflict) return { rows: [] };
        const account: StoredAccount = {
          id: String(id), email: String(email), name: String(name), nameKey: String(nameKey),
          passwordHash: String(passwordHash), createdAt: String(createdAt), emailVerifiedAt: null
        };
        accounts.set(account.id, account);
        return { rows: accountRows([account]) };
      }

      if (text.includes("UPDATE users") && text.includes("SET name =")) {
        const [name, nameKey, userId] = values ?? [];
        const account = accounts.get(String(userId));
        const conflict = [...accounts.values()].some((candidate) =>
          candidate.id !== userId && candidate.nameKey === nameKey
        );
        if (!account || conflict) return { rows: [] };
        account.name = String(name);
        account.nameKey = String(nameKey);
        return { rows: [{ id: account.id }] };
      }

      if (text.includes("FROM sessions") && text.includes("JOIN users")) {
        const [tokenHash, now] = values ?? [];
        const session = [...sessions.values()].find((candidate) =>
          candidate.tokenHash === tokenHash && candidate.expiresAt > String(now)
        );
        const account = session ? accounts.get(session.userId) : undefined;
        return { rows: account ? accountRows([account]) : [] };
      }

      if (text.includes("INSERT INTO sessions")) {
        const [id, userId, tokenHash, expiresAt, createdAt] = values ?? [];
        const conflict = [...sessions.values()].some((session) =>
          session.id === id || session.tokenHash === tokenHash
        );
        if (!accounts.has(String(userId)) || conflict) return { rows: [] };
        sessions.set(String(id), {
          id: String(id), userId: String(userId), tokenHash: String(tokenHash),
          expiresAt: String(expiresAt), createdAt: String(createdAt)
        });
        return { rows: [{ id }] };
      }

      if (text.includes("DELETE FROM sessions")) {
        const session = [...sessions.values()].find((candidate) => candidate.tokenHash === values?.[0]);
        if (!session) return { rows: [] };
        sessions.delete(session.id);
        return { rows: [{ id: session.id }] };
      }

      if (text.includes("SELECT 1 AS found")) {
        return { rows: accounts.has(String(values?.[0])) ? [{ found: 1 }] : [] };
      }

      if (text.includes("FROM users")) {
        let account: StoredAccount | undefined;
        if (text.includes("WHERE id = $1")) account = accounts.get(String(values?.[0]));
        else if (text.includes("email = $1 OR name_key = $2")) {
          account = [...accounts.values()].find((candidate) =>
            candidate.email === values?.[0] || candidate.nameKey === values?.[1]
          );
        } else if (text.includes("WHERE email = $1")) {
          account = [...accounts.values()].find((candidate) => candidate.email === values?.[0]);
        }
        return { rows: account ? accountRows([account]) : [] };
      }

      throw new Error(`Unerwartete Abfrage: ${text}`);
    }
  };

  return { client, accounts, sessions, queries };
}

const accountInput = {
  id: "u1",
  email: " Stefan@Example.COM ",
  name: " Straße ",
  passwordHash: "stored-password-hash"
};

test("PostgreSQL-Account-Adapter normalisiert E-Mail und NFKC-Name-Key atomar", async () => {
  const { client, accounts, queries } = createClient();
  const repository = new PostgresqlAccountSessionRepository(
    client,
    () => "2026-09-02T10:00:00.000Z"
  );

  const created = await repository.createAccount(accountInput);
  assert.equal(created.status, "created");
  assert.equal(created.status === "created" && created.account.email, "stefan@example.com");
  assert.deepEqual(
    await repository.findAccountByLogin("STRASSE"),
    created.status === "created" ? created.account : null
  );
  assert.deepEqual(await repository.createAccount({
    ...accountInput, id: "u2", email: "zwei@example.com", name: "STRASSE"
  }), { status: "account_conflict" });
  assert.equal(accounts.size, 1);

  const insert = queries.find((query) => query.text.includes("INSERT INTO users"));
  assert.deepEqual(insert?.values, [
    "u1", "stefan@example.com", "Straße", "strasse", "stored-password-hash",
    "2026-09-02T10:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
  assert.match(insert?.text ?? "", /RETURNING/);
});

test("PostgreSQL-Account-Adapter liest Konten und schützt Benutzernamen-Updates", async () => {
  const { client, queries } = createClient();
  const repository = new PostgresqlAccountSessionRepository(client);
  await repository.createAccount(accountInput);
  await repository.createAccount({ ...accountInput, id: "u2", email: "zwei@example.com", name: "Zweiter" });

  assert.equal((await repository.findAccountById("u1"))?.id, "u1");
  assert.equal((await repository.findAccountByEmail(" STEFAN@example.com "))?.id, "u1");
  assert.deepEqual(await repository.updateAccountName({ userId: "u2", name: "strasse" }), {
    status: "account_conflict"
  });
  assert.deepEqual(await repository.updateAccountName({ userId: "missing", name: "Neu" }), {
    status: "user_not_found"
  });
  assert.deepEqual(await repository.updateAccountName({ userId: "u2", name: " Änne " }), {
    status: "updated"
  });

  const update = queries.find((query) => query.text.includes("UPDATE users"));
  assert.deepEqual(update?.values, ["strasse", "strasse", "u2"]);
  assert.match(update?.text ?? "", /NOT EXISTS/);
});

test("PostgreSQL-Account-Adapter mappt parallele Name-Key-Konflikte kontrolliert", async () => {
  const client: PostgresQueryClient = {
    async query(text) {
      if (text.includes("UPDATE users")) {
        throw Object.assign(new Error("duplicate key"), { code: "23505" });
      }
      throw new Error(`Unerwartete Abfrage: ${text}`);
    }
  };
  const repository = new PostgresqlAccountSessionRepository(client);

  assert.deepEqual(await repository.updateAccountName({ userId: "u1", name: "Stefan" }), {
    status: "account_conflict"
  });
});

test("PostgreSQL-Session-Adapter berücksichtigt Ablauf, Nutzer und Tokenkonflikte", async () => {
  const { client, sessions, queries } = createClient();
  const repository = new PostgresqlAccountSessionRepository(
    client,
    () => "2026-09-02T10:00:00.000Z"
  );
  await repository.createAccount(accountInput);

  const session = {
    id: "s1", userId: "u1", tokenHash: "token-hash", expiresAt: "2026-10-01T00:00:00.000Z"
  };
  assert.deepEqual(await repository.createSession(session), { status: "created" });
  assert.equal((await repository.findAccountBySessionTokenHash(
    "token-hash", "2026-09-30T23:59:59.000Z"
  ))?.id, "u1");
  assert.equal(await repository.findAccountBySessionTokenHash(
    "token-hash", "2026-10-01T00:00:00.000Z"
  ), null);
  assert.deepEqual(await repository.createSession({ ...session, id: "s2" }), {
    status: "token_conflict"
  });
  assert.deepEqual(await repository.createSession({
    ...session, id: "s3", userId: "missing", tokenHash: "other-token"
  }), { status: "user_not_found" });
  assert.equal(await repository.deleteSessionByTokenHash("token-hash"), true);
  assert.equal(await repository.deleteSessionByTokenHash("token-hash"), false);
  assert.equal(sessions.size, 0);

  const insert = queries.find((query) => query.text.includes("INSERT INTO sessions"));
  assert.deepEqual(insert?.values, [
    "s1", "u1", "token-hash", "2026-10-01T00:00:00.000Z", "2026-09-02T10:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /FROM users/);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
  const lookup = queries.find((query) => query.text.includes("FROM sessions") && query.text.includes("JOIN users"));
  assert.match(lookup?.text ?? "", /sessions\.expires_at > \$2::timestamptz/);
});
