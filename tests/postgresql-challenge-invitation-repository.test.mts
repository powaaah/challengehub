import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlChallengeInvitationRepository } from "../infrastructure/postgresql/postgresql-challenge-invitation-repository.ts";

type Query = { text: string; values?: unknown[] };
type Participation = {
  id: string;
  userId: string;
  challengeId: string;
  status: "active" | "completed" | "cancelled";
  completedAt: string | null;
};
type Invitation = {
  id: string;
  inviterParticipationId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  acceptedByUserId: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
};

function createClient() {
  const queries: Query[] = [];
  const users = new Set(["inviter", "friend", "new-friend"]);
  const challengeSlugs = new Map([["steps", "10000-schritte-am-tag"]]);
  const participations = new Map<string, Participation>([
    ["inviter-participation", {
      id: "inviter-participation",
      userId: "inviter",
      challengeId: "steps",
      status: "active",
      completedAt: null
    }],
    ["friend-participation", {
      id: "friend-participation",
      userId: "friend",
      challengeId: "steps",
      status: "cancelled",
      completedAt: "2026-08-01T09:00:00.000Z"
    }]
  ]);
  const invitations = new Map<string, Invitation>();
  let transactionCount = 0;

  const query = async (text: string, values?: unknown[]) => {
    queries.push({ text, values });

    if (text.includes("WITH eligible_participation")) {
      const [id, participationId, userId, tokenHash, expiresAt, createdAt] =
        (values ?? []).map(String);
      const participation = participations.get(participationId);
      const eligible = participation?.userId === userId && participation.status === "active";
      const conflict = invitations.has(id) || [...invitations.values()].some(
        (invitation) => invitation.tokenHash === tokenHash
      );
      if (eligible && !conflict) {
        invitations.set(id, {
          id,
          inviterParticipationId: participationId,
          tokenHash,
          expiresAt,
          createdAt,
          acceptedByUserId: null,
          acceptedAt: null,
          revokedAt: null
        });
      }
      return { rows: [{ participation_available: eligible, created: eligible && !conflict }] };
    }

    if (text.includes("challenges.slug AS challenge_slug")) {
      const [tokenHash, now] = (values ?? []).map(String);
      const invitation = [...invitations.values()].find((candidate) =>
        candidate.tokenHash === tokenHash && candidate.expiresAt > now &&
        candidate.acceptedAt === null && candidate.revokedAt === null
      );
      const participation = invitation
        ? participations.get(invitation.inviterParticipationId)
        : undefined;
      if (!invitation || !participation || participation.status !== "active") return { rows: [] };
      return { rows: [{
        id: invitation.id,
        inviter_participation_id: participation.id,
        inviter_user_id: participation.userId,
        challenge_id: participation.challengeId,
        challenge_slug: challengeSlugs.get(participation.challengeId),
        expires_at: new Date(invitation.expiresAt)
      }] };
    }

    if (text.includes("FOR UPDATE OF invitations, participations")) {
      const [inviteeUserId, tokenHash, acceptedAt] = (values ?? []).map(String);
      if (!users.has(inviteeUserId)) return { rows: [] };
      const invitation = [...invitations.values()].find((candidate) =>
        candidate.tokenHash === tokenHash && candidate.expiresAt > acceptedAt &&
        candidate.acceptedAt === null && candidate.revokedAt === null
      );
      const participation = invitation
        ? participations.get(invitation.inviterParticipationId)
        : undefined;
      if (!invitation || !participation || participation.status !== "active") return { rows: [] };
      return { rows: [{
        id: invitation.id,
        inviter_user_id: participation.userId,
        challenge_id: participation.challengeId
      }] };
    }

    if (text.includes("INSERT INTO participations")) {
      const [id, userId, challengeId] = (values ?? []).map(String);
      const existing = [...participations.values()].find(
        (participation) => participation.userId === userId && participation.challengeId === challengeId
      );
      if (existing) {
        existing.status = "active";
        existing.completedAt = null;
        return { rows: [{ id: existing.id }] };
      }
      participations.set(id, {
        id,
        userId,
        challengeId,
        status: "active",
        completedAt: null
      });
      return { rows: [{ id }] };
    }

    if (text.includes("UPDATE challenge_invitations") && text.includes("accepted_by_user_id")) {
      const [userId, acceptedAt, invitationId] = (values ?? []).map(String);
      const invitation = invitations.get(invitationId);
      if (
        !invitation || invitation.acceptedAt !== null || invitation.revokedAt !== null ||
        invitation.expiresAt <= acceptedAt
      ) return { rows: [] };
      invitation.acceptedByUserId = userId;
      invitation.acceptedAt = acceptedAt;
      return { rows: [{ id: invitation.id }] };
    }

    throw new Error(`Unerwartete Abfrage: ${text}`);
  };

  const transactionClient: PostgresQueryClient = { query };
  const client: PostgresTransactionalQueryClient = {
    query,
    async transaction<T>(callback: (transaction: PostgresQueryClient) => Promise<T>) {
      transactionCount += 1;
      return callback(transactionClient);
    }
  };

  return {
    client,
    invitations,
    participations,
    queries,
    getTransactionCount: () => transactionCount
  };
}

const invitation = {
  id: "invitation-1",
  inviterParticipationId: "inviter-participation",
  inviterUserId: "inviter",
  tokenHash: "sha256:only-the-hash-is-persisted",
  createdAt: "2026-09-03T10:00:00.000Z",
  expiresAt: "2026-09-10T10:00:00.000Z"
};

test("PostgreSQL-Einladungsadapter schützt Eigentum und persistiert nur den Token-Hash", async () => {
  const { client, invitations, queries } = createClient();
  const repository = new PostgresqlChallengeInvitationRepository(client);

  assert.deepEqual(await repository.create(invitation), { status: "created" });
  assert.deepEqual(await repository.create({ ...invitation, id: "invitation-2" }), {
    status: "token_conflict"
  });
  assert.deepEqual(await repository.create({ ...invitation, id: "invitation-3", inviterUserId: "friend" }), {
    status: "participation_not_available"
  });
  assert.equal(invitations.size, 1);
  assert.equal(invitations.get("invitation-1")?.tokenHash, invitation.tokenHash);

  const insert = queries.find((item) => item.text.includes("WITH eligible_participation"));
  assert.deepEqual(insert?.values, [
    invitation.id,
    invitation.inviterParticipationId,
    invitation.inviterUserId,
    invitation.tokenHash,
    invitation.expiresAt,
    invitation.createdAt
  ]);
  assert.match(insert?.text ?? "", /ON CONFLICT DO NOTHING/);
  assert.equal(JSON.stringify(insert).includes("raw-token"), false);
});

test("PostgreSQL-Einladungsadapter liefert nur aktive, unverbrauchte Links", async () => {
  const { client, participations, invitations } = createClient();
  const repository = new PostgresqlChallengeInvitationRepository(client);
  await repository.create(invitation);

  assert.deepEqual(
    await repository.findActiveByTokenHash(invitation.tokenHash, "2026-09-04T10:00:00.000Z"),
    {
      id: "invitation-1",
      inviterParticipationId: "inviter-participation",
      inviterUserId: "inviter",
      challengeId: "steps",
      challengeSlug: "10000-schritte-am-tag",
      expiresAt: "2026-09-10T10:00:00.000Z"
    }
  );
  assert.equal(await repository.findActiveByTokenHash(invitation.tokenHash, invitation.expiresAt), null);
  participations.get("inviter-participation")!.status = "cancelled";
  assert.equal(
    await repository.findActiveByTokenHash(invitation.tokenHash, "2026-09-04T10:00:00.000Z"),
    null
  );
  participations.get("inviter-participation")!.status = "active";
  invitations.get("invitation-1")!.revokedAt = "2026-09-04T11:00:00.000Z";
  assert.equal(
    await repository.findActiveByTokenHash(invitation.tokenHash, "2026-09-04T10:00:00.000Z"),
    null
  );
});

test("PostgreSQL-Einladungsadapter nimmt atomar an und reaktiviert bestehende Teilnahme", async () => {
  const { client, invitations, participations, queries, getTransactionCount } = createClient();
  const repository = new PostgresqlChallengeInvitationRepository(client);
  await repository.create(invitation);

  assert.deepEqual(await repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "friend",
    participationId: "unused-new-id",
    acceptedAt: "2026-09-04T10:00:00.000Z"
  }), { status: "accepted", participationId: "friend-participation" });
  assert.equal(participations.get("friend-participation")?.status, "active");
  assert.equal(participations.get("friend-participation")?.completedAt, null);
  assert.equal(invitations.get("invitation-1")?.acceptedByUserId, "friend");
  assert.equal(getTransactionCount(), 1);

  const lock = queries.find((item) => item.text.includes("FOR UPDATE OF invitations, participations"));
  assert.deepEqual(lock?.values, [
    "friend", invitation.tokenHash, "2026-09-04T10:00:00.000Z"
  ]);
  const upsert = queries.find((item) => item.text.includes("INSERT INTO participations"));
  assert.match(upsert?.text ?? "", /ON CONFLICT \(user_id, challenge_id\) DO UPDATE/);
});

test("PostgreSQL-Einladungsadapter verhindert Selbstannahme und Wiederverwendung", async () => {
  const { client, participations } = createClient();
  const repository = new PostgresqlChallengeInvitationRepository(client);
  await repository.create(invitation);

  assert.deepEqual(await repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "inviter",
    participationId: "self-participation",
    acceptedAt: "2026-09-04T10:00:00.000Z"
  }), { status: "self_invitation" });
  assert.equal(participations.has("self-participation"), false);

  assert.deepEqual(await repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "new-friend",
    participationId: "new-friend-participation",
    acceptedAt: "2026-09-04T10:01:00.000Z"
  }), { status: "accepted", participationId: "new-friend-participation" });
  assert.deepEqual(await repository.accept({
    tokenHash: invitation.tokenHash,
    inviteeUserId: "friend",
    participationId: "late-participation",
    acceptedAt: "2026-09-04T10:02:00.000Z"
  }), { status: "invitation_not_available" });
  assert.equal(participations.has("late-participation"), false);
});
