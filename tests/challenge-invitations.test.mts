import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  ChallengeInvitationRepository,
  CreateChallengeInvitationInput
} from "../domain/invitations/challenge-invitation-repository.ts";
import {
  acceptChallengeInvitation,
  createChallengeInvitation,
  getChallengeInvitationPreview,
  hashInvitationToken
} from "../lib/challenge-invitations.ts";

function unavailableAcceptance() {
  return { status: "invitation_not_available" } as const;
}

test("Einladung gibt den Roh-Token einmalig aus und persistiert nur seinen Hash", () => {
  const persisted: CreateChallengeInvitationInput[] = [];
  const repository: ChallengeInvitationRepository = {
    create(input) {
      persisted.push(input);
      return { status: "created" };
    },
    findActiveByTokenHash() {
      return null;
    },
    accept: unavailableAcceptance
  };

  const result = createChallengeInvitation(
    {
      inviterParticipationId: "participation-1",
      inviterUserId: "user-1",
      now: new Date("2026-07-15T10:00:00.000Z")
    },
    {
      repository,
      createId: () => "invitation-1",
      createToken: () => "secure-raw-token"
    }
  );

  assert.deepEqual(result, {
    status: "created",
    token: "secure-raw-token",
    expiresAt: "2026-07-22T10:00:00.000Z"
  });
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].tokenHash, hashInvitationToken("secure-raw-token"));
  assert.equal(JSON.stringify(persisted[0]).includes("secure-raw-token"), false);
  assert.equal(persisted[0].inviterUserId, "user-1");
});

test("Einladung erneuert kollidierende Tokens und gibt fremde Teilnahme nicht frei", () => {
  const tokens = ["collision", "fresh-token"];
  let calls = 0;
  const repository: ChallengeInvitationRepository = {
    create() {
      calls += 1;
      return calls === 1 ? { status: "token_conflict" } : { status: "created" };
    },
    findActiveByTokenHash() {
      return null;
    },
    accept: unavailableAcceptance
  };

  const result = createChallengeInvitation(
    { inviterParticipationId: "participation-1", inviterUserId: "user-1" },
    {
      repository,
      createId: () => `invitation-${calls + 1}`,
      createToken: () => tokens.shift() ?? "unused"
    }
  );
  assert.equal(result.status, "created");
  assert.equal(result.status === "created" ? result.token : null, "fresh-token");
  assert.equal(calls, 2);

  const denied = createChallengeInvitation(
    { inviterParticipationId: "foreign", inviterUserId: "user-1" },
    {
      repository: {
        create: () => ({ status: "participation_not_available" }),
        findActiveByTokenHash: () => null,
        accept: unavailableAcceptance
      },
      createId: () => "invitation-denied",
      createToken: () => "never-returned"
    }
  );
  assert.deepEqual(denied, { status: "participation_not_available" });
});

test("Vorschau und Annahme akzeptieren nur 256-Bit-Base64url-Tokens und verwenden den Hash", () => {
  const token = "A".repeat(43);
  let acceptedHash = "";
  const repository: ChallengeInvitationRepository = {
    create: () => ({ status: "created" }),
    findActiveByTokenHash(tokenHash) {
      assert.equal(tokenHash, hashInvitationToken(token));
      return {
        id: "invite-1",
        inviterParticipationId: "participation-1",
        inviterUserId: "inviter",
        challengeId: "steps",
        challengeSlug: "10000-schritte-am-tag",
        expiresAt: "2026-07-22T10:00:00.000Z"
      };
    },
    accept(input) {
      acceptedHash = input.tokenHash;
      return { status: "accepted", participationId: input.participationId };
    }
  };

  assert.equal(
    getChallengeInvitationPreview(token, new Date("2026-07-16T10:00:00.000Z"), repository)?.challengeSlug,
    "10000-schritte-am-tag"
  );
  assert.equal(getChallengeInvitationPreview("zu-kurz", new Date(), repository), null);

  const accepted = acceptChallengeInvitation(
    { token, inviteeUserId: "friend", now: new Date("2026-07-16T10:00:00.000Z") },
    { repository, createId: () => "friend-participation" }
  );
  assert.deepEqual(accepted, { status: "accepted", participationId: "friend-participation" });
  assert.equal(acceptedHash, hashInvitationToken(token));
  assert.deepEqual(
    acceptChallengeInvitation(
      { token: "ungueltig", inviteeUserId: "friend" },
      { repository, createId: () => "unused" }
    ),
    { status: "invitation_not_available" }
  );
});
