import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteChallengeInvitationRepository } from "../infrastructure/sqlite/sqlite-challenge-invitation-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT NOT NULL);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      challenge_id TEXT NOT NULL REFERENCES challenges(id),
      status TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT '2026-07-15T08:00:00.000Z',
      completed_at TEXT,
      UNIQUE (user_id, challenge_id)
    );
    CREATE TABLE challenge_invitations (
      id TEXT PRIMARY KEY,
      inviter_participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      accepted_at TEXT,
      revoked_at TEXT
    );
    INSERT INTO users VALUES ('inviter'), ('friend'), ('other-friend');
    INSERT INTO challenges VALUES ('steps', '10000-schritte-am-tag');
    INSERT INTO participations (id, user_id, challenge_id, status) VALUES
      ('active-participation', 'inviter', 'steps', 'active'),
      ('cancelled-participation', 'friend', 'steps', 'cancelled');
  `);

  return { db, repository: new SqliteChallengeInvitationRepository(db) };
}

const invitation = {
  id: "invitation-1",
  inviterParticipationId: "active-participation",
  inviterUserId: "inviter",
  tokenHash: "sha256:only-the-hash-is-persisted",
  createdAt: "2026-07-15T08:00:00.000Z",
  expiresAt: "2026-07-22T08:00:00.000Z"
};

test("Einladungs-Repository speichert nur den Token-Hash fuer eine aktive Teilnahme", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.create(invitation), { status: "created" });
  assert.deepEqual(
    {
      ...db
        .prepare(`
          SELECT id, inviter_participation_id AS inviterParticipationId,
            token_hash AS tokenHash, expires_at AS expiresAt
          FROM challenge_invitations
        `)
        .get()
    },
    {
      id: "invitation-1",
      inviterParticipationId: "active-participation",
      tokenHash: "sha256:only-the-hash-is-persisted",
      expiresAt: "2026-07-22T08:00:00.000Z"
    }
  );
  assert.deepEqual(
    repository.findActiveByTokenHash(
      "sha256:only-the-hash-is-persisted",
      "2026-07-16T08:00:00.000Z"
    ),
    {
      id: "invitation-1",
      inviterParticipationId: "active-participation",
      inviterUserId: "inviter",
      challengeId: "steps",
      challengeSlug: "10000-schritte-am-tag",
      expiresAt: "2026-07-22T08:00:00.000Z"
    }
  );
  db.close();
});

test("Einladungs-Repository lehnt ungueltige Teilnahme und Hash-Konflikt ab", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.create({ ...invitation, inviterUserId: "friend" }), {
    status: "participation_not_available"
  });
  assert.deepEqual(
    repository.create({ ...invitation, inviterParticipationId: "cancelled-participation", inviterUserId: "friend" }),
    { status: "participation_not_available" }
  );
  assert.deepEqual(
    repository.create({ ...invitation, inviterParticipationId: "missing-participation" }),
    { status: "participation_not_available" }
  );
  assert.deepEqual(repository.create(invitation), { status: "created" });
  assert.deepEqual(repository.create({ ...invitation, id: "invitation-2" }), {
    status: "token_conflict"
  });
  db.close();
});

test("Einladungs-Repository gibt abgelaufene, angenommene oder widerrufene Tokens nicht frei", () => {
  const { db, repository } = createRepository();
  assert.deepEqual(repository.create(invitation), { status: "created" });

  assert.equal(repository.findActiveByTokenHash(invitation.tokenHash, invitation.expiresAt), null);

  db.prepare(`
    UPDATE challenge_invitations
    SET accepted_by_user_id = 'friend', accepted_at = '2026-07-16T08:00:00.000Z'
    WHERE id = 'invitation-1'
  `).run();
  assert.equal(
    repository.findActiveByTokenHash(invitation.tokenHash, "2026-07-16T09:00:00.000Z"),
    null
  );

  db.prepare(`
    UPDATE challenge_invitations
    SET accepted_by_user_id = NULL, accepted_at = NULL, revoked_at = '2026-07-16T10:00:00.000Z'
    WHERE id = 'invitation-1'
  `).run();
  assert.equal(
    repository.findActiveByTokenHash(invitation.tokenHash, "2026-07-16T09:00:00.000Z"),
    null
  );
  db.close();
});

test("Einladung wird atomar angenommen und aktiviert die gemeinsame Challenge-Teilnahme", () => {
  const { db, repository } = createRepository();
  assert.deepEqual(repository.create(invitation), { status: "created" });

  assert.deepEqual(repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "friend",
    participationId: "friend-participation",
    acceptedAt: "2026-07-16T08:00:00.000Z"
  }), { status: "accepted", participationId: "cancelled-participation" });

  assert.deepEqual({ ...db.prepare(`
    SELECT accepted_by_user_id AS acceptedByUserId, accepted_at AS acceptedAt
    FROM challenge_invitations WHERE id = 'invitation-1'
  `).get() }, {
    acceptedByUserId: "friend",
    acceptedAt: "2026-07-16T08:00:00.000Z"
  });
  assert.deepEqual({ ...db.prepare(`
    SELECT status, completed_at AS completedAt
    FROM participations WHERE id = 'cancelled-participation'
  `).get() }, { status: "active", completedAt: null });
  assert.equal(repository.findActiveByTokenHash(invitation.tokenHash, "2026-07-16T09:00:00.000Z"), null);
  db.close();
});

test("Neue eingeladene Teilnahme wird erstellt und erscheint in derselben Challenge", () => {
  const { db, repository } = createRepository();
  assert.deepEqual(repository.create(invitation), { status: "created" });

  assert.deepEqual(repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "other-friend",
    participationId: "new-friend-participation",
    acceptedAt: "2026-07-16T08:00:00.000Z"
  }), { status: "accepted", participationId: "new-friend-participation" });

  assert.deepEqual({ ...db.prepare(`
    SELECT user_id AS userId, challenge_id AS challengeId, status
    FROM participations WHERE id = 'new-friend-participation'
  `).get() }, { userId: "other-friend", challengeId: "steps", status: "active" });
  db.close();
});

test("Eigene und abgelaufene Einladungen werden ohne Teilnahmeschreibzugriff abgelehnt", () => {
  const { db, repository } = createRepository();
  assert.deepEqual(repository.create(invitation), { status: "created" });

  assert.deepEqual(repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "inviter",
    participationId: "self-participation",
    acceptedAt: "2026-07-16T08:00:00.000Z"
  }), { status: "self_invitation" });
  assert.equal(db.prepare("SELECT 1 FROM participations WHERE id = 'self-participation'").get(), undefined);

  assert.deepEqual(repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "other-friend",
    participationId: "late-participation",
    acceptedAt: invitation.expiresAt
  }), { status: "invitation_not_available" });
  assert.equal(db.prepare("SELECT 1 FROM participations WHERE id = 'late-participation'").get(), undefined);
  db.close();
});
